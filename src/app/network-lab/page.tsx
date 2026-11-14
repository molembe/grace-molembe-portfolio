import { Container, PageHeader } from "@/components/ui/kit";
import { LabCard } from "@/components/labs/lab-card";
import { Reveal } from "@/components/animations/reveal";
import { getLabs } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Network Lab",
  description:
    "Laboratoire réseau : topologies, segmentation VLAN, MPLS L3VPN, VRF, VPN IPsec, automatisation Ansible — procédures documentées, vérifications et leçons.",
  path: "/network-lab",
});

export default function NetworkLabPage() {
  const labs = getLabs("network");

  return (
    <>
      <PageHeader
        kicker="04A // NETWORK LAB"
        title="Laboratoire réseau"
        description="Chaque fiche est un environnement construit, testé et documenté : objectif, topologie, procédure étape par étape, vérification et leçons retenues."
      />

      <Container className="py-14">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {labs.map((lab, i) => (
            <Reveal key={lab.slug} delay={i * 0.05}>
              <LabCard lab={lab} href={`/network-lab/${lab.slug}`} />
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
