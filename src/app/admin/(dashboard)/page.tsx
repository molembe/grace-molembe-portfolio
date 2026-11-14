import Link from "next/link";
import { ArrowRight, FileText, GraduationCap, Mail, UserRound, Wrench } from "lucide-react";
import { overriddenCollections, readMessages } from "@/lib/store";
import { getArticles, getProjects, getSkills, getTimeline } from "@/lib/content";

export const dynamic = "force-dynamic";

/** Vue d'ensemble : compteurs réels, état des overrides, accès rapide. */
export default async function AdminOverviewPage() {
  const [timeline, projects, skills, articles, messages, overrides] = await Promise.all([
    getTimeline(),
    getProjects(),
    getSkills(),
    getArticles(),
    readMessages(),
    overriddenCollections(),
  ]);

  const cards = [
    { href: "/admin/profile", label: "Profil & photo", value: "Identité, coordonnées, CV, photo", icon: UserRound, count: overrides.includes("profile") ? "personnalisé" : "défaut" },
    { href: "/admin/experiences", label: "Parcours", value: "Expériences et formation affichées dans la chronologie", icon: GraduationCap, count: `${timeline.length} entrée(s)` },
    { href: "/admin/projects", label: "Projets", value: "Réalisations publiées sur /projects", icon: Wrench, count: `${projects.length} projet(s)` },
    { href: "/admin/skills", label: "Compétences", value: "Dashboard des technologies et niveaux", icon: FileText, count: `${skills.length} techno(s)` },
    { href: "/admin/articles", label: "Articles", value: "Tech Blog — Markdown", icon: FileText, count: `${articles.length} article(s)` },
    { href: "/admin/messages", label: "Messages reçus", value: "Formulaire de contact — boîte locale", icon: Mail, count: `${messages.length} message(s)` },
  ];

  return (
    <div className="space-y-8">
      <section className="card-noc p-6" aria-label="État du contenu">
        <h2 className="font-display text-lg font-semibold">État du contenu</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Les sections marquées <span className="font-mono text-xs text-accent">personnalisé</span> ou modifiées
          via le back-office sont stockées dans <span className="font-mono text-xs">.data/content/</span> (volume
          persistant). Le bouton « Réinitialiser » d&apos;une section restaure les valeurs par défaut du code.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {["profile", "experiences", "projects", "skills", "articles"].map((name) => {
            const active = overrides.includes(name as (typeof overrides)[number]);
            return (
              <li
                key={name}
                className={
                  active
                    ? "rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] text-accent"
                    : "rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted-foreground"
                }
              >
                {name}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="card-noc group flex flex-col p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {card.count}
                </span>
              </div>
              <h3 className="mt-3 flex items-center gap-1.5 font-display text-sm font-semibold">
                {card.label}
                <ArrowRight className="size-3.5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{card.value}</p>
            </Link>
          );
        })}
      </div>

      <section className="card-noc border-l-2 border-l-accent p-6" aria-label="Bon à savoir">
        <h2 className="font-display text-lg font-semibold">Comment ça marche ?</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">Enregistrer</strong> une section régénère les pages publiques
            concernées (accueil, parcours, projets…) — aucun redéploiement nécessaire.
          </li>
          <li>
            <strong className="text-foreground">Réinitialiser</strong> supprime l&apos;override : le site retombe
            sur les données d&apos;origine du code.
          </li>
          <li>
            La <strong className="text-foreground">photo</strong> et les <strong className="text-foreground">messages</strong> sont
            stockés localement (<span className="font-mono text-xs">.data/uploads/</span>,{" "}
            <span className="font-mono text-xs">.data/messages.jsonl</span>) — rien n&apos;est envoyé à un tiers.
          </li>
          <li>
            Les <strong className="text-foreground">laboratoires</strong> (Network / System Lab) restent gérés dans
            le code — structure trop riche pour des formulaires courts.
          </li>
        </ul>
      </section>
    </div>
  );
}
