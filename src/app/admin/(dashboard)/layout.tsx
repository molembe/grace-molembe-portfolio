import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/kit";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { isAuthenticated } from "@/lib/admin-auth";
import { overriddenCollections, readMessages } from "@/lib/store";

export const metadata: Metadata = {
  title: { absolute: "Back-office" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * LAYOUT PROTÉGÉ du back-office : toute page sous /admin (hors /admin/login)
 * exige une session valide — sinon redirection vers le login.
 */
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  const [overrides, messages] = await Promise.all([overriddenCollections(), readMessages()]);
  const labels: Record<string, string> = {
    profile: "profil",
    experiences: "parcours",
    projects: "projets",
    skills: "compétences",
    articles: "articles",
  };

  return (
    <Container className="py-10">
      <div className="mb-8 flex flex-col gap-1 border-b border-border pb-6">
        <p className="font-mono text-xs text-accent">admin://dashboard</p>
        <h1 className="font-display text-2xl font-bold">Back-office du portfolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modifiez le contenu ici — l&apos;interface vitrine est régénérée automatiquement après chaque
          enregistrement.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <AdminSidebar
            overrides={overrides.map((name) => labels[name] ?? name)}
            pendingCount={messages.length}
          />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
