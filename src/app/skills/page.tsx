import { Container, PageHeader } from "@/components/ui/kit";
import { SkillsDashboard } from "@/components/skills/skills-dashboard";
import { Reveal } from "@/components/animations/reveal";
import { getSkills } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Skills",
  description:
    "Tableau de bord des compétences : networking, administration système, automatisation, virtualisation, DevOps, développement, cybersécurité et supervision — niveaux honnêtes et expérience pratique.",
  path: "/skills",
});

export default async function SkillsPage() {
  const skills = await getSkills();

  return (
    <>
      <PageHeader
        kicker="02 // SKILLS"
        title="Compétences"
        description="Chaque technologie porte un niveau déclaré sur une échelle honnête (Notions → Expert) et l'expérience pratique qui le justifie. Les niveaux sont volontairement prudents et ajustables dans les données du site."
      />

      <Container className="py-14">
        <Reveal>
          <SkillsDashboard skills={skills} />
        </Reveal>
      </Container>
    </>
  );
}
