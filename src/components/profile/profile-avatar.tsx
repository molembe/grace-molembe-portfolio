import { getProfilePhoto, getSiteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * AVATAR DE PROFIL — photo uploadée via le back-office si disponible,
 * sinon monogramme (initiales) dans un cadre blueprint. Point d'état vert
 * cohérent avec le badge de disponibilité.
 */
export async function ProfileAvatar({
  size = 88,
  className,
  eager = false,
}: {
  /** Taille en px. */
  size?: number;
  className?: string;
  /** Préchargement (hero LCP). */
  eager?: boolean;
}) {
  const [photo, config] = await Promise.all([getProfilePhoto(), getSiteConfig()]);
  const statusDot = (
    <span
      className="status-dot absolute bottom-1 right-1 size-3.5 border-2 border-background bg-success"
      aria-hidden
    />
  );

  if (photo) {
    return (
      <span className={cn("relative inline-block shrink-0", className)}>
        <span className="block rounded-full bg-gradient-to-br from-accent/50 via-primary/30 to-accent/50 p-[2.5px]">
          { }
          <img
            src={photo.url}
            alt={`Photo de ${config.name}`}
            width={size}
            height={size}
            loading={eager ? "eager" : "lazy"}
            className="size-full rounded-full border border-background object-cover"
            style={{ width: size, height: size }}
          />
        </span>
        {statusDot}
      </span>
    );
  }

  return (
    <span className={cn("relative inline-block shrink-0", className)}>
      <span
        className="flex items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-display font-bold text-accent"
        style={{ width: size, height: size, fontSize: size * 0.34 }}
        role="img"
        aria-label={`Monogramme ${config.initials}`}
      >
        {config.initials}
      </span>
      {statusDot}
    </span>
  );
}
