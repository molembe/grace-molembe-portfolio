import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  ListChecks,
  Target,
} from "lucide-react";
import { ButtonLink, Container, StatusBadge, TechTag } from "@/components/ui/kit";
import { DiagramViewer } from "@/components/diagrams/diagram-viewer";
import { getTopology } from "@/components/diagrams/topologies";
import { CategoryIcon } from "@/components/category-icon";
import { Reveal } from "@/components/animations/reveal";
import { getProject, getProjects, getLabs } from "@/lib/content";
import { projectCategoryLabels } from "@/components/projects/labels";
import { pageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return pageMetadata({ title: "Projet introuvable", description: "Projet introuvable.", path: "/projects" });
  return pageMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
}

/** Vérifie si un fichier de capture existe réellement (slot sinon). */
function screenshotExists(publicPath: string): boolean {
  const rel = publicPath.replace(/^\//, "");
  try {
    return fs.existsSync(path.join(process.cwd(), "public", rel));
  } catch {
    return false;
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const diagram = getTopology(project.diagram);
  const relatedLabs = getLabs().filter((l) => l.relatedProject === project.slug);
  const allProjects = await getProjects();
  const others = allProjects.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <article>
      {/* En-tête */}
      <header className="border-b border-border bg-card/40">
        <Container className="py-12">
          <ButtonLink href="/projects" variant="ghost" size="sm" className="-ml-3 mb-6">
            <ArrowLeft aria-hidden /> Tous les projets
          </ButtonLink>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} />
            <TechTag className="text-accent">{projectCategoryLabels[project.category]}</TechTag>
            {project.period && <span className="font-mono text-xs text-muted-foreground">{project.period}</span>}
          </div>

          <h1 className="mt-4 flex items-start gap-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            <CategoryIcon category={project.category} className="mt-1.5 size-7 shrink-0 text-accent" />
            {project.title}
          </h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">{project.summary}</p>
        </Container>
      </header>

      <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_300px]">
        <div className="space-y-12">
          {/* Problématique */}
          <Reveal>
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold">Problématique</h2>
              <p className="leading-relaxed text-muted-foreground">{project.problem}</p>
            </section>
          </Reveal>

          {/* Objectifs */}
          <Reveal>
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold">Objectifs</h2>
              <ul className="space-y-2.5">
                {project.objectives.map((obj, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground">
                    <Target className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                    {obj}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          {/* Architecture */}
          <Reveal>
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold">Architecture technique</h2>
              <p className="leading-relaxed text-muted-foreground">{project.architecture}</p>
              {diagram && <DiagramViewer spec={diagram} className="mt-6" />}
            </section>
          </Reveal>

          {/* Difficultés / solutions */}
          <Reveal>
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold">Difficultés et solutions</h2>
              <div className="space-y-4">
                {project.challenges.map((c, i) => (
                  <div key={i} className="card-noc p-5">
                    <p className="flex gap-2.5 text-sm font-medium">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                      {c.challenge}
                    </p>
                    <p className="mt-3 flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                      {c.solution}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* Résultats */}
          <Reveal>
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold">Résultats</h2>
              <ul className="space-y-2.5">
                {project.results.map((r, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    {r}
                  </li>
                ))}
              </ul>
              {project.status === "in-progress" && (
                <p className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
                  Projet en cours : les résultats listés sont des jalons atteints, pas une livraison finale.
                </p>
              )}
              {project.status === "experimental" && (
                <p className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-accent">
                  Preuve de concept : environnement de lab exploratoire, non destiné à la production.
                </p>
              )}
            </section>
          </Reveal>

          {/* Captures */}
          {project.screenshots.length > 0 && (
            <Reveal>
              <section>
                <h2 className="mb-4 font-display text-xl font-semibold">Captures d&apos;écran</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {project.screenshots.map((shot) =>
                    screenshotExists(shot) ? (
                      <figure key={shot} className="card-noc overflow-hidden p-0">
                        <img
                          src={shot}
                          alt={`Capture — ${project.title}`}
                          loading="lazy"
                          className="aspect-video w-full object-cover"
                        />
                      </figure>
                    ) : (
                      <div
                        key={shot}
                        className="flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-4 text-center"
                      >
                        <ListChecks className="size-5 text-muted-foreground/60" aria-hidden />
                        <p className="mt-2 font-mono text-xs text-muted-foreground">Capture à fournir</p>
                        <p className="mt-1 break-all text-[11px] text-muted-foreground/70">{shot}</p>
                      </div>
                    )
                  )}
                </div>
              </section>
            </Reveal>
          )}
        </div>

        {/* Colonne latérale */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card-noc p-6">
            <h2 className="font-display text-lg font-semibold">Technologies</h2>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <TechTag key={tech}>{tech}</TechTag>
              ))}
            </div>
          </div>

          {project.github && (
            <div className="card-noc p-6">
              <h2 className="font-display text-lg font-semibold">Code source</h2>
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-accent hover:underline"
              >
                <ExternalLink className="size-4" aria-hidden /> Dépôt GitHub
              </a>
            </div>
          )}

          {relatedLabs.length > 0 && (
            <div className="card-noc p-6">
              <h2 className="font-display text-lg font-semibold">Fiches lab associées</h2>
              <ul className="mt-3 space-y-2">
                {relatedLabs.map((lab) => (
                  <li key={lab.slug}>
                    <Link
                      href={`/${lab.kind === "network" ? "network-lab" : "system-lab"}/${lab.slug}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-accent"
                    >
                      {lab.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card-noc p-6">
            <h2 className="font-display text-lg font-semibold">Autres projets</h2>
            <ul className="mt-3 space-y-2">
              {others.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="group flex items-center justify-between gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
                  >
                    <span className="truncate">{p.title}</span>
                    <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
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
