import { Container, PageHeader } from "@/components/ui/kit";
import { ProjectFilters } from "@/components/projects/project-filters";
import { Reveal } from "@/components/animations/reveal";
import { getProjects } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "Réalisations techniques : automatisation Ansible, virtualisation Proxmox, application RH Django, PKI, supervision, Odoo, lab MPLS/VRF, application Android — statuts affichés honnêtement.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeader
        kicker="03 // PROJECTS"
        title="Réalisations techniques"
        description="Projets et laboratoires documentés. Le statut est affiché tel quel : réalisé, en cours ou expérimental — jamais un projet en cours présenté comme terminé."
      />

      <Container className="py-14">
        <Reveal>
          <ProjectFilters projects={projects} />
        </Reveal>
      </Container>
    </>
  );
}
