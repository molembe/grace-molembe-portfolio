import Link from "next/link";
import { Network, Server } from "lucide-react";
import { TechTag } from "@/components/ui/kit";
import type { Lab } from "@/types";

/** Carte de fiche lab (network ou system). */
export function LabCard({ lab, href }: { lab: Lab; href: string }) {
  const Icon = lab.kind === "network" ? Network : Server;

  return (
    <Link href={href} className="card-noc group flex h-full flex-col p-6" aria-label={`Lab : ${lab.title}`}>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-accent">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="flex flex-wrap gap-1.5">
          {lab.tags.slice(0, 3).map((tag) => (
            <TechTag key={tag}>{tag}</TechTag>
          ))}
        </div>
      </div>

      <h3 className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-accent">
        {lab.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{lab.summary}</p>

      <p className="mt-4 font-mono text-xs text-accent">
        {lab.procedure.length} étape{lab.procedure.length > 1 ? "s" : ""} documentée
        {lab.procedure.length > 1 ? "s" : ""}
      </p>
    </Link>
  );
}
