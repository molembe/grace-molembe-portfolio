import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lightbulb, Server, Workflow } from "lucide-react";
import { ButtonLink, Container, TechTag } from "@/components/ui/kit";
import { CodeBlock } from "@/components/ui/code-block";
import { DiagramViewer } from "@/components/diagrams/diagram-viewer";
import { getTopology } from "@/components/diagrams/topologies";
import { Reveal } from "@/components/animations/reveal";
import { getLab, getLabs } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import type { Lab, LabKind } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const kindHref: Record<LabKind, string> = {
  network: "/network-lab",
  system: "/system-lab",
};

const kindLabel: Record<LabKind, string> = {
  network: "Network Lab",
  system: "System Lab",
};

export function labMetadata(kind: LabKind, slug: string) {
  const lab = getLab(kind, slug);
  if (!lab) return pageMetadata({ title: "Lab introuvable", description: "Lab introuvable.", path: kindHref[kind] });
  return pageMetadata({
    title: lab.title,
    description: lab.summary,
    path: `${kindHref[kind]}/${lab.slug}`,
  });
}

export function labStaticParams(kind: LabKind) {
  return getLabs(kind).map((l) => ({ slug: l.slug }));
}

export function LabDetailPage({ kind, slug }: { kind: LabKind; slug: string }) {
  const lab: Lab | undefined = getLab(kind, slug);
  if (!lab) notFound();

  const diagram = getTopology(lab.diagram);
  const siblings = getLabs(kind).filter((l) => l.slug !== lab.slug).slice(0, 4);

  return (
    <article>
      <header className="border-b border-border bg-card/40">
        <Container className="py-12">
          <ButtonLink href={kindHref[kind]} variant="ghost" size="sm" className="-ml-3 mb-6">
            <ArrowLeft aria-hidden /> {kindLabel[kind]}
          </ButtonLink>

          <p className="font-mono text-xs text-accent">{kindLabel[kind]}</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {lab.title}
          </h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">{lab.summary}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {lab.tags.map((tag) => (
              <TechTag key={tag}>{tag}</TechTag>
            ))}
          </div>
        </Container>
      </header>

      <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_300px]">
        <div className="space-y-12">
          {/* Objectif */}
          <Reveal>
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold">Objectif du lab</h2>
              <p className="leading-relaxed text-muted-foreground">{lab.objective}</p>
            </section>
          </Reveal>

          {/* Diagramme */}
          {diagram && (
            <Reveal>
              <section>
                <h2 className="mb-4 font-display text-xl font-semibold">Topologie</h2>
                <DiagramViewer spec={diagram} />
              </section>
            </Reveal>
          )}

          {/* Procédure */}
          <Reveal>
            <section>
              <h2 className="mb-6 font-display text-xl font-semibold">Procédure documentée</h2>
              <ol className="space-y-8">
                {lab.procedure.map((step, i) => (
                  <li key={i} className="relative pl-12">
                    <span
                      className="absolute left-0 top-0 flex size-9 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 font-mono text-sm font-semibold text-accent"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-base font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                    {step.code && (
                      <div className="mt-3">
                        <CodeBlock code={step.code} lang={step.lang} />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>

          {/* Vérification */}
          <Reveal>
            <section className="card-noc border-l-2 border-l-success p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <CheckCircle2 className="size-5 text-success" aria-hidden />
                Vérification
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{lab.verification}</p>
            </section>
          </Reveal>

          {/* Leçons */}
          <Reveal>
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold">Ce que le lab m&apos;a appris</h2>
              <ul className="space-y-3">
                {lab.lessons.map((lesson, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                    {lesson}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        </div>

        {/* Colonne latérale */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card-noc p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Server className="size-4 text-accent" aria-hidden />
              Environnement
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {lab.environment.map((env) => (
                <li key={env} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  {env}
                </li>
              ))}
            </ul>
          </div>

          {lab.relatedProject && (
            <div className="card-noc p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Workflow className="size-4 text-accent" aria-hidden />
                Projet associé
              </h2>
              <Link
                href={`/projects/${lab.relatedProject}`}
                className="mt-3 inline-block text-sm text-accent hover:underline"
              >
                Voir le projet détaillé
              </Link>
            </div>
          )}

          <div className="card-noc p-6">
            <h2 className="font-display text-lg font-semibold">Autres fiches {kindLabel[kind]}</h2>
            <ul className="mt-3 space-y-2">
              {siblings.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`${kindHref[kind]}/${l.slug}`}
                    className="block truncate text-sm text-muted-foreground transition-colors hover:text-accent"
                  >
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </Container>
    </article>
  );
}
