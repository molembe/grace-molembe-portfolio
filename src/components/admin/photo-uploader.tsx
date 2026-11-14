"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { savePhotoAction, deletePhotoAction } from "@/app/admin/actions";

/**
 * UPLOAD DE PHOTO DE PROFIL — prévisualisation, upload (JPEG/PNG/WebP, 4 Mo max),
 * suppression. La photo est stockée dans .data/uploads/ et servie via
 * /api/media/profile (aucun tiers).
 */

const MAX_BYTES = 4 * 1024 * 1024;

export function PhotoUploader({ photoUrl }: { photoUrl: string | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadState, uploadAction, uploading] = useActionState(savePhotoAction, null);
  const [deleteState, deleteFormAction, deleting] = useActionState(deletePhotoAction, null);

  useEffect(() => {
    if (!uploadState) return;
    if (uploadState.ok) {
      toast.success(uploadState.message ?? "Photo mise à jour.");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } else {
      const message = uploadState.message ?? uploadState.errors?.photo ?? "Échec de l'upload.";
      toast.error(message);
    }
     
  }, [uploadState]);

  useEffect(() => {
    if (!deleteState) return;
    if (deleteState.ok) {
      toast.success(deleteState.message ?? "Photo supprimée.");
      router.refresh();
    }
     
  }, [deleteState]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_BYTES) {
      toast.error("Fichier trop lourd (4 Mo maximum).");
      e.target.value = "";
    }
  }

  return (
    <div className="card-noc p-6">
      <h2 className="font-display text-lg font-semibold">Photo de profil</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Affichée dans le hero de l&apos;accueil et sur la page About. Cadre rond — privilégiez un cadrage
        visage centré. En l&apos;absence de photo, le monogramme (initiales) est affiché.
      </p>

      <div className="mt-5 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        {photoUrl ? (
           
          <img
            src={photoUrl}
            alt="Photo de profil actuelle"
            className="size-28 rounded-full border border-accent/40 object-cover shadow-[0_10px_30px_-15px_rgba(34,211,238,0.4)]"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-28 items-center justify-center rounded-full border border-dashed border-border bg-muted/40 font-display text-xl text-muted-foreground"
          >
            —
          </div>
        )}

        <div className="w-full space-y-3">
          <form action={uploadAction} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="photo">Fichier image</Label>
              <Input
                ref={fileRef}
                id="photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onFileChange}
                className="cursor-pointer file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs file:text-foreground"
              />
            </div>
            <Button type="submit" disabled={uploading} size="sm">
              {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImageUp className="size-4" aria-hidden />}
              {uploading ? "Envoi…" : "Téléverser la photo"}
            </Button>
          </form>

          {photoUrl && (
            <form action={deleteFormAction}>
              <Button type="submit" variant="outline" size="sm" disabled={deleting} className="text-danger hover:text-danger">
                {deleting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
                Retirer la photo
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
