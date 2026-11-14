import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusBadge, TechTag } from "@/components/ui/kit";
import { CategoryIcon } from "@/components/category-icon";
import type { Project } from "@/types";
import { projectCategoryLabels } from "@/components/projects/labels";

/** Carte projet — statut honnête, résumé, tags, lien vers le détail. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="card-noc group flex h-full flex-col p-6"
      aria-label={`Projet : ${project.title}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-accent">
          <CategoryIcon category={project.category} className="size-4" />
        </span>
        <StatusBadge status={project.status} />
      </div>

      <h3 className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-accent">
        {project.title}
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{project.summary}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.stack.slice(0, 4).map((tech) => (
          <TechTag key={tech}>{tech}</TechTag>
        ))}
        {project.stack.length > 4 && <TechTag>+{project.stack.length - 4}</TechTag>}
      </div>

      <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-accent">
        {projectCategoryLabels[project.category]}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </p>
    </Link>
  );
}
