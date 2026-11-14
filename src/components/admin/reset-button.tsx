"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetCollectionAction } from "@/app/admin/actions";
import type { CollectionName } from "@/lib/store";

/** Bouton « Réinitialiser » — restaure les valeurs par défaut du code. */
export function ResetButton({ collection }: { collection: CollectionName }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(resetCollectionAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "Réinitialisé.");
      router.refresh();
    } else {
      toast.error(state.message ?? "Échec de la réinitialisation.");
    }
     
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("Restaurer les valeurs par défaut du code ? Vos modifications de cette section seront perdues.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="collection" value={collection} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? <RotateCcw className="size-3.5 animate-spin" aria-hidden /> : <RotateCcw className="size-3.5" aria-hidden />}
        Réinitialiser
      </Button>
    </form>
  );
}
