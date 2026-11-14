"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  UserRound,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

/** Barre latérale du back-office — sections + déconnexion. */

const sections = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/admin/profile", label: "Profil & photo", icon: UserRound },
  { href: "/admin/experiences", label: "Parcours", icon: GraduationCap },
  { href: "/admin/projects", label: "Projets", icon: Wrench },
  { href: "/admin/skills", label: "Compétences", icon: FileText },
  { href: "/admin/articles", label: "Articles", icon: BookOpen },
  { href: "/admin/messages", label: "Messages", icon: Mail },
];

export function AdminSidebar({
  overrides,
  pendingCount,
}: {
  overrides: string[];
  pendingCount: number;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation back-office" className="space-y-1">
      {sections.map((section) => {
        const active = section.exact ? pathname === section.href : pathname.startsWith(section.href);
        const Icon = section.icon;
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active ? "bg-muted font-medium text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="flex-1">{section.label}</span>
            {section.href === "/admin/messages" && pendingCount > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent-foreground">
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}

      <div className="mt-4 border-t border-border pt-4">
        <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
          Overrides actifs : {overrides.length > 0 ? overrides.join(", ") : "aucun (valeurs du code)"}
        </p>
        <Button asChild variant="outline" size="sm" className="w-full justify-start">
          <Link href="/" target="_blank">
            <ExternalLink className="size-3.5" aria-hidden /> Voir le site
          </Link>
        </Button>
        <form action={logoutAction} className="mt-2">
          <Button type="submit" variant="outline" size="sm" className="w-full justify-start text-danger hover:text-danger">
            <LogOut className="size-3.5" aria-hidden /> Déconnexion
          </Button>
        </form>
      </div>
    </nav>
  );
}
