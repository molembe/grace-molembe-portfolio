import { NextResponse } from "next/server";
import { getProfilePhoto, profilePhotoMime, readProfilePhotoFile } from "@/lib/store";

/**
 * SERVICE DE LA PHOTO DE PROFIL uploadée via le back-office.
 * URL : /api/media/profile?v=<mtime> — le paramètre v invalide le cache
 * navigateur à chaque nouvel upload. Fichier lu depuis .data/uploads/.
 */

export const dynamic = "force-dynamic";

export async function GET(_request: Request) {
  const photo = await getProfilePhoto();
  if (!photo) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = await readProfilePhotoFile(photo.ext);
  if (!buffer) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": profilePhotoMime(photo.ext),
      "Content-Length": String(buffer.byteLength),
      // URL versionnée (?v=mtime) -> cache long sans risque d'obsolescence.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
