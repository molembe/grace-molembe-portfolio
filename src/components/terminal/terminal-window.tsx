"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { skillCategories, skillLevelLabels } from "@/data/skills";
import { projectStatusMeta } from "@/data/projects";
import { isConfigured } from "@/data/site-config";
import type { TerminalLine, TerminalLineTone } from "@/types";
import type { TerminalData } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * TERMINAL LINUX SIMULÉ — registry de handlers purs.
 * Aucune commande système n'est exécutée : chaque commande retourne des
 * lignes typées rendues en React (jamais innerHTML, jamais eval).
 *
 * Les DONNÉES (identité, compétences, projets, parcours) sont injectées par
 * le serveur via props (getTerminalData) afin de refléter le back-office.
 */

type TerminalEntry = TerminalLine & { kind?: "command"; commandText?: string };

const toneClass: Record<TerminalLineTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  accent: "text-accent",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

const WELCOME: TerminalEntry[] = [
  { tone: "accent", text: "grace@noc — portfolio terminal v1.0.0" },
  { tone: "muted", text: "Bienvenue. Tapez 'help' pour la liste des commandes." },
  { tone: "muted", text: "" },
];

const helpRows: [string, string][] = [
  ["help", "liste des commandes"],
  ["about", "qui je suis"],
  ["skills", "compétences par domaine"],
  ["projects", "réalisations techniques"],
  ["experience", "parcours et stage"],
  ["contact", "me joindre"],
  ["clear", "vider l'écran"],
  ["whoami", "identité rapide"],
  ["uptime", "durée de session"],
];

export function TerminalWindow({
  data,
  demo = false,
  className,
}: {
  data: TerminalData;
  demo?: boolean;
  className?: string;
}) {
  const [entries, setEntries] = useState<TerminalEntry[]>(WELCOME);
  const [pending, setPending] = useState<TerminalEntry[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [busy, setBusy] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedAt = useRef<number>(Date.now());
  const demoDone = useRef(false);
  const reduce = useReducedMotion();

  /* Révélation progressive des réponses (typewriter rapide). */
  useEffect(() => {
    if (pending.length === 0) {
      setBusy(false);
      return;
    }
    setBusy(true);
    if (reduce) {
      setEntries((prev) => [...prev, ...pending]);
      setPending([]);
      setBusy(false);
      return;
    }
    const timer = setInterval(() => {
      setPending((queue) => {
        if (queue.length === 0) {
          clearInterval(timer);
          setBusy(false);
          return queue;
        }
        const [first, ...rest] = queue;
        setEntries((prev) => [...prev, first]);
        return rest;
      });
    }, 34);
    return () => clearInterval(timer);
  }, [pending, reduce]);

  /* Auto-scroll en bas. */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, pending.length]);

  const push = useCallback(
    (lines: TerminalEntry[]) => {
      if (reduce) {
        setEntries((prev) => [...prev, ...lines]);
        return;
      }
      setPending((prev) => [...prev, ...lines]);
    },
    [reduce]
  );

  const pad = (s: string, n: number) => s.padEnd(n, " ");

  function buildOutput(raw: string): TerminalEntry[] {
    const { config, skills, projects, timeline } = data;
    const [cmd, ...args] = raw.toLowerCase().split(/\s+/);
    const arg = args.join(" ");

    switch (cmd) {
      case "help":
        return [
          { tone: "accent", text: "Commandes disponibles :" },
          ...helpRows.map(([name, desc]) => ({
            tone: "default" as const,
            text: `  ${pad(name, 12)} ${desc}`,
          })),
          { tone: "muted", text: "  (Astuce : Tab complète, ↑/↓ parcourt l'historique)" },
        ];

      case "about":
        return [
          { tone: "default", text: config.intro },
          { tone: "muted", text: `Positionnement : ${config.tagline}` },
          { tone: "primary", text: "→ /about" },
        ];

      case "skills":
        return [
          { tone: "accent", text: "Compétences (niveaux prudents, échelle 1-5) :" },
          ...skillCategories.map((cat) => {
            const list = skills
              .filter((s) => s.category === cat.id)
              .slice(0, 4)
              .map((s) => `${s.name} (${skillLevelLabels[s.level]})`);
            return { tone: "default" as const, text: `  ${pad(cat.label, 22)} ${list.join(" · ")}` };
          }),
          { tone: "primary", text: "→ /skills" },
        ];

      case "projects":
        return [
          { tone: "accent", text: `${projects.length} projets documentés :` },
          ...projects.map((p) => ({
            tone: "default" as const,
            text: `  ${pad(projectStatusMeta[p.status].label, 22)} ${p.title}`,
          })),
          { tone: "primary", text: "→ /projects" },
        ];

      case "experience":
        return [
          { tone: "accent", text: "Parcours :" },
          ...timeline.flatMap((entry) => [
            { tone: "default" as const, text: `  ${entry.title} — ${entry.org}` },
            { tone: "muted" as const, text: `    ${entry.period}` },
          ]),
          { tone: "primary", text: "→ /experience" },
        ];

      case "contact": {
        const lines: TerminalEntry[] = [];
        if (isConfigured(config.email)) {
          lines.push({ tone: "default", text: `  e-mail   : ${config.email}` });
        }
        if (isConfigured(config.github)) {
          lines.push({ tone: "default", text: `  GitHub   : ${config.github}` });
        }
        if (isConfigured(config.linkedin)) {
          lines.push({ tone: "default", text: `  LinkedIn : ${config.linkedin}` });
        }
        if (lines.length === 0) {
          lines.push({ tone: "warning", text: "  Coordonnées en cours de configuration." });
        }
        lines.push({ tone: "primary", text: "→ /contact (formulaire actif)" });
        return lines;
      }

      case "clear":
        return [];

      case "whoami":
        return [{ tone: "accent", text: `${config.name} — ${config.role}` }];

      case "uptime": {
        const seconds = Math.floor((Date.now() - mountedAt.current) / 1000);
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return [
          {
            tone: "success",
            text: `session active depuis ${m}m ${s}s — systems operational`,
          },
        ];
      }

      case "sudo":
        return [
          { tone: "danger", text: `Permission denied : ${arg || "cette commande"} requiert les droits du vrai système.` },
          { tone: "muted", text: "Ici, seul le terminal simulé est root." },
        ];

      default:
        return [
          { tone: "danger", text: `commande introuvable : ${cmd}` },
          { tone: "muted", text: "Tapez 'help' pour la liste des commandes." },
        ];
    }
  }

  function runCommand(raw: string, options?: { silent?: boolean }) {
    const trimmed = raw.trim();
    if (options?.silent !== true) {
      setEntries((prev) => [
        ...prev,
        { tone: "muted", text: trimmed, kind: "command" },
      ]);
    }
    if (!trimmed) return;

    setHistory((prev) => [trimmed, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    const [cmd] = trimmed.toLowerCase().split(/\s+/);
    if (cmd === "clear") {
      setEntries([]);
      setPending([]);
      return;
    }
    push(buildOutput(trimmed));
  }

  /* Démonstration automatique discrète (une seule fois, après 0,9 s). */
  useEffect(() => {
    if (!demo || demoDone.current) return;
    const timer = setTimeout(() => {
      demoDone.current = true;
      runCommand("help", { silent: true });
    }, 900);
    return () => clearTimeout(timer);
  }, [demo]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !busy) {
      runCommand(input);
      setInput("");
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(next);
      setInput(history[next]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput("");
        return;
      }
      const next = historyIndex - 1;
      setHistoryIndex(next);
      setInput(history[next]);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const value = input.trim().toLowerCase();
      if (!value) return;
      const matches = helpRows.map(([name]) => name).filter((c) => c.startsWith(value));
      if (matches.length === 1) setInput(`${matches[0]} `);
      else if (matches.length > 1) {
        push([{ tone: "muted", text: matches.join("  ") }]);
      }
    }
  }

  return (
    <div
      className={cn(
        "scanlines flex flex-col overflow-hidden rounded-xl border border-border bg-[#020810] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]",
        className
      )}
      onClick={() => inputRef.current?.focus()}
      role="region"
      aria-label="Terminal interactif simulé"
    >
      {/* Barre de titre */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2.5" aria-hidden>
        <span className="size-3 rounded-full bg-danger/70" />
        <span className="size-3 rounded-full bg-warning/70" />
        <span className="size-3 rounded-full bg-success/70" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">grace@noc: ~</span>
      </div>

      {/* Sortie */}
      <div
        ref={scrollRef}
        className="max-h-full min-h-0 flex-1 overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed sm:text-[13px]"
        role="log"
        aria-live="polite"
      >
        {entries.map((entry, i) => (
          <p key={i} className={cn("whitespace-pre-wrap break-words", toneClass[entry.tone])}>
            {entry.kind === "command" ? (
              <>
                <span className="text-accent">grace@noc</span>
                <span className="text-muted-foreground">:~$ </span>
                {entry.text}
              </>
            ) : (
              entry.text || "\u00A0"
            )}
          </p>
        ))}

        {/* Ligne d'entrée */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy) {
              runCommand(input);
              setInput("");
            }
          }}
          className="mt-1 flex items-center gap-1 whitespace-pre-wrap font-mono text-[12.5px] sm:text-[13px]"
        >
          <span className="text-accent">grace@noc</span>
          <span className="text-muted-foreground">:~$&nbsp;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
            spellCheck={false}
            autoComplete="off"
            aria-label="Saisir une commande du terminal simulé"
            className="w-full flex-1 bg-transparent text-foreground caret-transparent outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
            placeholder={busy ? "…" : "tapez une commande"}
          />
          <span className="terminal-caret -ml-2" aria-hidden />
        </form>
      </div>
    </div>
  );
}
