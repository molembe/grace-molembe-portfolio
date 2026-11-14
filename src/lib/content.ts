import { cache } from "react";
import { projects as staticProjects } from "@/data/projects";
import { skills as staticSkills } from "@/data/skills";
import { timeline as staticTimeline } from "@/data/experience";
import { labs } from "@/data/labs";
import { articles as staticArticles } from "@/content/blog";
import { siteConfig as staticSiteConfig } from "@/data/site-config";
import {
  readCollection,
  getProfilePhoto as storeGetProfilePhoto,
  type ProfilePhotoInfo,
} from "@/lib/store";
import type {
  Article,
  ArticleCategory,
  Lab,
  LabKind,
  Project,
  Skill,
  SkillCategory,
  SiteConfig,
  SiteProfile,
  TimelineEntry,
} from "@/types";

/**
 * REPOSITORY DE CONTENU — point d'accès unique aux données.
 *
 * Priorité de lecture :
 *   1. Overrides du back-office (.data/content/*.json, écrits via /admin)
 *   2. Données statiques de src/data + src/content (valeurs par défaut)
 *
 * Demain : si NEXT_PUBLIC_API_URL est défini, ces fonctions pourront
 * interroger l'API Django REST Framework, sans toucher aux composants
 * (les types de src/types restent le contrat).
 *
 * Les getters relatifs aux collections éditables sont ASYNCHRONES (FS) ;
 * getLabs/getLab restent synchrones (labs non éditables via le back-office).
 */

/* ---------------- Site & profil ---------------- */

/**
 * SiteConfig fusionnée : les champs modifiés dans /admin/profile écrasent
 * les valeurs statiques. Les valeurs "TBD" restent masquées par la UI.
 */
export const getSiteConfig = cache(async function getSiteConfig(): Promise<SiteConfig> {
  const profile = (await readCollection<SiteProfile>("profile")) ?? {};
  const p = (key: keyof SiteProfile, fallback: string): string =>
    typeof profile[key] === "string" && (profile[key] as string).length > 0
      ? (profile[key] as string)
      : fallback;

  return {
    name: p("name", staticSiteConfig.name),
    shortName: p("shortName", staticSiteConfig.shortName),
    initials: p("initials", staticSiteConfig.initials),
    role: p("role", staticSiteConfig.role),
    roleFr: p("roleFr", staticSiteConfig.roleFr),
    tagline: p("tagline", staticSiteConfig.tagline),
    intro: p("intro", staticSiteConfig.intro),
    objective: p("objective", staticSiteConfig.objective),
    availability: p("availability", staticSiteConfig.availability),
    location: p("location", staticSiteConfig.location),
    contact: {
      email: p("email", staticSiteConfig.contact.email),
    },
    social: {
      github: p("github", staticSiteConfig.social.github),
      linkedin: p("linkedin", staticSiteConfig.social.linkedin),
    },
    cv: {
      file: staticSiteConfig.cv.file,
      available:
        typeof profile.cvAvailable === "boolean"
          ? profile.cvAvailable
          : staticSiteConfig.cv.available,
    },
    url: staticSiteConfig.url,
    version: staticSiteConfig.version,
  };
});

/* Helpers d'honnêteté — réexportés (opèrent sur la config statique ; les
   pages utilisent isConfigured(config.x) avec la config fusionnée). */
export { siteConfig as staticSiteConfig, isConfigured, navLinks } from "@/data/site-config";

/** Photo de profil uploadée via /admin (null => placeholder monogramme). */
export async function getProfilePhoto(): Promise<ProfilePhotoInfo | null> {
  return storeGetProfilePhoto();
}

/* ---------------- Projets ---------------- */

export async function getProjects(): Promise<Project[]> {
  const override = await readCollection<Project[]>("projects");
  return override ?? staticProjects;
}

export async function getFeaturedProjects(count = 3): Promise<Project[]> {
  const all = await getProjects();
  return all.filter((p) => p.featured).slice(0, count);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug);
}

/* ---------------- Compétences ---------------- */

export async function getSkills(): Promise<Skill[]> {
  const override = await readCollection<Skill[]>("skills");
  return override ?? staticSkills;
}

export async function getSkillsByCategory(category: SkillCategory): Promise<Skill[]> {
  const all = await getSkills();
  return all.filter((s) => s.category === category);
}

/* ---------------- Parcours ---------------- */

export async function getTimeline(): Promise<TimelineEntry[]> {
  const override = await readCollection<TimelineEntry[]>("experiences");
  return override ?? staticTimeline;
}

/* ---------------- Laboratoires (statiques — non éditables via /admin) ---------------- */

export function getLabs(kind?: LabKind): Lab[] {
  return kind ? labs.filter((l) => l.kind === kind) : labs;
}

export function getLab(kind: LabKind, slug: string): Lab | undefined {
  return labs.find((l) => l.kind === kind && l.slug === slug);
}

/* ---------------- Articles ---------------- */

export async function getArticles(category?: ArticleCategory): Promise<Article[]> {
  const override = await readCollection<Article[]>("articles");
  const source = override ?? staticArticles;
  const sorted = [...source].sort((a, b) => b.date.localeCompare(a.date));
  return category ? sorted.filter((a) => a.category === category) : sorted;
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  const all = await getArticles();
  return all.find((a) => a.slug === slug);
}

export async function getRelatedArticles(article: Article, count = 2): Promise<Article[]> {
  const all = await getArticles();
  const pool = all.filter(
    (a) => a.slug !== article.slug && (a.category === article.category || a.related?.includes(article.slug))
  );
  if (pool.length >= count) return pool.slice(0, count);
  const fallback = all
    .filter((a) => a.slug !== article.slug && !pool.includes(a))
    .slice(0, count - pool.length);
  return [...pool, ...fallback];
}

/* ---------------- Statistiques réelles (calculées, jamais inventées) ---------------- */

export async function getStats() {
  const [projects, skills, articles] = await Promise.all([getProjects(), getSkills(), getArticles()]);
  return {
    projects: projects.length,
    skills: skills.length,
    skillCategories: new Set(skills.map((s) => s.category)).size,
    labs: labs.length,
    articles: articles.length,
  };
}

/* ---------------- Données du terminal simulé ---------------- */

export interface TerminalData {
  config: {
    name: string;
    role: string;
    intro: string;
    tagline: string;
    email: string;
    github: string;
    linkedin: string;
  };
  skills: Skill[];
  projects: Project[];
  timeline: TimelineEntry[];
}

/** Snapshot serveur pour les composants clients (terminal, palette). */
export async function getTerminalData(): Promise<TerminalData> {
  const [config, skills, projects, timeline] = await Promise.all([
    getSiteConfig(),
    getSkills(),
    getProjects(),
    getTimeline(),
  ]);
  return {
    config: {
      name: config.name,
      role: config.role,
      intro: config.intro,
      tagline: config.tagline,
      email: config.contact.email,
      github: config.social.github,
      linkedin: config.social.linkedin,
    },
    skills,
    projects,
    timeline,
  };
}
