import Link from "next/link";
import { Github, Linkedin, Mail, TerminalSquare } from "lucide-react";
import { Container, Kbd } from "@/components/ui/kit";
import { navLinks, isConfigured } from "@/data/site-config";
import { getSiteConfig } from "@/lib/content";

/** Pied de page — sticky via flex + mt-auto dans le layout racine. */
export async function Footer() {
  const siteConfig = await getSiteConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card/40 pb-[env(safe-area-inset-bottom)]">
      <Container className="py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Identité */}
          <div>
            <p className="flex items-center gap-2 font-mono text-sm">
              <TerminalSquare className="size-4 text-accent" aria-hidden />
              ~/grace-molembe
            </p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{siteConfig.objective}</p>
            {isConfigured(siteConfig.contact.email) && (
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="mt-3 inline-flex items-center gap-2 text-sm text-accent hover:underline"
              >
                <Mail className="size-4" aria-hidden /> {siteConfig.contact.email}
              </a>
            )}
          </div>

          {/* Navigation */}
          <nav aria-label="Navigation pied de page">
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">Navigation</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <li><FooterLink href="/">Accueil</FooterLink></li>
              {navLinks.map((l) => (
                <li key={l.href}>
                  <FooterLink href={l.href}>{l.label}</FooterLink>
                </li>
              ))}
              <li><FooterLink href="/contact">Contact</FooterLink></li>
            </ul>
          </nav>

          {/* Réseaux + stack */}
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">Réseaux</p>
            <ul className="flex flex-col gap-2 text-sm">
              {isConfigured(siteConfig.social.github) && (
                <li>
                  <a
                    href={siteConfig.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-accent"
                  >
                    <Github className="size-4" aria-hidden /> GitHub
                  </a>
                </li>
              )}
              {isConfigured(siteConfig.social.linkedin) && (
                <li>
                  <a
                    href={siteConfig.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-accent"
                  >
                    <Linkedin className="size-4" aria-hidden /> LinkedIn
                  </a>
                </li>
              )}
              {!isConfigured(siteConfig.social.github) && !isConfigured(siteConfig.social.linkedin) && !isConfigured(siteConfig.contact.email) && (
                <li className="text-muted-foreground/70">Coordonnées bientôt disponibles.</li>
              )}
            </ul>
            <p className="mt-6 font-mono text-[11px] text-muted-foreground/70">
              Built with Next.js · Tailwind CSS · TypeScript
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {year} {siteConfig.name} — Conçu et développé avec rigueur.</p>
          <p className="flex items-center gap-2 font-mono">
            <span>v{siteConfig.version}</span>
            <span aria-hidden>·</span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd> pour naviguer
            </span>
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-muted-foreground transition-colors hover:text-accent">
      {children}
    </Link>
  );
}
