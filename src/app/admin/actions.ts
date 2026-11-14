"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  adminEnabled,
  checkPassword,
  clearSessionCookie,
  clientIp,
  isAuthenticated,
  setSessionCookie,
} from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  clearCollection,
  deleteMessage,
  deleteProfilePhoto,
  readCollection,
  saveProfilePhoto,
  writeCollection,
  type CollectionName,
} from "@/lib/store";
import {
  getArticles,
  getProjects,
  getSiteConfig,
  getSkills,
  getTimeline,
} from "@/lib/content";
import type {
  Article,
  Project,
  ProjectCategory,
  ProjectStatus,
  Skill,
  SkillCategory,
  SkillLevel,
  TimelineEntry,
} from "@/types";

/**
 * SERVER ACTIONS DU BACK-OFFICE.
 *
 * Sécurité : chaque mutation vérifie la session admin ; le login est rate
 * limité (10 essais / 15 min / IP). Les écritures passent par les schémas
 * zod ci-dessous, puis revalident TOUT le site (revalidatePath racine+layout)
 * pour que l'interface vitrine reflète immédiatement les changements.
 */

export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
} | null;

async function guard(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Session admin invalide — reconnectez-vous.");
  }
}

/** Marque tout le site (pages publiques + layout) à régénérer. */
function refreshSite(): void {
  revalidatePath("/", "layout");
}

/* ============================================================
 * Connexion / déconnexion
 * ============================================================ */

const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!adminEnabled()) {
    return {
      ok: false,
      message: "Back-office désactivé : définissez ADMIN_PASSWORD (8 caractères minimum) dans l'environnement.",
    };
  }

  const ip = await clientIp();
  if (rateLimit(`login:${ip}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)) {
    return {
      ok: false,
      message: "Trop de tentatives. Réessayez dans quelques minutes.",
    };
  }

  const password = String(formData.get("password") ?? "");
  if (password.length === 0) {
    return { ok: false, errors: { password: "Mot de passe requis." } };
  }
  if (!checkPassword(password)) {
    // Message volontairement générique (pas d'indice sur la cause).
    return { ok: false, message: "Identifiants invalides." };
  }

  await setSessionCookie();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}

/* ============================================================
 * Helpers de parsing / persistance
 * ============================================================ */

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** Textarea "une entrée par ligne" -> string[]. */
function lines(formData: FormData, key: string): string[] {
  return str(formData, key)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function checkbox(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Assigne un id stable à chaque entrée qui n'en a pas encore. */
function withStableIds<T>(entries: T[], idOf: (entry: T, index: number) => string): (T & { id: string })[] {
  return entries.map((entry, index) => ({ ...entry, id: (entry as { id?: string }).id ?? idOf(entry, index) }));
}

/* ============================================================
 * Profil (identité, coordonnées, CV, photo)
 * ============================================================ */

const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  shortName: z.string().trim().min(2).max(60),
  initials: z.string().trim().min(1).max(4),
  role: z.string().trim().min(2).max(120),
  roleFr: z.string().trim().min(2).max(160),
  tagline: z.string().trim().min(4).max(160),
  intro: z.string().trim().min(20).max(600),
  objective: z.string().trim().min(10).max(300),
  availability: z.string().trim().min(2).max(80),
  location: z.string().trim().max(80),
  email: z.string().trim().max(120),
  github: z.string().trim().max(200),
  linkedin: z.string().trim().max(200),
  cvAvailable: z.boolean(),
});

export async function saveProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await guard();

  const candidate = {
    name: str(formData, "name"),
    shortName: str(formData, "shortName"),
    initials: str(formData, "initials").toUpperCase(),
    role: str(formData, "role"),
    roleFr: str(formData, "roleFr"),
    tagline: str(formData, "tagline"),
    intro: str(formData, "intro"),
    objective: str(formData, "objective"),
    availability: str(formData, "availability"),
    location: str(formData, "location"),
    email: str(formData, "email"),
    github: str(formData, "github"),
    linkedin: str(formData, "linkedin"),
    cvAvailable: checkbox(formData, "cvAvailable"),
  };

  // email / github / linkedin : "TBD" autorisé (valeur masquée), sinon format vérifié.
  const parsed = profileSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, message: "Certains champs sont invalides.", errors: fieldErrors(parsed.error) };
  }

  for (const [key, pattern, label] of [
    ["email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "e-mail"],
    ["github", /^https:\/\/github\.com\/[\w.-]+\/?$/, "URL GitHub (https://github.com/...)"],
    ["linkedin", /^https:\/\/(www\.)?linkedin\.com\/in\/[\w%-]+\/?$/, "URL LinkedIn (https://linkedin.com/in/...)"],
  ] as const) {
    const value = candidate[key];
    if (value && value !== "TBD" && !pattern.test(value)) {
      return { ok: false, errors: { [key]: `${label} : format invalide (ou laissez "TBD").` } };
    }
  }

  await writeCollection("profile", candidate);
  refreshSite();
  return { ok: true, message: "Profil enregistré — site mis à jour." };
}

const PHOTO_MAX_BYTES = 4 * 1024 * 1024; // 4 Mo
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function savePhotoAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await guard();

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, errors: { photo: "Sélectionnez un fichier image." } };
  }
  if (!PHOTO_TYPES.includes(file.type)) {
    return { ok: false, errors: { photo: "Formats acceptés : JPEG, PNG ou WebP." } };
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return { ok: false, errors: { photo: "Fichier trop lourd (4 Mo maximum)." } };
  }

  try {
    await saveProfilePhoto(file);
  } catch {
    return { ok: false, message: "Échec de l'enregistrement. Réessayez." };
  }
  refreshSite();
  return { ok: true, message: "Photo mise à jour." };
}

export async function deletePhotoAction(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  await guard();
  await deleteProfilePhoto();
  refreshSite();
  return { ok: true, message: "Photo supprimée — le monogramme réapparaît." };
}

/** Réinitialise une collection (retour aux données statiques du code). */
export async function resetCollectionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await guard();
  const collection = String(formData.get("collection") ?? "") as CollectionName;
  const allowed: CollectionName[] = ["profile", "experiences", "projects", "skills", "articles"];
  if (!allowed.includes(collection)) {
    return { ok: false, message: "Collection inconnue." };
  }
  await clearCollection(collection);
  refreshSite();
  return { ok: true, message: "Valeurs par défaut du code restaurées." };
}

/* ============================================================
 * Parcours (expériences & formation)
 * ============================================================ */

const timelineSchema = z.object({
  kind: z.enum(["education", "work"]),
  title: z.string().trim().min(3, "Titre trop court (3 caractères minimum).").max(140),
  org: z.string().trim().min(2, "Organisme requis.").max(120),
  period: z.string().trim().min(2, "Période requise (ex. « 2024 — 2025 » ou « Période à préciser »).").max(60),
  highlights: z.array(z.string().min(1)).min(1, "Ajoutez au moins un point (une ligne = un point).").max(12),
});

export async function saveTimelineAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await guard();

  const id = str(formData, "id");
  const candidate = {
    kind: str(formData, "kind"),
    title: str(formData, "title"),
    org: str(formData, "org"),
    period: str(formData, "period"),
    highlights: lines(formData, "highlights"),
  };

  const parsed = timelineSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, message: "Certains champs sont invalides.", errors: fieldErrors(parsed.error) };
  }

  const current = await getTimeline();
  const list = withStableIds(current, (e) => slugify(`${e.kind}-${e.title}`) || `entree-${Date.now()}`);

  if (id) {
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) return { ok: false, message: "Entrée introuvable (peut-être déjà supprimée)." };
    list[index] = { ...parsed.data, id };
  } else {
    const newId = slugify(`${parsed.data.kind}-${parsed.data.title}`) || `entree-${Date.now()}`;
    if (list.some((e) => e.id === newId)) {
      return { ok: false, errors: { title: "Une entrée avec un titre identique existe déjà." } };
    }
    list.unshift({ ...parsed.data, id: newId }); // la plus récente en premier
  }

  await writeCollection("experiences", list);
  refreshSite();
  return { ok: true, message: id ? "Entrée mise à jour — site régénéré." : "Nouvelle entrée ajoutée — site régénéré." };
}

export async function deleteTimelineAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await guard();
  const id = str(formData, "id");
  const current = await getTimeline();
  const list = withStableIds(current, (e) => slugify(`${e.kind}-${e.title}`)).filter((e) => e.id !== id);
  if (list.length === current.length) return { ok: false, message: "Entrée introuvable." };
  await writeCollection("experiences", list);
  refreshSite();
  return { ok: true, message: "Entrée supprimée." };
}

/* ============================================================
 * Projets
 * ============================================================ */

const projectCategories: ProjectCategory[] = [
  "networking",
  "automation",
  "virtualization",
  "devops",
  "security",
  "development",
  "monitoring",
];
const projectStatuses: ProjectStatus[] = ["published", "in-progress", "experimental"];

const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug : lettres minuscules et tirets (ex. mon-projet)."),
  title: z.string().trim().min(3).max(140),
  category: z.enum(projectCategories),
  status: z.enum(projectStatuses),
  period: z.string().trim().max(40),
  summary: z.string().trim().min(20, "Résumé trop court (20 caractères minimum).").max(500),
  problem: z.string().trim().min(20).max(2000),
  objectives: z.array(z.string().min(1)).min(1).max(10),
  architecture: z.string().trim().min(20).max(2000),
  diagram: z.string().trim().max(60),
  stack: z.array(z.string().min(1)).min(1).max(15),
  challenges: z.array(z.object({ challenge: z.string().min(1), solution: z.string().min(1) })).max(10),
  results: z.array(z.string().min(1)).min(1).max(10),
  screenshots: z.array(z.string().min(1)).max(10),
  github: z.string().trim().max(200),
  featured: z.boolean(),
});

/** "Défi => Solution" par ligne. */
function parseChallenges(formData: FormData): { data: { challenge: string; solution: string }[]; error?: string } {
  const raw = lines(formData, "challenges");
  const data: { challenge: string; solution: string }[] = [];
  for (const line of raw) {
    const sep = line.indexOf("=>");
    if (sep === -1) {
      return { data: [], error: "Chaque ligne doit contenir « => » entre le défi et la solution." };
    }
    const challenge = line.slice(0, sep).trim();
    const solution = line.slice(sep + 2).trim();
    if (!challenge || !solution) {
      return { data: [], error: "Défi et solution ne doivent pas être vides." };
    }
    data.push({ challenge, solution });
  }
  return { data };
}

export async function saveProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await guard();

  const id = str(formData, "id"); // id = slug
  const challenges = parseChallenges(formData);
  if (challenges.error) {
    return { ok: false, errors: { challenges: challenges.error } };
  }

  const candidate = {
    slug: str(formData, "slug"),
    title: str(formData, "title"),
    category: str(formData, "category"),
    status: str(formData, "status"),
    period: str(formData, "period"),
    summary: str(formData, "summary"),
    problem: str(formData, "problem"),
    objectives: lines(formData, "objectives"),
    architecture: str(formData, "architecture"),
    diagram: str(formData, "diagram"),
    stack: lines(formData, "stack"),
    challenges: challenges.data,
    results: lines(formData, "results"),
    screenshots: lines(formData, "screenshots"),
    github: str(formData, "github"),
    featured: checkbox(formData, "featured"),
  };

  if (candidate.github && !/^https:\/\/github\.com\/[\w.-]+/.test(candidate.github)) {
    return { ok: false, errors: { github: "URL GitHub invalide (https://github.com/...) — laissez vide si absent." } };
  }

  const parsed = projectSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, message: "Certains champs sont invalides.", errors: fieldErrors(parsed.error) };
  }

  const project: Project = {
    ...parsed.data,
    ...(parsed.data.period ? { period: parsed.data.period } : {}),
    ...(parsed.data.diagram ? { diagram: parsed.data.diagram } : {}),
    ...(parsed.data.github ? { github: parsed.data.github } : {}),
    ...(parsed.data.featured ? { featured: true } : {}),
  };

  const current = await getProjects();
  if (id) {
    const index = current.findIndex((p) => p.slug === id);
    if (index === -1) return { ok: false, message: "Projet introuvable." };
    if (project.slug !== id && current.some((p) => p.slug === project.slug)) {
      return { ok: false, errors: { slug: "Ce slug est déjà utilisé par un autre projet." } };
    }
    const list = [...current];
    list[index] = project;
    await writeCollection("projects", list);
  } else {
    if (current.some((p) => p.slug === project.slug)) {
      return { ok: false, errors: { slug: "Ce slug existe déjà — choisissez-en un autre." } };
    }
    await writeCollection("projects", [project, ...current]);
  }

  refreshSite();
  return { ok: true, message: id ? "Projet mis à jour — site régénéré." : "Projet publié — visible sur le site." };
}

export async function deleteProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await guard();
  const slug = str(formData, "id");
  const current = await getProjects();
  const list = current.filter((p) => p.slug !== slug);
  if (list.length === current.length) return { ok: false, message: "Projet introuvable." };
  await writeCollection("projects", list);
  refreshSite();
  return { ok: true, message: "Projet supprimé." };
}

/* ============================================================
 * Compétences
 * ============================================================ */

const skillCategories: SkillCategory[] = [
  "networking",
  "system",
  "automation",
  "virtualization",
  "devops",
  "development",
  "cybersecurity",
  "monitoring",
];

const skillSchema = z.object({
  name: z.string().trim().min(1, "Nom requis.").max(60),
  category: z.enum(skillCategories),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  description: z.string().trim().min(10, "Décrivez la compétence (10 caractères minimum).").max(300),
  practice: z.string().trim().min(10, "Pratique concrète requise (10 caractères minimum).").max(400),
  brand: z.string().trim().max(40),
});

export async function saveSkillAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await guard();

  const id = str(formData, "id"); // id = "categorie/nom-sluggifiée"
  const level = Number(str(formData, "level"));
  const candidate = {
    name: str(formData, "name"),
    category: str(formData, "category"),
    level: Number.isInteger(level) && level >= 1 && level <= 5 ? (level as SkillLevel) : 0,
    description: str(formData, "description"),
    practice: str(formData, "practice"),
    brand: str(formData, "brand"),
  };

  const parsed = skillSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, message: "Certains champs sont invalides.", errors: fieldErrors(parsed.error) };
  }

  const skill: Skill = {
    name: parsed.data.name,
    category: parsed.data.category,
    level: parsed.data.level,
    description: parsed.data.description,
    practice: parsed.data.practice,
    ...(parsed.data.brand ? { brand: parsed.data.brand } : {}),
  };
  const newId = `${skill.category}/${slugify(skill.name)}`;

  const current = await getSkills();
  if (id) {
    const index = current.findIndex((s) => `${s.category}/${slugify(s.name)}` === id);
    if (index === -1) return { ok: false, message: "Compétence introuvable." };
    const list = [...current];
    list[index] = skill;
    await writeCollection("skills", list);
  } else {
    if (current.some((s) => `${s.category}/${slugify(s.name)}` === newId)) {
      return { ok: false, errors: { name: "Cette compétence existe déjà dans cette catégorie." } };
    }
    await writeCollection("skills", [...current, skill]);
  }

  refreshSite();
  return { ok: true, message: id ? "Compétence mise à jour." : "Compétence ajoutée." };
}

export async function deleteSkillAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await guard();
  const id = str(formData, "id"); // "categorie/nom"
  const separator = id.indexOf("/");
  const cat = id.slice(0, separator);
  const name = id.slice(separator + 1);
  const current = await getSkills();
  const list = current.filter((s) => !(s.category === cat && slugify(s.name) === name));
  if (list.length === current.length) return { ok: false, message: "Compétence introuvable." };
  await writeCollection("skills", list);
  refreshSite();
  return { ok: true, message: "Compétence supprimée." };
}

/* ============================================================
 * Articles du blog
 * ============================================================ */

const articleCategories = [
  "networking",
  "linux-systems",
  "automation",
  "devops",
  "devsecops",
  "cybersecurity",
  "ai",
  "cloud",
] as const;

const articleSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug : lettres minuscules et tirets."),
  title: z.string().trim().min(5).max(160),
  category: z.enum(articleCategories),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Date attendue au format AAAA-MM-JJ."),
  excerpt: z.string().trim().min(20).max(400),
  body: z.string().trim().min(50, "Corps de l'article trop court (50 caractères minimum).").max(40000),
  related: z.array(z.string().min(1)).max(6),
});

export async function saveArticleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await guard();

  const id = str(formData, "id"); // id = slug
  const candidate = {
    slug: str(formData, "slug"),
    title: str(formData, "title"),
    category: str(formData, "category"),
    date: str(formData, "date"),
    excerpt: str(formData, "excerpt"),
    body: str(formData, "body"),
    related: lines(formData, "related"),
  };

  const parsed = articleSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, message: "Certains champs sont invalides.", errors: fieldErrors(parsed.error) };
  }

  const article: Article = {
    ...parsed.data,
    ...(parsed.data.related.length ? { related: parsed.data.related } : {}),
  };

  const current = await getArticles();
  const ordered = [...current].sort((a, b) => b.date.localeCompare(a.date)); // ordre d'affichage
  if (id) {
    const index = ordered.findIndex((a) => a.slug === id);
    if (index === -1) return { ok: false, message: "Article introuvable." };
    if (article.slug !== id && ordered.some((a) => a.slug === article.slug)) {
      return { ok: false, errors: { slug: "Ce slug est déjà utilisé." } };
    }
    ordered[index] = article;
    await writeCollection("articles", ordered);
  } else {
    if (ordered.some((a) => a.slug === article.slug)) {
      return { ok: false, errors: { slug: "Ce slug existe déjà — choisissez-en un autre." } };
    }
    await writeCollection("articles", [article, ...ordered]);
  }

  refreshSite();
  return { ok: true, message: id ? "Article mis à jour." : "Article publié — visible sur le blog." };
}

export async function deleteArticleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await guard();
  const slug = str(formData, "id");
  const current = await getArticles();
  const list = current.filter((a) => a.slug !== slug);
  if (list.length === current.length) return { ok: false, message: "Article introuvable." };
  await writeCollection("articles", list);
  refreshSite();
  return { ok: true, message: "Article supprimé." };
}

/* ============================================================
 * Messages de contact
 * ============================================================ */

export async function deleteMessageAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await guard();
  const receivedAt = str(formData, "id");
  if (!receivedAt) return { ok: false, message: "Message introuvable." };
  await deleteMessage(receivedAt);
  revalidatePath("/admin/messages");
  return { ok: true, message: "Message supprimé." };
}
