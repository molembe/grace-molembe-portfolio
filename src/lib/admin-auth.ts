import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { adminEnv } from "@/lib/admin-env";

/**
 * AUTHENTIFICATION DU BACK-OFFICE /admin.
 *
 * - Mot de passe unique défini par la variable ADMIN_PASSWORD (minimum
 *   8 caractères ; admin désactivé si absente). Source : environnement
 *   (production) ou fichier persistant config/admin.env (secours —
 *   voir src/lib/admin-env.ts).
 * - Session = cookie HttpOnly signé HMAC-SHA256 (aucune base de données).
 * - Comparaison en temps constant (timingSafeEqual sur les digests SHA-256).
 * - Clé de signature : ADMIN_SESSION_SECRET, ou dérivée du mot de passe.
 */

const COOKIE_NAME = "gm_admin";
const SESSION_MS = 12 * 60 * 60 * 1000; // 12 h

function adminSecret(): string {
  const { password, secret } = adminEnv();
  return secret ?? createHash("sha256").update(`gm-admin::${password ?? ""}`).digest("hex");
}

/** Admin utilisable uniquement si un mot de passe correct est configuré. */
export function adminEnabled(): boolean {
  const { password } = adminEnv();
  return typeof password === "string" && password.length >= 8;
}

/** Comparaison en temps constant de deux chaînes (via leurs digests). */
function safeEqual(a: string, b: string): boolean {
  const da = createHash("sha256").update(a).digest();
  const db = createHash("sha256").update(b).digest();
  return timingSafeEqual(da, db);
}

export function checkPassword(input: string): boolean {
  const { password } = adminEnv();
  if (!adminEnabled() || typeof password !== "string") return false;
  return safeEqual(input, password);
}

/* ---------------- Jetons de session ---------------- */

function sign(payload: string): string {
  return createHmac("sha256", adminSecret()).update(payload).digest("base64url");
}

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_MS;
  const payload = String(exp);
  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token: string): boolean {
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payload);
  if (!safeEqual(sig, expected)) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Date.now();
}

/* ---------------- Cookies ---------------- */

export async function setSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Session valide en cours ? (utilisé par le layout et les server actions) */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return typeof token === "string" && verifySessionToken(token);
}

/** IP cliente (rate limiting du login). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local"
  );
}
