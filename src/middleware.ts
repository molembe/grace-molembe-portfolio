import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Headers HTTP de sécurité appliqués à toutes les réponses.
 * (Middleware plutôt que next.config : applicables sans rebuild en dev,
 * et centralisés avec la logique de sécurité.)
 */

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const csp = [
    "default-src 'self'",
    // unsafe-eval requis uniquement par le HMR React en développement.
    process.env.NODE_ENV === "production"
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  // Ignoré par les navigateurs sur HTTP — sans risque en dev.
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  return response;
}

export const config = {
  matcher: [
    // Tout sauf les fichiers statiques Next.
    "/((?!_next/static|_next/image|favicon.ico|images|documents).*)",
  ],
};
