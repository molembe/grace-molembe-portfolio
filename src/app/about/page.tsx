import { Compass, GraduationCap, Target } from "lucide-react";
import { Container, PageHeader } from "@/components/ui/kit";
import { Timeline } from "@/components/dashboard/timeline";
import { Reveal } from "@/components/animations/reveal";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { getTimeline, getSiteConfig } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { experienceHighlights } from "@/data/experience";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Parcours académique et professionnel : formation en Génie Informatique, spécialisation Réseaux et Systèmes, expérience à l'ARCEP, objectifs et vision de l'ingénierie informatique.",
  path: "/about",
});

export default async function AboutPage() {
  const [timeline, siteConfig] = await Promise.all([getTimeline(), getSiteConfig()]);

  return (
    <>
      <PageHeader
        kicker="01 // ABOUT"
        title="Ingénieur Réseaux & Systèmes"
        description={experienceHighlights.intro}
      />

      <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_360px]">
        <div className="space-y-12">
          {/* Parcours académique */}
          <Reveal>
            <section aria-labelledby="parcours">
              <h2 id="parcours" className="flex items-center gap-2 font-display text-xl font-semibold">
                <GraduationCap className="size-5 text-accent" aria-hidden />
                Parcours académique
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                <p>
                  Ma formation d&apos;ingénieur en <strong className="text-foreground">Génie Informatique</strong> m&apos;a
                  donné les fondations attendues d&apos;un ingénieur systèmes : algorithmique, développement,
                  architectures logicielles, et surtout la spécialisation en{" "}
                  <strong className="text-foreground">Réseaux et Systèmes Informatiques</strong> — adressage,
                  routage, commutation, administration de serveurs et sécurité des infrastructures.
                </p>
                <p>
                  J&apos;y ai développé une conviction qui guide encore mon travail : une infrastructure
                  fiable commence par la maîtrise des fondamentaux, se vérifie par des tests documentés
                  et se maintient par la documentation.
                </p>
              </div>
            </section>
          </Reveal>

          {/* Expérience */}
          <Reveal>
            <section aria-labelledby="experience">
              <h2 id="experience" className="flex items-center gap-2 font-display text-xl font-semibold">
                <Compass className="size-5 text-accent" aria-hidden />
                Expérience professionnelle
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                <p>
                  Mon stage à l&apos;<strong className="text-foreground">ARCEP</strong> m&apos;a fait passer des
                  laboratoires à un environnement réel : découverte des infrastructures de production,
                  suivi du parc informatique, gestion des imprimantes, initiation à la supervision et
                  participation aux activités techniques de l&apos;équipe.
                </p>
                <p>
                  J&apos;y ai surtout appris la rigueur opérationnelle : documenter chaque intervention,
                  respecter les procédures, communiquer clairement sur l&apos;état des systèmes.
                </p>
              </div>
            </section>
          </Reveal>

          {/* Vision */}
          <Reveal>
            <section aria-labelledby="vision">
              <h2 id="vision" className="flex items-center gap-2 font-display text-xl font-semibold">
                <Target className="size-5 text-accent" aria-hidden />
                Vision de l&apos;ingénierie informatique
              </h2>
              <blockquote className="card-noc mt-4 border-l-2 border-l-accent p-6 text-[15px] leading-relaxed text-muted-foreground">
                {experienceHighlights.vision}
              </blockquote>
            </section>
          </Reveal>
        </div>

        {/* Colonne latérale : carte d'identité + objectifs + positionnement */}
        <aside className="space-y-8">
          <Reveal>
            <div className="card-noc p-6 text-center">
              <ProfileAvatar size={120} className="mx-auto" />
              <h2 className="mt-4 font-display text-lg font-semibold">{siteConfig.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{siteConfig.roleFr}</p>
              <p className="mt-3 font-mono text-xs leading-relaxed text-accent">{siteConfig.tagline}</p>
            </div>
          </Reveal>

          <Reveal>
            <div className="card-noc p-6">
              <h2 className="font-display text-lg font-semibold">Objectifs professionnels</h2>
              <ul className="mt-4 space-y-3">
                {experienceHighlights.objectives.map((obj, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-1 font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card-noc p-6">
              <h2 className="font-display text-lg font-semibold">Positionnement</h2>
              <p className="mt-3 font-mono text-xs leading-relaxed text-accent">{siteConfig.tagline}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {siteConfig.roleFr} — orienté terrain, documentation et automatisation.
              </p>
            </div>
          </Reveal>
        </aside>
      </Container>

      {/* Chronologie complète */}
      <Container className="pb-20">
        <Reveal>
          <h2 className="mb-8 font-display text-xl font-semibold">Chronologie — formation et expérience</h2>
          <Timeline entries={timeline} />
        </Reveal>
      </Container>
    </>
  );
}
