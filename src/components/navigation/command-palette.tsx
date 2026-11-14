"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Download,
  FileText,
  GraduationCap,
  Home,
  Mail,
  Network,
  Server,
  Sparkles,
  TerminalSquare,
  User,
  Wrench,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { isConfigured } from "@/data/site-config";

/**
 * Palette de commandes globale (⌘K / Ctrl+K) — navigation clavier façon console.
 * Inclut toutes les pages + actions (terminal, thème, CV, e-mail).
 * Les données dynamiques (CV, e-mail) sont injectées depuis le layout serveur.
 */

export function CommandPalette({ cvAvailable, cvFile, email }: { cvAvailable: boolean; cvFile: string; email: string }) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    // Déclenché par le bouton de la navbar.
    const openFromEvent = () => setOpen(true);
    document.addEventListener("keydown", down);
    document.addEventListener("gm-open-palette", openFromEvent);
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("gm-open-palette", openFromEvent);
    };
  }, []);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  const go = (href: string) => () => run(() => router.push(href));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher une page ou une action…" />
      <CommandList>
        <CommandEmpty>Aucun résultat.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={go("/")}>
            <Home /> Accueil
          </CommandItem>
          <CommandItem onSelect={go("/about")}>
            <User /> About
          </CommandItem>
          <CommandItem onSelect={go("/skills")}>
            <Sparkles /> Skills
          </CommandItem>
          <CommandItem onSelect={go("/projects")}>
            <Wrench /> Projects
          </CommandItem>
          <CommandItem onSelect={go("/network-lab")}>
            <Network /> Network Lab
          </CommandItem>
          <CommandItem onSelect={go("/system-lab")}>
            <Server /> System Lab
          </CommandItem>
          <CommandItem onSelect={go("/experience")}>
            <GraduationCap /> Experience
          </CommandItem>
          <CommandItem onSelect={go("/blog")}>
            <BookOpen /> Tech Blog
          </CommandItem>
          <CommandItem onSelect={go("/contact")}>
            <Mail /> Contact
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(() => window.dispatchEvent(new CustomEvent("gm-open-terminal")))}>
            <TerminalSquare /> Ouvrir le terminal
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
            }
          >
            <FileText /> Basculer clair / sombre
          </CommandItem>
          {cvAvailable && (
            <CommandItem onSelect={() => run(() => router.push(cvFile))}>
              <Download /> Télécharger le CV
            </CommandItem>
          )}
          {isConfigured(email) && (
            <CommandItem onSelect={() => run(() => router.push("/contact"))}>
              <Mail /> Écrire à {email}
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
