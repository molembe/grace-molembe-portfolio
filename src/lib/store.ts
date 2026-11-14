import { cache } from "react";
import { mkdir, readFile, writeFile, rename, unlink, readdir, stat } from "node:fs/promises";
import path from "node:path";

/**
 * STORE DE CONTENU ÉDITABLE — back-office.
 *
 * Les modifications faites dans /admin sont écrites en JSON sous .data/content/
 * (monté en volume Docker => persistant en production). Les fonctions de
 * src/lib/content.ts lisent ces overrides EN PRIORITÉ, puis retombent sur les
 * données statiques de src/data (valeurs par défaut).
 *
 * Écritures atomiques (tmp + rename) pour éviter un JSON corrompu si le
 * processus est interrompu. Tout est local : aucun tiers, aucun réseau.
 */

export type CollectionName = "profile" | "experiences" | "projects" | "skills" | "articles";

const CONTENT_DIR = path.join(process.cwd(), ".data", "content");
const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");
const MESSAGES_FILE = path.join(process.cwd(), ".data", "messages.jsonl");

/* ---------------- Collections (JSON) ---------------- */

async function readJson<T>(file: string): Promise<T | null> {
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null; // absent ou corrompu -> fallback données statiques
  }
}

/** Lecture (dédupliquée par requête via React cache). */
export const readCollection = cache(async function readCollection<T>(
  name: CollectionName
): Promise<T | null> {
  return readJson<T>(path.join(CONTENT_DIR, `${name}.json`));
});

/** Écriture atomique d'une collection. */
export async function writeCollection(name: CollectionName, data: unknown): Promise<void> {
  await mkdir(CONTENT_DIR, { recursive: true });
  const file = path.join(CONTENT_DIR, `${name}.json`);
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await rename(tmp, file);
}

/** Supprime l'override -> le site retombe sur les données statiques. */
export async function clearCollection(name: CollectionName): Promise<void> {
  await unlink(path.join(CONTENT_DIR, `${name}.json`)).catch(() => undefined);
}

/** Liste des collections actuellement override (pour le dashboard admin). */
export async function overriddenCollections(): Promise<CollectionName[]> {
  const names: CollectionName[] = ["profile", "experiences", "projects", "skills", "articles"];
  const result: CollectionName[] = [];
  for (const name of names) {
    if (await readJson(path.join(CONTENT_DIR, `${name}.json`))) result.push(name);
  }
  return result;
}

/* ---------------- Photo de profil ---------------- */

const PROFILE_IMAGE_EXT = ["jpg", "jpeg", "png", "webp"] as const;
const PROFILE_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export interface ProfilePhotoInfo {
  url: string; // /api/media/profile?v=<mtime> — cache navigateur invalidé à chaque upload
  ext: string;
  mtimeMs: number;
}

/** Info sur la photo uploadée (null si aucune). */
export const getProfilePhoto = cache(async function getProfilePhoto(): Promise<ProfilePhotoInfo | null> {
  for (const ext of PROFILE_IMAGE_EXT) {
    const file = path.join(UPLOAD_DIR, `profile.${ext}`);
    try {
      const info = await stat(file);
      if (info.isFile()) {
        return { url: `/api/media/profile?v=${Math.floor(info.mtimeMs)}`, ext, mtimeMs: info.mtimeMs };
      }
    } catch {
      // fichier absent -> essayer l'extension suivante
    }
  }
  return null;
});

/** Enregistre la photo uploadée (écrase l'ancienne, toutes extensions). */
export async function saveProfilePhoto(file: File): Promise<void> {
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  await mkdir(UPLOAD_DIR, { recursive: true });
  // Supprimer toute ancienne version (toutes extensions confondues).
  for (const old of PROFILE_IMAGE_EXT) {
    await unlink(path.join(UPLOAD_DIR, `profile.${old}`)).catch(() => undefined);
  }
  const target = path.join(UPLOAD_DIR, `profile.${ext}`);
  const tmp = `${target}.tmp`;
  await writeFile(tmp, Buffer.from(await file.arrayBuffer()));
  await rename(tmp, target);
}

export async function deleteProfilePhoto(): Promise<void> {
  for (const ext of PROFILE_IMAGE_EXT) {
    await unlink(path.join(UPLOAD_DIR, `profile.${ext}`)).catch(() => undefined);
  }
}

export function profilePhotoMime(ext: string): string {
  return PROFILE_MIME[ext] ?? "application/octet-stream";
}

export async function readProfilePhotoFile(ext: string): Promise<Buffer | null> {
  if (!(PROFILE_IMAGE_EXT as readonly string[]).includes(ext)) return null;
  try {
    return await readFile(path.join(UPLOAD_DIR, `profile.${ext}`));
  } catch {
    return null;
  }
}

/* ---------------- Messages de contact (JSONL) ---------------- */

export interface StoredMessage {
  receivedAt: string;
  ip: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Messages reçus via le formulaire de contact (plus récents d'abord). */
export const readMessages = cache(async function readMessages(): Promise<StoredMessage[]> {
  try {
    const raw = await readFile(MESSAGES_FILE, "utf8");
    const lines = raw.split("\n").filter((l) => l.trim().length > 0);
    const messages: StoredMessage[] = [];
    for (const line of lines) {
      try {
        messages.push(JSON.parse(line) as StoredMessage);
      } catch {
        // ligne corrompue -> ignorée
      }
    }
    return messages.reverse();
  } catch {
    return [];
  }
});

/** Réécrit le fichier sans la ligne correspondant à receivedAt. */
export async function deleteMessage(receivedAt: string): Promise<void> {
  try {
    const raw = await readFile(MESSAGES_FILE, "utf8");
    const kept = raw
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .filter((l) => {
        try {
          return (JSON.parse(l) as StoredMessage).receivedAt !== receivedAt;
        } catch {
          return true; // ligne corrompue conservée (ne perd jamais de données)
        }
      });
    const tmp = `${MESSAGES_FILE}.tmp`;
    await writeFile(tmp, kept.length ? kept.join("\n") + "\n" : "", "utf8");
    await rename(tmp, MESSAGES_FILE);
  } catch {
    // fichier absent -> rien à faire
  }
}
