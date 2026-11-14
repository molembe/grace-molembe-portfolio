import { ButtonLink, Container } from "@/components/ui/kit";

export const metadata = {
  title: "404 — Route introuvable",
};

/** 404 façon console : « Route lookup failed ». */
export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-sm text-accent" aria-hidden>
        $ traceroute --destination /votre-url
      </p>
      <h1 className="mt-6 font-display text-7xl font-bold text-gradient sm:text-8xl">404</h1>
      <p className="mt-4 font-mono text-sm text-muted-foreground">
        Route lookup failed: host unreachable
      </p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Cette page n&apos;existe pas — ou a été décommissionnée. Vérifiez l&apos;URL ou
        reprenez depuis un point d&apos;entrée connu :
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Retour à l&apos;accueil</ButtonLink>
        <ButtonLink href="/projects" variant="outline">
          Voir les projets
        </ButtonLink>
        <ButtonLink href="/contact" variant="outline">
          Contact
        </ButtonLink>
      </div>
      <p className="mt-10 font-mono text-[11px] text-muted-foreground/60">
        Astuce : Ctrl + K ouvre la palette de navigation.
      </p>
    </Container>
  );
}
