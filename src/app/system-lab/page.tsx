import { Container, PageHeader } from "@/components/ui/kit";
import { LabCard } from "@/components/labs/lab-card";
import { Reveal } from "@/components/animations/reveal";
import { getLabs } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "System Lab",
  description:
    "Laboratoire système : Ubuntu Server, Docker, Proxmox VE, Nginx, PostgreSQL, PKI interne, durcissement des serveurs — fiches techniques reproductibles.",
  path: "/system-lab",
});

export default function SystemLabPage() {
  const labs = getLabs("system");

  return (
    <>
      <PageHeader
        kicker="04B // SYSTEM LAB"
        title="Laboratoire système"
        description="Fiches techniques reproductibles sur les systèmes du lab : socle Ubuntu, conteneurisation, hypervision, reverse proxy, bases de données, PKI et durcissement."
      />

      <Container className="py-14">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {labs.map((lab, i) => (
            <Reveal key={lab.slug} delay={i * 0.05}>
              <LabCard lab={lab} href={`/system-lab/${lab.slug}`} />
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
