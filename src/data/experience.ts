import type { TimelineEntry } from "@/types";

/**
 * PARCOURS — factuel, sans responsabilité inventée.
 * Les périodes et organismes manquants sont marqués « À préciser »
 * jusqu'à fourniture des informations réelles par le propriétaire.
 */

export const timeline: TimelineEntry[] = [
  {
    kind: "work",
    title: "Stage — Découverte des infrastructures informatiques",
    org: "ARCEP",
    period: "Période à préciser",
    highlights: [
      "Découverte des infrastructures informatiques d'une organisation (serveurs, réseau, services).",
      "Administration et suivi du parc informatique : inventaire, états, déplacements d'équipements.",
      "Gestion et suivi des imprimantes : déploiement, consommables, incidents.",
      "Découverte de la supervision des systèmes et services.",
      "Participation aux activités techniques de l'équipe : interventions, assistance, documentation.",
      "Apprentissage des rythmes et exigences d'un environnement informatique professionnel.",
    ],
  },
  {
    kind: "education",
    title: "Génie Informatique — Spécialisation Réseaux et Systèmes Informatiques",
    org: "Établissement à préciser",
    period: "Période à préciser",
    highlights: [
      "Formation d'ingénieur en Génie Informatique.",
      "Spécialisation en Réseaux et Systèmes Informatiques : architectures, administration, sécurité.",
      "Projets pratiques : virtualisation, automatisation, supervision, développement d'applications.",
      "Laboratoires personnels documentés (voir Network Lab et System Lab).",
    ],
  },
];

export const experienceHighlights = {
  intro:
    "Mon parcours combine une formation d'ingénieur en Génie Informatique orientée réseaux et systèmes, une expérience de terrain à l'ARCEP et des laboratoires personnels documentés. Je présente ici ce que j'ai réellement fait et appris — pas davantage.",
  objectives: [
    "Concevoir et exploiter des infrastructures réseau fiables et documentées",
    "Industrialiser l'administration des systèmes (automatisation, IaC)",
    "Intégrer la sécurité dès la conception (durcissement, PKI, segmentation)",
    "Développer des outils utiles aux équipes d'exploitation",
  ],
  vision:
    "L'ingénierie informatique est une discipline d'équipe où la fiabilité se construit : architecture réfléchie, configuration versionnée, supervision constante et documentation honnête. Je crois aux infrastructures que l'on peut comprendre, reproduire et auditer — et à l'apprentissage continu que réclament les réseaux et les systèmes.",
};
