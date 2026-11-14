"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TerminalWindow } from "@/components/terminal/terminal-window";
import type { TerminalData } from "@/lib/content";

/** Terminal global : s'ouvre via l'événement "gm-open-terminal" ou Ctrl+` . */
export function TerminalModal({ data }: { data: TerminalData }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openFromEvent = () => setOpen(true);
    const down = (e: KeyboardEvent) => {
      if (e.key === "`" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("gm-open-terminal", openFromEvent);
    document.addEventListener("keydown", down);
    return () => {
      document.removeEventListener("gm-open-terminal", openFromEvent);
      document.removeEventListener("keydown", down);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl border-border bg-background p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">Terminal interactif simulé</DialogTitle>
        <DialogDescription className="sr-only">
          Terminal de démonstration : les commandes affichent des informations du portfolio,
          aucune commande système n&apos;est exécutée.
        </DialogDescription>
        <TerminalWindow data={data} className="h-[420px] rounded-none border-0" />
      </DialogContent>
    </Dialog>
  );
}
