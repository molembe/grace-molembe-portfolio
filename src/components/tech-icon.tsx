import {
  Server as ServerIcon,
  type LucideIcon,
} from "lucide-react";
import {
  SiAnsible,
  SiDocker,
  SiDjango,
  SiGit,
  SiGithub,
  SiGnubash,
  SiLinux,
  SiNginx,
  SiOdoo,
  SiPhp,
  SiPostgresql,
  SiProxmox,
  SiPython,
  SiReact,
  SiTypescript,
  SiUbuntu,
  SiVmware,
} from "react-icons/si";
import { cn } from "@/lib/utils";
/**
 * LOGOS DE MARQUES — seuls cas d'usage de react-icons (cf. cahier des charges :
 * « Lucide, React Icons uniquement si nécessaire »). Fallback Lucide si la
 * marque n'existe pas dans Simple Icons (Nagios, Glances, GoAccess…).
 */

const brandRegistry: Record<string, React.ComponentType<{ className?: string }>> = {
  linux: SiLinux,
  ubuntu: SiUbuntu,
  bash: SiGnubash,
  ansible: SiAnsible,
  python: SiPython,
  git: SiGit,
  github: SiGithub,
  proxmox: SiProxmox,
  vmware: SiVmware,
  docker: SiDocker,
  nginx: SiNginx,
  django: SiDjango,
  react: SiReact,
  typescript: SiTypescript,
  php: SiPhp,
  postgresql: SiPostgresql,
  odoo: SiOdoo,
};

export function TechIcon({
  brand,
  fallback: Fallback = ServerIcon,
  className,
}: {
  brand?: string;
  fallback?: LucideIcon;
  className?: string;
}) {
  if (brand) {
    const Brand = brandRegistry[brand];
    if (Brand) {
      return <Brand className={cn("size-4", className)} aria-hidden />;
    }
  }
  return <Fallback className={cn("size-4", className)} aria-hidden />;
}
