import {
  Activity,
  Boxes,
  Code,
  Container,
  Network,
  Server,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { ProjectCategory, SkillCategory } from "@/types";

/** Icônes Lucide par catégorie — un seul système d'icônes pour l'UI. */

const categoryIcons: Record<SkillCategory | ProjectCategory, LucideIcon> = {
  networking: Network,
  system: Server,
  automation: Workflow,
  virtualization: Boxes,
  devops: Container,
  development: Code,
  cybersecurity: ShieldCheck,
  security: ShieldCheck, // ProjectCategory — même icône
  monitoring: Activity,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: SkillCategory | ProjectCategory;
  className?: string;
}) {
  const Icon = categoryIcons[category] ?? Server;
  return <Icon className={className} aria-hidden />;
}
