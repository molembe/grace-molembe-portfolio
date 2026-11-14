"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/kit";

/**
 * Bascule clair/sombre (next-themes).
 * Les deux icônes sont rendues et affichées via les variantes `dark:` —
 * aucune divergence d'hydratation, aucun état local.
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Basculer entre mode clair et mode sombre"
      title="Basculer clair / sombre"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="hidden size-4 dark:block" />
      <Moon className="size-4 dark:hidden" />
    </Button>
  );
}
