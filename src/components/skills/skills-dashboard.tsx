"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SkillCard } from "@/components/skills/skill-card";
import { CategoryIcon } from "@/components/category-icon";
import { skillCategories } from "@/data/skills";
import type { Skill, SkillCategory } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Dashboard des compétences — filtres par catégorie + recherche instantanée.
 * Les niveaux viennent de data/skills.ts (modifiables, échelle honnête 1-5).
 */
export function SkillsDashboard({ skills }: { skills: Skill[] }) {
  const [active, setActive] = useState<SkillCategory | "all">("all");
  const [query, setQuery] = useState("");

  /* Prend en charge /skills#automation au chargement (après hydratation). */
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash || !skillCategories.some((c) => c.id === hash)) return;
    const id = requestAnimationFrame(() => setActive(hash as SkillCategory));
    return () => cancelAnimationFrame(id);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((skill) => {
      const matchCategory = active === "all" || skill.category === active;
      const matchQuery =
        !q ||
        skill.name.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.practice.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [skills, active, query]);

  const grouped = useMemo(() => {
    return skillCategories
      .map((cat) => ({ cat, items: filtered.filter((s) => s.category === cat.id) }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <div>
      {/* Contrôles */}
      <div className="mb-10 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une technologie (ex. Ansible, VRF…)"
            aria-label="Rechercher une compétence"
            className="h-10 w-full rounded-lg border border-input bg-surface pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent/50"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
          <FilterChip active={active === "all"} onClick={() => setActive("all")}>
            Tout
          </FilterChip>
          {skillCategories.map((cat) => (
            <FilterChip key={cat.id} active={active === cat.id} onClick={() => setActive(cat.id)}>
              <CategoryIcon category={cat.id} className="size-3.5" />
              {cat.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Résultats par catégorie */}
      {grouped.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Aucune compétence ne correspond à cette recherche.
        </p>
      )}

      <div className="space-y-12">
        {grouped.map(({ cat, items }) => (
          <section key={cat.id} id={cat.id} aria-labelledby={`cat-${cat.id}`} className="scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`cat-${cat.id}`} className="flex items-center gap-2.5 font-display text-lg font-semibold">
                <CategoryIcon category={cat.id} className="size-4 text-accent" />
                {cat.label}
                <span className="font-mono text-xs text-muted-foreground">({items.length})</span>
              </h2>
              <p className="text-xs text-muted-foreground">{cat.blurb}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((skill) => (
                <SkillCard key={`${skill.category}-${skill.name}`} skill={skill} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 font-mono text-xs transition-colors",
        active
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-border bg-surface text-muted-foreground hover:border-accent/30 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
