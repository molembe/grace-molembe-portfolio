import Link from "next/link";
import { ArrowRight, Download, Github, Linkedin, Mail } from "lucide-react";
import { Container, Button, ButtonLink, SectionHeading, AvailabilityBadge, Kbd } from "@/components/ui/kit";
import { TerminalWindow } from "@/components/terminal/terminal-window";
import { CategoryTile } from "@/components/dashboard/category-tile";
import { ProjectCard } from "@/components/projects/project-card";
import { ArticleCard } from "@/components/blog/article-card";
import { DiagramRenderer } from "@/components/diagrams/diagram-renderer";
import { topologies } from "@/components/diagrams/topologies";
import { Reveal } from "@/components/animations/reveal";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { isConfigured } from "@/data/site-config";
import { skillCategories } from "@/data/skills";
import {
  getFeaturedProjects,
  getArticles,
  getStats,
  getSiteConfig,
  getSkills,
  getTerminalData,
} from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  description:
    "Portfolio de Grace à Dieu Molembe, ingénieur en Réseaux et Systèmes Informatiques : infrastructure automation, Linux, DevSecOps, cybersécurité, laboratoires documentés.",
  path: "/",
});

export default async function HomePage() {
  const [featured, articles, stats, siteConfig, skills, terminalData] = await Promise.all([
    getFeaturedProjects(3),
    getArticles().then((all) => all.slice(0, 3)),
    getStats(),
    getSiteConfig(),
    getSkills(),
    getTerminalData(),
  ]);

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="hero-glow border-b border-border">
        <Container className="grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <Reveal>
            <div className="flex items-center gap-5">
              <ProfileAvatar size={92} eager />
              <AvailabilityBadge>{siteConfig.availability}</AvailabilityBadge>
            </div>

            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {siteConfig.name}
            </h1>
            <p className="mt-3 font-display text-xl font-semibold text-gradient sm:text-2xl">
              {siteConfig.role}
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {siteConfig.tagline}
            </p>

            <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">{siteConfig.intro}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink href="/projects" size="lg">
                View My Projects <ArrowRight aria-hidden />
              </ButtonLink>
              {siteConfig.cv.available ? (
                <ButtonLink href={siteConfig.cv.file} variant="outline" size="lg" download>
                  <Download aria-hidden /> Download My CV
                </ButtonLink>
              ) : (
                <Button variant="outline" size="lg" disabled title="CV bientôt disponible">
                  <Download aria-hidden /> Download My CV
                </Button>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              {isConfigured(siteConfig.social.github) && (
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
                >
                  <Github className="size-4" aria-hidden /> GitHub
                </a>
              )}
              {isConfigured(siteConfig.social.linkedin) && (
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
                >
                  <Linkedin className="size-4" aria-hidden /> LinkedIn
                </a>
              )}
              {isConfigured(siteConfig.contact.email) && (
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
                >
                  <Mail className="size-4" aria-hidden /> {siteConfig.contact.email}
                </a>
              )}
              {!isConfigured(siteConfig.social.github) && !isConfigured(siteConfig.social.linkedin) && !isConfigured(siteConfig.contact.email) && (
                <p className="font-mono text-xs text-muted-foreground/70">
                  GitHub · LinkedIn · e-mail — coordonnées bientôt disponibles
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <TerminalWindow data={terminalData} demo className="h-[380px] sm:h-[420px]" />
            <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
              Terminal simulé — tapez <span className="text-accent">help</span> · global :{" "}
              <Kbd>Ctrl</Kbd> <Kbd>`</Kbd>
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ================= CORE SYSTEMS ================= */}
      <section className="border-b border-border py-16" aria-labelledby="core-systems">
        <Container>
          <Reveal>
            <SectionHeading
              index="01"
              title="Core Systems"
              description="Les domaines que je pratique en lab et en projet — niveaux prudents, décrits honnêtement."
              action={
                <ButtonLink href="/skills" variant="outline" size="sm">
                  Dashboard complet <ArrowRight aria-hidden />
                </ButtonLink>
              }
            />
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {skillCategories.map((cat, i) => (
              <Reveal key={cat.id} delay={i * 0.05}>
                <CategoryTile category={cat.id} skills={skills} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ================= SELECTED PROJECTS ================= */}
      <section className="border-b border-border bg-card/30 py-16" aria-labelledby="selected-projects">
        <Container>
          <Reveal>
            <SectionHeading
              index="02"
              title="Selected Projects"
              description="Réalisations documentées — statuts affichés tels quels : réalisé, en cours, expérimental."
              action={
                <ButtonLink href="/projects" variant="outline" size="sm">
                  Tous les projets <ArrowRight aria-hidden />
                </ButtonLink>
              }
            />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {featured.map((project, i) => (
              <Reveal key={project.slug} delay={i * 0.07}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ================= LABS ================= */}
      <section className="border-b border-border py-16" aria-labelledby="labs">
        <Container>
          <Reveal>
            <SectionHeading
              index="03"
              title="Laboratoires"
              description="Deux espaces techniques : topologies réseau et fiches système documentées."
            />
          </Reveal>
          <div className="grid gap-5 lg:grid-cols-2">
            <Reveal>
              <Link href="/network-lab" className="card-noc group block overflow-hidden">
                <div className="pointer-events-none select-none border-b border-border bg-background p-4 opacity-80 transition-opacity group-hover:opacity-100">
                  <DiagramRenderer spec={topologies["vlan-segmentation"]} />
                </div>
                <div className="p-6">
                  <p className="font-mono text-xs text-accent">network-lab</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">Network Lab</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Topologies, VLAN, MPLS/VRF, VPN IPsec, automatisation Ansible — chaque lab
                    avec objectif, procédure et vérifications.
                  </p>
                </div>
              </Link>
            </Reveal>
            <Reveal delay={0.1}>
              <Link href="/system-lab" className="card-noc group block overflow-hidden">
                <div className="pointer-events-none select-none border-b border-border bg-background p-4 opacity-80 transition-opacity group-hover:opacity-100">
                  <DiagramRenderer spec={topologies["docker-stack"]} />
                </div>
                <div className="p-6">
                  <p className="font-mono text-xs text-accent">system-lab</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">System Lab</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ubuntu Server, Docker, Proxmox, Nginx, PostgreSQL, PKI, durcissement —
                    fiches techniques reproductibles.
                  </p>
                </div>
              </Link>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ================= STATUS ================= */}
      <section className="border-b border-border bg-card/30 py-14" aria-labelledby="status">
        <Container>
          <Reveal>
            <SectionHeading
              index="04"
              title="Status"
              description="Compteurs réels, calculés depuis les données du site — rien d'inventé."
            />
          </Reveal>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Reveal><StatCard value={stats.projects} label="projets documentés" /></Reveal>
            <Reveal delay={0.05}><StatCard value={stats.skillCategories} label="domaines de compétences" /></Reveal>
            <Reveal delay={0.1}><StatCard value={stats.labs} label="fiches de laboratoire" /></Reveal>
            <Reveal delay={0.15}><StatCard value={stats.skills} label="technologies pratiquées" /></Reveal>
          </div>
        </Container>
      </section>

      {/* ================= LATEST TRANSMISSIONS ================= */}
      <section className="border-b border-border py-16" aria-labelledby="blog">
        <Container>
          <Reveal>
            <SectionHeading
              index="05"
              title="Latest Transmissions"
              description="Veille et retours de lab publiés sur le Tech Blog."
              action={
                <ButtonLink href="/blog" variant="outline" size="sm">
                  Tous les articles <ArrowRight aria-hidden />
                </ButtonLink>
              }
            />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {articles.map((article, i) => (
              <Reveal key={article.slug} delay={i * 0.07}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20">
        <Container>
          <Reveal>
            <div className="card-noc relative overflow-hidden px-6 py-12 text-center sm:px-12">
              <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
              <p className="font-mono text-xs text-accent" aria-hidden>
                06 // NEXT STEP
              </p>
              <h2 className="mx-auto mt-3 max-w-2xl font-display text-2xl font-bold sm:text-3xl">
                Construisons des infrastructures fiables et sécurisées.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
                Ouvert aux opportunités en administration réseau et systèmes, automatisation et
                DevSecOps. Le formulaire de contact est actif.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/contact" size="lg">
                  Me contacter <ArrowRight aria-hidden />
                </ButtonLink>
                <ButtonLink href="/projects" variant="outline" size="lg">
                  Revoir les projets
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="card-noc p-6 text-center">
      <p className="font-display text-4xl font-bold text-gradient">{value}</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
