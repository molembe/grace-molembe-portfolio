/**
 * Rate limiting en mémoire (fenêtre glissante) — suffisant pour un site
 * statique + un seul endpoint. Pour un déploiement multi-instances,
 * remplacer par un stockage partagé (Redis / DRF throttle).
 */

const WINDOW_MS = 60 * 60 * 1000; // 1 heure
const MAX_REQUESTS = 5; // 5 messages/heure/IP

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

/**
 * Limiteur générique (fenêtre glissante) — true si la limite est atteinte.
 * Utilisé par le formulaire de contact et le login du back-office.
 */
export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= maxRequests) {
    buckets.set(key, bucket);
    return true;
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  // Évite une croissance infinie de la map.
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (b.timestamps.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return false;
}

/** Limite du formulaire de contact : 5 messages / heure / IP. */
export function isRateLimited(key: string): boolean {
  return rateLimit(key, MAX_REQUESTS, WINDOW_MS);
}

/** Délai minimal de remplissage du formulaire (anti-bot simple). */
export function isSubmissionTooFast(startedAt: number): boolean {
  if (!Number.isFinite(startedAt) || startedAt <= 0) return true;
  return Date.now() - startedAt < 3000; // < 3 s → bot probable
}

/** Vérifie que la requête provient du même site (anti-CSRF basique). */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // requêtes non navigateur (curl) — rate limit s'applique
  try {
    const host = request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
