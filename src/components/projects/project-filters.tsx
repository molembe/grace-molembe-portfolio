"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { ProjectCard } from "@/components/projects/project-card";
import { projectCategories, projectStatusMeta } from "@/data/projects";
import type { Project, ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";

/** Recherche + filtres catégorie/statut, grille animée. */
export function ProjectFilters({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.stack.some((t) => t.toLowerCase().includes(q));
      const matchCategory = category === "all" || p.category === category;
      const matchStatus = status === "all" || p.status === status;
      return matchQuery && matchCategory && matchStatus;
    });
  }, [projects, query, category, status]);

  return (
    <div>
      {/* Recherche */}
      <div className="relative mb-6 max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un projet ou une technologie (ex. Ansible, PKI…)"
          aria-label="Rechercher un projet"
          className="h-10 w-full rounded-lg border border-input bg-surface pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent/50"
        />
      </div>

      {/* Filtres catégorie */}
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
        {projectCategories.map((cat) => (
          <FilterChip key={cat.id} active={category === cat.id} onClick={() => setCategory(cat.id)}>
            {cat.label}
          </FilterChip>
        ))}
      </div>

      {/* Filtres statut */}
      <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filtrer par statut">
        <FilterChip active={status === "all"} onClick={() => setStatus("all")}>
          Tous les statuts
        </FilterChip>
        {(Object.keys(projectStatusMeta) as ProjectStatus[]).map((s) => (
          <FilterChip key={s} active={status === s} onClick={() => setStatus(s)}>
            <span className="status-dot bg-current" aria-hidden />
            {projectStatusMeta[s].label}
          </FilterChip>
        ))}
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Aucun projet ne correspond à ces critères.
        </p>
      ) : (
        <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.slug}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <p className="mt-6 font-mono text-xs text-muted-foreground" aria-live="polite">
        {filtered.length} projet(s) affiché(s) sur {projects.length}
      </p>
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
