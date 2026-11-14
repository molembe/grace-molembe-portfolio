"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Command, Download, Menu, TerminalSquare } from "lucide-react";
import { Button, ButtonLink, Kbd } from "@/components/ui/kit";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { navLinks } from "@/data/site-config";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/** Navigation principale — sticky, blur, état actif, palette ⌘K, drawer mobile. */
export function Navbar({ cvAvailable, cvFile }: { cvAvailable: boolean; cvFile: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6" aria-label="Navigation principale">
        <Link href="/" className="group flex items-center gap-2 font-mono text-sm" aria-label="Accueil — Grace à Dieu Molembe">
          <span className="flex size-8 items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-accent">
            <TerminalSquare className="size-4" aria-hidden />
          </span>
          <span className="text-muted-foreground transition-colors group-hover:text-foreground">
            ~/grace-molembe
          </span>
          <span className="status-dot hidden bg-success sm:inline-flex" aria-hidden />
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  isActive(link.href)
                    ? "bg-muted text-accent"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          {/* Palette ⌘K */}
          <CommandPaletteTrigger />

          <ThemeToggle />

          {cvAvailable ? (
            <ButtonLink href={cvFile} variant="outline" size="sm" className="hidden sm:inline-flex" download>
              <Download aria-hidden /> CV
            </ButtonLink>
          ) : (
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" disabled title="CV bientôt disponible">
              <Download aria-hidden /> CV
            </Button>
          )}

          <ButtonLink href="/contact" size="sm" className="hidden sm:inline-flex">
            Contact
          </ButtonLink>

          {/* Mobile */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-border bg-surface">
              <SheetHeader>
                <SheetTitle className="font-mono text-sm text-muted-foreground">~/grace-molembe</SheetTitle>
              </SheetHeader>
              <ul className="flex flex-col gap-1 px-3">
                <li>
                  <MobileLink href="/" label="Accueil" active={pathname === "/"} onNavigate={() => setMobileOpen(false)} />
                </li>
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <MobileLink
                      href={link.href}
                      label={link.label}
                      active={isActive(link.href)}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </li>
                ))}
                <li className="mt-2 border-t border-border pt-3">
                  <MobileLink href="/contact" label="Contact" active={isActive("/contact")} onNavigate={() => setMobileOpen(false)} />
                </li>
              </ul>
              <div className="mt-4 flex items-center gap-2 px-4">
                {cvAvailable ? (
                  <ButtonLink href={cvFile} variant="outline" size="sm" className="flex-1" download>
                    <Download aria-hidden /> Télécharger le CV
                  </ButtonLink>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1" disabled>
                    CV bientôt disponible
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

function CommandPaletteTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("gm-open-palette"))}
      className="hidden h-9 items-center gap-2 rounded-md border border-border bg-muted px-2.5 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground md:inline-flex"
      aria-label="Ouvrir la palette de commandes"
    >
      <Command className="size-3.5" aria-hidden />
      <Kbd>Ctrl</Kbd>
      <Kbd>K</Kbd>
    </button>
  );
}

function MobileLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 items-center rounded-md px-3 text-sm transition-colors",
        active ? "bg-muted text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}
