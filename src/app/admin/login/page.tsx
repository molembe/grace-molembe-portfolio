import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldAlert, TerminalSquare } from "lucide-react";
import { Container } from "@/components/ui/kit";
import { LoginForm } from "@/components/admin/login-form";
import { adminEnabled, isAuthenticated } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: { absolute: "Connexion — Back-office" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Connexion au back-office — protégée par mot de passe (ADMIN_PASSWORD). */
export default async function AdminLoginPage() {
  if (await isAuthenticated()) {
    redirect("/admin");
  }

  const enabled = adminEnabled();

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="card-noc p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-accent">
              <TerminalSquare className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-mono text-xs text-accent">admin://login</p>
              <h1 className="font-display text-xl font-bold">Back-office</h1>
            </div>
          </div>

          {enabled ? (
            <>
              <p className="mt-4 text-sm text-muted-foreground">
                Espace privé permettant de mettre à jour le contenu du site (photo, parcours, projets,
                compétences, articles). Toute modification est visible immédiatement sur l&apos;interface vitrine.
              </p>
              <div className="mt-6">
                <LoginForm />
              </div>
            </>
          ) : (
            <div className="mt-6 space-y-3">
              <p className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                Le back-office est désactivé : aucun mot de passe ADMIN_PASSWORD (8 caractères minimum)
                n&apos;est défini dans l&apos;environnement ni dans le fichier config/admin.env.
              </p>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                # .env.local — ou config/admin.env
                <br />
                ADMIN_PASSWORD=un-mot-de-passe-fort
                <br />
                <br />
                # puis recharger la page (sans redémarrage nécessaire)
              </p>
            </div>
          )}
        </div>

        <p className="mt-4 text-center font-mono text-[11px] text-muted-foreground/60">
          Accès monitoré — tentatives limitées à 10 / 15 min / IP
        </p>
      </div>
    </Container>
  );
}
