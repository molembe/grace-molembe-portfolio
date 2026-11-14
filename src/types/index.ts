/* Types centralisés du portfolio — miroir des futurs serializers Django REST. */

/* ---------- Projets ---------- */

export type ProjectCategory =
  | "networking"
  | "automation"
  | "virtualization"
  | "devops"
  | "security"
  | "development"
  | "monitoring";

export type ProjectStatus = "published" | "in-progress" | "experimental";

export interface ProjectChallenge {
  challenge: string;
  solution: string;
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  /** Affiché tel quel. Ne jamais présenter un projet en cours comme terminé. */
  status: ProjectStatus;
  /** "2025" — omis si non fourni. */
  period?: string;
  summary: string;
  problem: string;
  objectives: string[];
  architecture: string;
  /** Clé d'une topologie SVG déclarative (components/diagrams/topologies.ts). */
  diagram?: string;
  stack: string[];
  challenges: ProjectChallenge[];
  results: string[];
  /** Chemins sous /public/projects/<slug>/ — slots vides affichés "à fournir". */
  screenshots: string[];
  /** Seulement si l'URL réelle est fournie. */
  github?: string;
  featured?: boolean;
}

/* ---------- Compétences ---------- */

export type SkillCategory =
  | "networking"
  | "system"
  | "automation"
  | "virtualization"
  | "devops"
  | "development"
  | "cybersecurity"
  | "monitoring";

/**
 * Échelle honnête, modifiable dans data/skills.ts :
 * 1 Notions · 2 Bases · 3 Intermédiaire · 4 Avancé · 5 Expert
 */
export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export interface Skill {
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  description: string;
  /** Expérience pratique concrète (lab, stage, projet). */
  practice: string;
  /** Clé de logo de marque optionnelle (registry TechIcon). */
  brand?: string;
}

/* ---------- Parcours ---------- */

export interface TimelineEntry {
  /** Identifiant stable (attribué par le back-office à la première édition). */
  id?: string;
  kind: "education" | "work";
  title: string;
  org: string;
  /** Période réelle — "À préciser" tant que non fournie. */
  period: string;
  highlights: string[];
}

/* ---------- Blog ---------- */

export type ArticleCategory =
  | "networking"
  | "linux-systems"
  | "automation"
  | "devops"
  | "devsecops"
  | "cybersecurity"
  | "ai"
  | "cloud";

export interface ArticleHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface Article {
  slug: string;
  title: string;
  category: ArticleCategory;
  /** Date ISO réelle de rédaction. */
  date: string;
  excerpt: string;
  /** Corps markdown. */
  body: string;
  related?: string[];
}

/* ---------- Laboratoires ---------- */

export type LabKind = "network" | "system";

export interface LabStep {
  title: string;
  body: string;
  /** Extrait de config/commande optionnel. */
  code?: string;
  /** Langage pour la coloration. */
  lang?: string;
}

export interface Lab {
  slug: string;
  kind: LabKind;
  title: string;
  summary: string;
  tags: string[];
  objective: string;
  environment: string[];
  procedure: LabStep[];
  verification: string;
  lessons: string[];
  /** Clé de topologie SVG optionnelle. */
  diagram?: string;
  relatedProject?: string;
}

/* ---------- Diagrammes SVG déclaratifs ---------- */

export type DiagramNodeKind =
  | "router"
  | "switch"
  | "server"
  | "cloud"
  | "firewall"
  | "host"
  | "group";

export interface DiagramNode {
  id: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  sub?: string;
  kind: DiagramNodeKind;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  tone?: "primary" | "accent" | "muted";
}

export interface DiagramGroup {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export interface DiagramSpec {
  id: string;
  title: string;
  description?: string;
  width: number;
  height: number;
  groups?: DiagramGroup[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

/* ---------- Terminal simulé ---------- */

export type TerminalLineTone =
  | "default"
  | "muted"
  | "accent"
  | "primary"
  | "success"
  | "warning"
  | "danger";

export interface TerminalLine {
  tone: TerminalLineTone;
  text: string;
}

/* ---------- Profil éditable (back-office) ---------- */

/**
 * Overrides du profil — chaque champ est optionnel : absent = valeur
 * statique de src/data/site-config.ts. "TBD" reste masqué par la UI.
 */
export interface SiteProfile {
  name?: string;
  shortName?: string;
  initials?: string;
  role?: string;
  roleFr?: string;
  tagline?: string;
  intro?: string;
  objective?: string;
  availability?: string;
  location?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  /** Bouton CV activé (fichier public/documents/cv.pdf présent). */
  cvAvailable?: boolean;
}

/** Config du site fusionnée (statique + overrides back-office). */
export interface SiteConfig {
  name: string;
  shortName: string;
  initials: string;
  role: string;
  roleFr: string;
  tagline: string;
  intro: string;
  objective: string;
  availability: string;
  location: string;
  contact: { email: string };
  social: { github: string; linkedin: string };
  cv: { file: string; available: boolean };
  url: string;
  version: string;
}

/* ---------- Contact ---------- */

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Champ honeypot — doit rester vide. */
  company?: string;
  /** Timestamp (ms) au montage du formulaire, anti-bot. */
  startedAt: number;
}
