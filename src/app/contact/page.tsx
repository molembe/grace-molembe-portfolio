import { Clock, Github, Linkedin, Mail, MapPin, ShieldCheck } from "lucide-react";
import { Container, PageHeader, TechTag } from "@/components/ui/kit";
import { ContactForm } from "@/components/contact/contact-form";
import { Reveal } from "@/components/animations/reveal";
import { isConfigured } from "@/data/site-config";
import { getSiteConfig } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Me contacter : formulaire sécurisé, disponibilités professionnelles et coordonnées. Réponse sous 48 heures ouvrées.",
  path: "/contact",
});

export default async function ContactPage() {
  const siteConfig = await getSiteConfig();
  const hasEmail = isConfigured(siteConfig.contact.email);
  const hasGithub = isConfigured(siteConfig.social.github);
  const hasLinkedin = isConfigured(siteConfig.social.linkedin);
  return (
    <>
      <PageHeader
        kicker="07 // CONTACT"
        title="Me contacter"
        description="Formulaire sécurisé et coordonnées professionnelles. Idéal pour une opportunité, une question technique ou un échange autour des infrastructures."
      />

      <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_340px]">
        <Reveal>
          <div className="card-noc p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold">Formulaire de contact</h2>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">
              Tous les champs sont requis. Message de 20 à 4 000 caractères.
            </p>
            <ContactForm />
          </div>
        </Reveal>

        <aside className="space-y-6">
          <Reveal delay={0.05}>
            <div className="card-noc p-6">
              <h2 className="font-display text-lg font-semibold">Coordonnées</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {hasEmail && (
                  <li>
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="inline-flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-accent"
                    >
                      <Mail className="size-4 text-accent" aria-hidden /> {siteConfig.contact.email}
                    </a>
                  </li>
                )}
                {hasGithub && (
                  <li>
                    <a
                      href={siteConfig.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-accent"
                    >
                      <Github className="size-4 text-accent" aria-hidden /> GitHub
                    </a>
                  </li>
                )}
                {hasLinkedin && (
                  <li>
                    <a
                      href={siteConfig.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-accent"
                    >
                      <Linkedin className="size-4 text-accent" aria-hidden /> LinkedIn
                    </a>
                  </li>
                )}
                {!hasEmail && !hasGithub && !hasLinkedin && (
                  <li className="text-muted-foreground">
                    Les coordonnées directes (e-mail, GitHub, LinkedIn) seront affichées ici dès
                    leur publication. Le formulaire reste le canal le plus fiable.
                  </li>
                )}
                {isConfigured(siteConfig.location) && (
                  <li className="inline-flex items-center gap-2.5 text-muted-foreground">
                    <MapPin className="size-4 text-accent" aria-hidden /> {siteConfig.location}
                  </li>
                )}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card-noc p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Clock className="size-4 text-accent" aria-hidden />
                Disponibilités
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-success" aria-hidden />
                  {siteConfig.availability}
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-success" aria-hidden />
                  Administration réseaux et systèmes · automatisation · DevSecOps
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-success" aria-hidden />
                  Réponse sous 48 heures ouvrées
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="card-noc p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <ShieldCheck className="size-4 text-accent" aria-hidden />
                Confidentialité
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Le formulaire est protégé contre le spam et les injections. Vos messages sont
                stockés localement, jamais revendus ni transmis à un service tiers.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <TechTag>zod</TechTag>
                <TechTag>honeypot</TechTag>
                <TechTag>rate-limit</TechTag>
                <TechTag>CSP</TechTag>
              </div>
            </div>
          </Reveal>
        </aside>
      </Container>
    </>
  );
}
