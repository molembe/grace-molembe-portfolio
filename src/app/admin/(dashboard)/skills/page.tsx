import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";
import { ResetButton } from "@/components/admin/reset-button";
import { skillFields } from "@/app/admin/fields";
import { saveSkillAction, deleteSkillAction } from "@/app/admin/actions";
import { getSkills } from "@/lib/content";
import { skillLevelLabels } from "@/data/skills";

export const dynamic = "force-dynamic";

/** Back-office : compétences du dashboard /skills. */
export default async function AdminSkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string }>;
}) {
  const { edit, new: isNew } = await searchParams;
  const skills = await getSkills();

  const idOf = (category: string, name: string) => `${category}/${slugifyLite(name)}`;

  const items: AdminListItem[] = skills.map((s) => ({
    id: idOf(s.category, s.name),
    title: s.name,
    subtitle: s.description,
    meta: s.practice,
    badge: `${s.category} · niveau ${s.level}`,
    fallbackBadge: skillLevelLabels[s.level],
  }));

  const editing = edit ? skills.find((s) => idOf(s.category, s.name) === edit) : undefined;
  const showForm = Boolean(editing) || isNew === "1";

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Compétences</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Échelle honnête : 1 Notions · 2 Bases · 3 Intermédiaire · 4 Avancé · 5 Expert. Chaque niveau
            doit être justifié par une pratique réelle (lab, stage, projet).
          </p>
        </div>
        <ResetButton collection="skills" />
      </section>

      {showForm ? (
        <section className="card-noc p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-semibold">{editing ? `Modifier : ${editing.name}` : "Nouvelle compétence"}</h3>
            <Link href="/admin/skills" className="text-sm text-muted-foreground hover:text-foreground">
              Annuler
            </Link>
          </div>
          <AdminForm
            fields={skillFields}
            initial={
              editing
                ? {
                    name: editing.name,
                    category: editing.category,
                    level: String(editing.level),
                    brand: editing.brand ?? "",
                    description: editing.description,
                    practice: editing.practice,
                  }
                : {}
            }
            hidden={editing ? { id: idOf(editing.category, editing.name) } : {}}
            action={saveSkillAction}
            submitLabel={editing ? "Mettre à jour" : "Ajouter la compétence"}
            successRedirect="/admin/skills"
          />
        </section>
      ) : (
        <Link
          href="/admin/skills?new=1"
          className="card-noc flex items-center justify-center gap-2 border-dashed p-5 text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
        >
          <Plus className="size-4" aria-hidden /> Ajouter une compétence
        </Link>
      )}

      <section>
        <h3 className="mb-4 font-display text-lg font-semibold">Compétences existantes</h3>
        <AdminList items={items} basePath="/admin/skills" deleteAction={deleteSkillAction} />
      </section>
    </div>
  );
}

function slugifyLite(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
