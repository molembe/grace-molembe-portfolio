import { AdminForm } from "@/components/admin/admin-form";
import { PhotoUploader } from "@/components/admin/photo-uploader";
import { ResetButton } from "@/components/admin/reset-button";
import { profileFields } from "@/app/admin/fields";
import { saveProfileAction } from "@/app/admin/actions";
import { getProfilePhoto, getSiteConfig } from "@/lib/content";

export const dynamic = "force-dynamic";

/** Profil : identité, coordonnées, CV + photo de profil. */
export default async function AdminProfilePage() {
  const [config, photo] = await Promise.all([getSiteConfig(), getProfilePhoto()]);

  const initial = {
    name: config.name,
    shortName: config.shortName,
    initials: config.initials,
    role: config.role,
    roleFr: config.roleFr,
    tagline: config.tagline,
    intro: config.intro,
    objective: config.objective,
    availability: config.availability,
    location: config.location,
    email: config.contact.email,
    github: config.social.github,
    linkedin: config.social.linkedin,
    cvAvailable: config.cv.available,
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Profil & photo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Identité affichée dans le hero, la navigation, les métadonnées SEO et le JSON-LD.
          </p>
        </div>
        <ResetButton collection="profile" />
      </section>

      <PhotoUploader photoUrl={photo?.url ?? null} />

      <section className="card-noc p-6">
        <h2 className="font-display text-lg font-semibold">Identité & coordonnées</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Les champs laissés à <span className="font-mono text-xs">TBD</span> ne sont jamais affichés :
          les boutons et liens concernés restent masqués tant que la vraie valeur n&apos;est pas fournie.
        </p>
        <div className="mt-6">
          <AdminForm
            fields={profileFields}
            initial={initial}
            action={saveProfileAction}
            submitLabel="Enregistrer le profil"
            resetKey={`profile-${config.name}-${config.availability}-${String(config.cv.available)}`}
          />
        </div>
      </section>
    </div>
  );
}
