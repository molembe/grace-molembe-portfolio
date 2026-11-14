import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";
import { ResetButton } from "@/components/admin/reset-button";
import { timelineFields } from "@/app/admin/fields";
import { saveTimelineAction, deleteTimelineAction } from "@/app/admin/actions";
import { getTimeline } from "@/lib/content";

export const dynamic = "force-dynamic";

/** Back-office : parcours (expériences professionnelles & formation). */
export default async function AdminExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string }>;
}) {
  const { edit, new: isNew } = await searchParams;
  const timeline = await getTimeline();

  const items: AdminListItem[] = timeline.map((entry, index) => ({
    id: entry.id ?? `static-${index}`,
    title: entry.title,
    subtitle: entry.org,
    meta: entry.period,
    badge: entry.kind === "work" ? "expérience" : "formation",
  }));

  const editIndex = edit ? items.findIndex((item) => item.id === edit) : -1;
  const editingEntry = editIndex >= 0 ? timeline[editIndex] : undefined;
  const editingId = editIndex >= 0 ? items[editIndex].id : undefined;
  const showForm = Boolean(editingEntry) || isNew === "1";

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Parcours</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chronologie affichée sur les pages <span className="font-mono text-xs">/experience</span> et{" "}
            <span className="font-mono text-xs">/about</span>. Les nouvelles entrées apparaissent en premier.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ResetButton collection="experiences" />
        </div>
      </section>

      {showForm ? (
        <section className="card-noc p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-semibold">
              {editingEntry ? `Modifier : ${editingEntry.title}` : "Nouvelle entrée"}
            </h3>
            <Link href="/admin/experiences" className="text-sm text-muted-foreground hover:text-foreground">
              Annuler
            </Link>
          </div>
          <AdminForm
            fields={timelineFields}
            initial={
              editingEntry
                ? {
                    kind: editingEntry.kind,
                    title: editingEntry.title,
                    org: editingEntry.org,
                    period: editingEntry.period,
                    highlights: editingEntry.highlights.join("\n"),
                  }
                : {}
            }
            hidden={editingId ? { id: editingId } : {}}
            action={saveTimelineAction}
            submitLabel={editingEntry ? "Mettre à jour" : "Ajouter l'entrée"}
            successRedirect="/admin/experiences"
          />
        </section>
      ) : (
        <Link
          href="/admin/experiences?new=1"
          className="card-noc flex items-center justify-center gap-2 border-dashed p-5 text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
        >
          <Plus className="size-4" aria-hidden /> Ajouter une expérience ou une formation
        </Link>
      )}

      <section>
        <h3 className="mb-4 font-display text-lg font-semibold">Entrées existantes</h3>
        <AdminList items={items} basePath="/admin/experiences" deleteAction={deleteTimelineAction} />
      </section>
    </div>
  );
}
