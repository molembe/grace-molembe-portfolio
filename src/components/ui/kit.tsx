import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { skillLevelLabels } from "@/data/skills";
import type { ProjectStatus, SkillLevel } from "@/types";

/* ---------- Container ---------- */

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props} />;
}

/* ---------- Boutons ---------- */

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_0_20px_-6px_var(--glow)] hover:brightness-110 hover:shadow-[0_0_28px_-6px_var(--glow)]",
        outline:
          "border border-input bg-transparent hover:border-accent/60 hover:text-accent",
        ghost: "hover:bg-muted hover:text-foreground",
        accent:
          "bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ComponentProps<"button"> & ButtonVariantProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof Link> & ButtonVariantProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

/* ---------- Badges statut façon monitoring ---------- */

const statusTone: Record<ProjectStatus, { label: string; className: string }> = {
  published: {
    label: "Réalisé · lab personnel",
    className: "text-success border-success/30 bg-success/5",
  },
  "in-progress": {
    label: "En cours",
    className: "text-warning border-warning/30 bg-warning/5",
  },
  experimental: {
    label: "Expérimental · PoC",
    className: "text-accent border-accent/30 bg-accent/5",
  },
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const meta = statusTone[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide",
        meta.className,
        className
      )}
    >
      <span className="status-dot bg-current" aria-hidden />
      {meta.label}
    </span>
  );
}

export function AvailabilityBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-success",
        className
      )}
    >
      <span className="status-dot bg-success" aria-hidden />
      {children}
    </span>
  );
}

/* ---------- Tag technique ---------- */

export function TechTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Kbd ---------- */

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground",
        className
      )}
    >
      {children}
    </kbd>
  );
}

/* ---------- Jauge de niveau segmentée (échelle honnête 1-5) ---------- */

export function LevelMeter({ level, showLabel = true, className }: { level: SkillLevel; showLabel?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)} role="img" aria-label={`Niveau : ${skillLevelLabels[level]}`}>
      <span className="flex gap-[3px]" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-4 rounded-sm transition-colors",
              i <= level ? "bg-accent" : "bg-border"
            )}
          />
        ))}
      </span>
      {showLabel && <span className="font-mono text-[11px] text-muted-foreground">{skillLevelLabels[level]}</span>}
    </span>
  );
}

/* ---------- Titres de section : "01 // CORE SYSTEMS" ---------- */

export function SectionHeading({
  index,
  title,
  description,
  action,
  className,
}: {
  index?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        {index && (
          <p className="mb-1 font-mono text-xs text-accent" aria-hidden>
            {`${index} //`}
          </p>
        )}
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- En-tête de page intérieure ---------- */

export function PageHeader({
  title,
  kicker,
  description,
  children,
}: {
  title: string;
  kicker: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-border bg-card/40">
      <Container className="py-12 sm:py-16">
        <p className="mb-2 font-mono text-xs text-accent" aria-hidden>
          {`${kicker} //`}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-3xl text-muted-foreground">{description}</p>}
        {children}
      </Container>
    </header>
  );
}
