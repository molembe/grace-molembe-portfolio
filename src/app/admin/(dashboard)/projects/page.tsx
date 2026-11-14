import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";
import { ResetButton } from "@/components/admin/reset-button";
import { projectFields } from "@/app/admin/fields";
import { saveProjectAction, deleteProjectAction } from "@/app/admin/actions";
import { getProjects } from "@/lib/content";
import { projectStatusMeta } from "@/data/projects";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  published: "réalisé",
  "in-progress": "en cours",
  experimental: "expérimental",
};

/** Back-office : projets publiés sur /projects (et carte d'accueil si « featured »). */
export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string }>;
}) {
  const { edit, new: isNew } = await searchParams;
  const projects = await getProjects();

  const items: AdminListItem[] = projects.map((p) => ({
    id: p.slug,
    title: p.title,
    subtitle: p.summary,
    meta: `${p.category} · ${p.slug}${p.period ? ` · ${p.period}` : ""}`,
    badge: statusLabels[p.status] ?? p.status,
    fallbackBadge: projectStatusMeta[p.status]?.label,
  }));

  const editing = edit ? projects.find((p) => p.slug === edit) : undefined;
  const showForm = Boolean(editing) || isNew === "1";

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Projets</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Statuts affichés tels quels — un projet « en cours » reste toujours étiqueté comme tel.
          </p>
        </div>
        <ResetButton collection="projects" />
      </section>

      {showForm ? (
        <section className="card-noc p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-semibold">{editing ? `Modifier : ${editing.title}` : "Nouveau projet"}</h3>
            <Link href="/admin/projects" className="text-sm text-muted-foreground hover:text-foreground">
              Annuler
            </Link>
          </div>
          <AdminForm
            fields={projectFields}
            initial={
              editing
                ? {
                    slug: editing.slug,
                    title: editing.title,
                    category: editing.category,
                    status: editing.status,
                    period: editing.period ?? "",
                    featured: Boolean(editing.featured),
                    summary: editing.summary,
                    problem: editing.problem,
                    objectives: editing.objectives.join("\n"),
                    architecture: editing.architecture,
                    diagram: editing.diagram ?? "",
                    stack: editing.stack.join("\n"),
                    challenges: editing.challenges.map((c) => `${c.challenge} => ${c.solution}`).join("\n"),
                    results: editing.results.join("\n"),
                    screenshots: editing.screenshots.join("\n"),
                    github: editing.github ?? "",
                  }
                : {}
            }
            hidden={editing ? { id: editing.slug } : {}}
            action={saveProjectAction}
            submitLabel={editing ? "Mettre à jour le projet" : "Publier le projet"}
            successRedirect="/admin/projects"
          />
        </section>
      ) : (
        <Link
          href="/admin/projects?new=1"
          className="card-noc flex items-center justify-center gap-2 border-dashed p-5 text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
        >
          <Plus className="size-4" aria-hidden /> Ajouter un projet
        </Link>
      )}

      <section>
        <h3 className="mb-4 font-display text-lg font-semibold">Projets existants</h3>
        <AdminList items={items} basePath="/admin/projects" deleteAction={deleteProjectAction} />
      </section>
    </div>
  );
}
