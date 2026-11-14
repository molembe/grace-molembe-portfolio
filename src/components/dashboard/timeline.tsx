import { Briefcase, GraduationCap } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import type { TimelineEntry } from "@/types";
import { cn } from "@/lib/utils";

/** Chronologie professionnelle et académique (ton factuel). */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border">
      {entries.map((entry, i) => (
        <li key={`${entry.title}-${i}`} className="relative pl-12">
          <span
            className={cn(
              "absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg border bg-surface",
              entry.kind === "work"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-accent/40 bg-accent/10 text-accent"
            )}
            aria-hidden
          >
            {entry.kind === "work" ? <Briefcase className="size-4" /> : <GraduationCap className="size-4" />}
          </span>

          <Reveal delay={i * 0.05}>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {entry.period}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold leading-snug">{entry.title}</h3>
            <p className="mt-0.5 text-sm font-medium text-accent">{entry.org}</p>
            <ul className="mt-3 space-y-1.5">
              {entry.highlights.map((h, j) => (
                <li key={j} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
