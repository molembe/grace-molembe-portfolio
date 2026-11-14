import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Résolution de la configuration du back-office.
 *
 * Ordre de priorité :
 *  1. Variables d'environnement ADMIN_PASSWORD / ADMIN_SESSION_SECRET
 *     (canal canonique : production Docker, .env / .env.local).
 *  2. Fichier persistant `config/admin.env` puis `.data/admin.env`
 *     (format KEY=VALUE, hors git) — secours pour les environnements
 *     d'aperçu jetables où `.env` est réinitialisé au démarrage : le
 *     fichier de configuration, lui, fait partie de l'espace de travail
 *     persistant et survit aux redémarrages.
 *
 * Le fichier est relu à chaque appel (quelques octets, coût négligeable)
 * afin de prendre en compte un changement sans redémarrer le serveur.
 */

const FALLBACK_FILES = ["config/admin.env", ".data/admin.env"] as const;

export interface AdminEnvConfig {
  password: string | undefined;
  secret: string | undefined;
}

/** Analyse un fichier au format KEY=VALUE (commentaires `#` ignorés). */
function parseEnvFile(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

/** Premier fichier de secours disponible et non vide. */
function readFirstAvailableFile(): Record<string, string> {
  for (const rel of FALLBACK_FILES) {
    try {
      const abs = path.join(process.cwd(), rel);
      const parsed = parseEnvFile(readFileSync(abs, "utf8"));
      if (Object.keys(parsed).length > 0) return parsed;
    } catch {
      // Fichier absent ou illisible : on tente le suivant.
    }
  }
  return {};
}

/** Configuration effective du back-office (environnement d'abord, fichier ensuite). */
export function adminEnv(): AdminEnvConfig {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (password !== undefined && secret !== undefined) {
    return { password, secret };
  }
  const file = readFirstAvailableFile();
  return {
    password: password ?? file.ADMIN_PASSWORD,
    secret: secret ?? file.ADMIN_SESSION_SECRET,
  };
}
