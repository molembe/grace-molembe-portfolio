import { NextResponse } from "next/server";
import { contactSchema, sanitizeText } from "@/lib/validation";
import { isRateLimited, isSubmissionTooFast, isSameOrigin } from "@/lib/rate-limit";

/**
 * API de contact — sécurité en couches :
 * 1. Same-origin check   2. Rate limiting (5/h/IP, mémoire locale)
 * 3. Anti-bot (honeypot + délai)   4. Validation zod stricte
 * 5. Neutralisation des caractères de contrôle
 * 6. Stockage local en JSONL (aucun tiers) — branchement SMTP ou Django
 *    REST prévu via variables d'environnement (voir docs/DEPLOYMENT.md).
 */

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Origine non autorisée." }, { status: 403 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";

  if (isRateLimited(`contact:${ip}`)) {
    return NextResponse.json(
      { message: "Limite d'envoi atteinte. Réessayez plus tard." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Certains champs sont invalides.",
        errors: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      },
      { status: 400 }
    );
  }

  const { name, email, subject, message, company, startedAt } = parsed.data;

  // Honeypot rempli → réponse "succès" silencieuse pour ne pas éduquer les bots.
  if (company && company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (isSubmissionTooFast(startedAt)) {
    return NextResponse.json(
      { message: "Formulaire soumis trop rapidement. Prenez le temps de l'écrire." },
      { status: 400 }
    );
  }

  const entry = {
    receivedAt: new Date().toISOString(),
    ip,
    name: sanitizeText(name),
    email: sanitizeText(email),
    subject: sanitizeText(subject),
    message: sanitizeText(message),
  };

  try {
    const { mkdir, appendFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const dataDir = path.join(process.cwd(), ".data");
    await mkdir(dataDir, { recursive: true });
    await appendFile(path.join(dataDir, "messages.jsonl"), JSON.stringify(entry) + "\n", "utf8");
  } catch {
    // Filesystem en lecture seule (déploiements serverless) ou erreur disque :
    // le message ne peut pas être persisté — réponse explicite plutôt qu'une
    // erreur générique.
    return NextResponse.json(
      {
        message:
          "Le stockage des messages est indisponible sur ce déploiement. Contactez-moi directement via les coordonnées affichées sur le site.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, stored: true });
}
