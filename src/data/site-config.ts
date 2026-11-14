/**
 * Configuration du site — UNIQUE source de vérité pour l'identité et les coordonnées.
 *
 * RÈGLE D'HONNÊTETÉ : les valeurs "TBD" ne sont jamais affichées.
 * Les boutons/liens concernés sont masqués tant que les vraies valeurs ne sont pas fournies.
 * Remplacer les TBD puis passer les flags correspondants à true.
 */

export const siteConfig = {
  name: "Grace à Dieu MOLEMBE",
  shortName: "G. Molembe",
  initials: "GM",
  role: "Network & Systems Engineer",
  roleFr: "Ingénieur en Réseaux et Systèmes Informatiques",
  tagline: "Infrastructure Automation · Linux · DevSecOps · Cybersecurity",
  intro:
    "Ingénieur en Génie Informatique, spécialisé en Réseaux et Systèmes Informatiques. Je conçois, déploie, automatise et sécurise des infrastructures fiables, évolutives et documentées.",
  objective:
    "Développer des infrastructures fiables, automatisées, sécurisées et évolutives.",
  availability: "À l'écoute d'opportunités",
  location: "TBD", // ex. "Kinshasa, RDC"

  contact: {
    /** Remplacer par l'email réel. Masqué tant que TBD. */
    email: "TBD",
  },

  social: {
    /** Remplacer par les URLs réelles. Masqués tant que TBD. */
    github: "TBD",
    linkedin: "TBD",
  },

  cv: {
    /** Fichier attendu : public/documents/cv.pdf — passer available à true après dépôt. */
    file: "/documents/cv.pdf",
    available: false,
  },

  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  version: "1.0.0",
} as const;

export function isConfigured(value: string | undefined | null): boolean {
  return Boolean(value && value !== "TBD");
}

export function hasEmail(): boolean {
  return isConfigured(siteConfig.contact.email);
}

export function hasGithub(): boolean {
  return isConfigured(siteConfig.social.github);
}

export function hasLinkedin(): boolean {
  return isConfigured(siteConfig.social.linkedin);
}

/** Libellés de navigation (langue mixte FR+EN choisie : chrome EN, contenu FR). */
export const navLinks = [
  { href: "/about", label: "About" },
  { href: "/skills", label: "Skills" },
  { href: "/projects", label: "Projects" },
  { href: "/network-lab", label: "Network Lab" },
  { href: "/system-lab", label: "System Lab" },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Blog" },
] as const;
