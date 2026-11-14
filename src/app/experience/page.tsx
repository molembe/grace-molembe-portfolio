import { CheckCircle2 } from "lucide-react";
import { Container, PageHeader, ButtonLink } from "@/components/ui/kit";
import { Timeline } from "@/components/dashboard/timeline";
import { Reveal } from "@/components/animations/reveal";
import { getTimeline } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Experience",
  description:
    "Expérience professionnelle : stage à l'ARCEP — découverte des infrastructures, suivi du parc informatique, gestion des imprimantes, initiation à la supervision, participation aux activités techniques.",
  path: "/experience",
});

export default async function ExperiencePage() {
  const timeline = await getTimeline();
  const work = timeline.filter((t) => t.kind === "work");
  const education = timeline.filter((t) => t.kind === "education");

  return (
    <>
      <PageHeader
        kicker="05 // EXPERIENCE"
        title="Expérience professionnelle"
        description="Présentation factuelle de mon parcours : ce que j'ai fait, ce que j'ai appris. Aucune responsabilité inventée."
      />

      <Container className="py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          <div className="space-y-12">
            <Reveal>
              <section aria-labelledby="stage-arcep">
                <h2 id="stage-arcep" className="font-display text-xl font-semibold">
                  Stage à l&apos;ARCEP
                </h2>
                <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                  <p>
                    Ce stage a été ma première immersion dans l&apos;exploitation d&apos;une infrastructure
                    informatique réelle. J&apos;y ai découvert la vie d&apos;un parc de machines en production :
                    inventaire, états, déplacements d&apos;équipements, incidents et assistances.
                  </p>
                  <p>
                    Côté technique, j&apos;ai participé aux activités de l&apos;équipe — installation et
                    configuration de postes, suivi des imprimantes, premières prises en main de la
                    supervision — et j&apos;ai appris à documenter chaque intervention pour que
                    l&apos;information reste dans l&apos;équipe, pas seulement dans ma tête.
                  </p>
                  <p className="text-sm">
                    <strong className="text-foreground">Ce que j&apos;en retiens :</strong> la fiabilité
                    d&apos;une infrastructure tient autant aux procédures et à la communication qu&apos;à la
                    technique elle-même.
                  </p>
                </div>
              </section>
            </Reveal>

            <Reveal>
              <section aria-labelledby="formation-xp">
                <h2 id="formation-xp" className="font-display text-xl font-semibold">
                  Formation appliquée
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  En parallèle de la formation, les laboratoires personnels documentés sur ce site
                  (Network Lab, System Lab) constituent mon terrain d&apos;application continu : chaque
                  fiche correspond à un environnement construit, testé et documenté.
                </p>
              </section>
            </Reveal>

            <Reveal>
              <section aria-labelledby="chrono-xp">
                <h2 id="chrono-xp" className="mb-8 font-display text-xl font-semibold">
                  Chronologie détaillée
                </h2>
                <Timeline entries={[...work, ...education]} />
              </section>
            </Reveal>
          </div>

          <aside className="space-y-6">
            <Reveal delay={0.05}>
              <div className="card-noc p-6">
                <h2 className="font-display text-lg font-semibold">Environnement d&apos;apprentissage</h2>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  {[
                    "Découverte des infrastructures informatiques",
                    "Administration et suivi du parc informatique",
                    "Gestion et suivi des imprimantes",
                    "Découverte de la supervision",
                    "Participation aux activités techniques",
                  ].map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="card-noc p-6">
                <h2 className="font-display text-lg font-semibold">Transparence</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Les périodes exactes et détails du stage seront complétés avec les informations
                  officielles. Je préfère une page honnête et précise à une page approximative.
                </p>
                <ButtonLink href="/contact" variant="outline" size="sm" className="mt-4">
                  Discuter de mon parcours
                </ButtonLink>
              </div>
            </Reveal>
          </aside>
        </div>
      </Container>
    </>
  );
}
