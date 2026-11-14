import type { ArticleHeading } from "@/types";

/** Utilitaires markdown : slugs d'ancres, extraction de plan, temps de lecture. */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Extrait le plan (h2/h3) d'un corps markdown, avec ancres stables. */
export function extractHeadings(markdown: string): ArticleHeading[] {
  const headings: ArticleHeading[] = [];
  const lines = markdown.split("\n");
  let inCode = false;

  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (match) {
      const text = match[2].replace(/[#*`]/g, "").trim();
      headings.push({
        id: slugify(text),
        text,
        level: match[1].length === 2 ? 2 : 3,
      });
    }
  }
  return headings;
}

/** Temps de lecture en minutes (200 mots/min), minimum 1. */
export function computeReadingTime(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatArticleDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
