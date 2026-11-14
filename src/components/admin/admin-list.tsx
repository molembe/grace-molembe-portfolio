"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/app/admin/actions";

/**
 * LISTE GÉNÉRIQUE DU BACK-OFFICE : chaque entrée avec édition (?edit=<id>)
 * et suppression confirmée (server action + toast).
 */

export interface AdminListItem {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
  /** Texte affiché si badge absent (ex. "Statut par défaut"). */
  fallbackBadge?: string;
}

interface AdminListProps {
  items: AdminListItem[];
  basePath: string;
  deleteAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
  emptyMessage?: string;
}

export function AdminList({ items, basePath, deleteAction, emptyMessage }: AdminListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage ?? "Aucune entrée pour l'instant."}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="card-noc flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-sm font-semibold">{item.title}</h3>
              {item.badge ? (
                <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                  {item.badge}
                </span>
              ) : item.fallbackBadge ? (
                <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {item.fallbackBadge}
                </span>
              ) : null}
            </div>
            {item.subtitle && <p className="mt-1 truncate text-sm text-muted-foreground">{item.subtitle}</p>}
            {item.meta && <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/70">{item.meta}</p>}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`${basePath}?edit=${encodeURIComponent(item.id)}`}>
                <Pencil className="size-3.5" aria-hidden /> Modifier
              </Link>
            </Button>
            <DeleteButton id={item.id} deleteAction={deleteAction} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DeleteButton({
  id,
  deleteAction,
}: {
  id: string;
  deleteAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(deleteAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "Supprimé.");
      router.refresh();
    } else {
      toast.error(state.message ?? "Échec de la suppression.");
    }
     
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("Confirmer la suppression ? Le site public sera mis à jour immédiatement.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="outline" size="sm" disabled={pending} className="text-danger hover:text-danger">
        {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Trash2 className="size-3.5" aria-hidden />}
        Supprimer
      </Button>
    </form>
  );
}
