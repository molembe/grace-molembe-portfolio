"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TechIcon } from "@/components/tech-icon";
import { LevelMeter, TechTag } from "@/components/ui/kit";
import { skillLevelLabels } from "@/data/skills";
import type { Skill } from "@/types";
import { cn } from "@/lib/utils";

/** Carte compétence : niveau + description + expérience pratique (extensible). */
export function SkillCard({ skill }: { skill: Skill }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card-noc p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-3 text-left"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
          <TechIcon brand={skill.brand} className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display font-semibold">{skill.name}</span>
          <LevelMeter level={skill.level} className="mt-1" />
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{skill.description}</p>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Expérience pratique</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{skill.practice}</p>
          </div>
          <TechTag>niveau : {skillLevelLabels[skill.level]}</TechTag>
        </div>
      )}
    </div>
  );
}
