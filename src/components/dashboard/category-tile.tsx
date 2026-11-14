import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { TechIcon } from "@/components/tech-icon";
import { skillCategories } from "@/data/skills";
import type { Skill, SkillCategory } from "@/types";

/** Tuile catégorie — module du dashboard "Core Systems" (page d'accueil). */
export function CategoryTile({ category, skills }: { category: SkillCategory; skills: Skill[] }) {
  const meta = skillCategories.find((c) => c.id === category);
  if (!meta) return null;

  const categorySkills = skills.filter((s) => s.category === category);
  const top = categorySkills.slice(0, 3);

  return (
    <Link
      href={`/skills#${category}`}
      className="card-noc group flex flex-col p-5"
      aria-label={`Compétences ${meta.label}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
          <CategoryIcon category={category} className="size-4" />
        </span>
        <ArrowRight
          className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      </div>

      <h3 className="font-display text-sm font-semibold">{meta.label}</h3>
      <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground">
        {top.map((s) => (
          <li key={s.name} className="inline-flex items-center gap-1">
            <TechIcon brand={s.brand} className="size-3" />
            {s.name}
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-border pt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
        {categorySkills.length} technologies
      </p>
    </Link>
  );
}
