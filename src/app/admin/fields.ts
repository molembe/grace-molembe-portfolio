import type { AdminField } from "@/components/admin/admin-form";

/**
 * DESCRIPTEURS DE CHAMPS du back-office — objets sérialisables passés aux
 * composants clients (AdminForm). La validation réelle reste côté serveur
 * (src/app/admin/actions.ts) : ces descripteurs ne font que décrire la UI.
 */

const projectCategoryOptions = [
  { value: "networking", label: "Networking" },
  { value: "automation", label: "Automation" },
  { value: "virtualization", label: "Virtualization" },
  { value: "devops", label: "DevOps" },
  { value: "security", label: "Security" },
  { value: "development", label: "Development" },
  { value: "monitoring", label: "Monitoring" },
];

const projectStatusOptions = [
  { value: "published", label: "Réalisé · documenté (published)" },
  { value: "in-progress", label: "En cours (in-progress)" },
  { value: "experimental", label: "Expérimental · PoC (experimental)" },
];

const skillCategoryOptions = [
  { value: "networking", label: "Networking" },
  { value: "system", label: "System Administration" },
  { value: "automation", label: "Automation" },
  { value: "virtualization", label: "Virtualization" },
  { value: "devops", label: "DevOps" },
  { value: "development", label: "Development" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "monitoring", label: "Monitoring" },
];

const skillLevelOptions = [
  { value: "1", label: "1 — Notions" },
  { value: "2", label: "2 — Bases" },
  { value: "3", label: "3 — Intermédiaire" },
  { value: "4", label: "4 — Avancé" },
  { value: "5", label: "5 — Expert" },
];

const articleCategoryOptions = [
  { value: "networking", label: "Networking" },
  { value: "linux-systems", label: "Linux & Systems" },
  { value: "automation", label: "Automation" },
  { value: "devops", label: "DevOps" },
  { value: "devsecops", label: "DevSecOps" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "ai", label: "Artificial Intelligence" },
  { value: "cloud", label: "Cloud Computing" },
];

const diagramKeys =
  "vlan-segmentation · mpls-l3vpn · vpn-ipsec · ansible-flow · proxmox-cluster · pki-hierarchy · monitoring-stack · docker-stack";

/* ---------------- Profil ---------------- */

export const profileFields: AdminField[] = [
  { key: "name", label: "Nom complet", type: "text", required: true },
  { key: "shortName", label: "Nom court", type: "text", required: true, help: "Utilisé dans les mentions légales et le footer." },
  { key: "initials", label: "Initiales (monogramme)", type: "text", required: true, help: "Affichées tant qu'aucune photo n'est uploadée — ex. GM." },
  { key: "role", label: "Titre (EN)", type: "text", required: true, help: "Ex. Network & Systems Engineer." },
  { key: "roleFr", label: "Titre (FR)", type: "text", required: true },
  { key: "tagline", label: "Positionnement", type: "text", required: true, help: "Ex. Infrastructure Automation · Linux · DevSecOps · Cybersecurity." },
  { key: "intro", label: "Introduction (hero)", type: "textarea", required: true, rows: 4 },
  { key: "objective", label: "Objectif professionnel", type: "textarea", required: true, rows: 2 },
  { key: "availability", label: "Disponibilité (badge)", type: "text", required: true },
  { key: "location", label: "Localisation", type: "text", help: 'Laissez "TBD" tant que non communiquée — le champ reste masqué.' },
  { key: "email", label: "E-mail", type: "text", help: 'Laissez "TBD" tant que non communiquée.' },
  { key: "github", label: "URL GitHub", type: "text", help: 'Laissez "TBD" tant que non communiquée — ex. https://github.com/mon-profil.' },
  { key: "linkedin", label: "URL LinkedIn", type: "text", help: 'Laissez "TBD" tant que non communiquée — ex. https://linkedin.com/in/mon-profil.' },
  { key: "cvAvailable", label: "CV disponible", type: "checkbox", help: "Active le bouton de téléchargement — à cocher UNIQUEMENT après avoir déposé public/documents/cv.pdf." },
];

/* ---------------- Parcours ---------------- */

export const timelineFields: AdminField[] = [
  {
    key: "kind",
    label: "Type d'entrée",
    type: "select",
    required: true,
    options: [
      { value: "work", label: "Expérience professionnelle" },
      { value: "education", label: "Formation" },
    ],
  },
  { key: "title", label: "Intitulé du poste / formation", type: "text", required: true, full: true },
  { key: "org", label: "Organisme / entreprise", type: "text", required: true },
  { key: "period", label: "Période", type: "text", required: true, help: 'Ex. "2024 — 2025", "Été 2025" ou "Période à préciser".' },
  { key: "highlights", label: "Points clés", type: "lines", required: true, rows: 6, full: true, help: "Une réalisation ou mission par ligne." },
];

/* ---------------- Projets ---------------- */

export const projectFields: AdminField[] = [
  { key: "slug", label: "Slug (URL)", type: "text", required: true, help: "ex. automatisation-reseau-ansible — définit /projects/<slug>." },
  { key: "title", label: "Titre", type: "text", required: true },
  { key: "category", label: "Catégorie", type: "select", required: true, options: projectCategoryOptions },
  { key: "status", label: "Statut (affiché tel quel)", type: "select", required: true, options: projectStatusOptions, help: "Ne jamais présenter un projet en cours comme terminé." },
  { key: "period", label: "Période", type: "text", help: "Ex. 2025 — optionnel." },
  { key: "featured", label: "Mis en avant (accueil)", type: "checkbox", help: "Les 3 premiers projets « featured » apparaissent sur la page d'accueil." },
  { key: "summary", label: "Résumé (cartes)", type: "textarea", required: true, rows: 3, full: true },
  { key: "problem", label: "Problème / besoin", type: "textarea", required: true, rows: 4, full: true },
  { key: "objectives", label: "Objectifs", type: "lines", required: true, rows: 4, full: true, help: "Un objectif par ligne." },
  { key: "architecture", label: "Architecture / démarche", type: "textarea", required: true, rows: 4, full: true },
  { key: "diagram", label: "Topologie SVG", type: "text", help: `Clé optionnelle : ${diagramKeys}.` },
  { key: "stack", label: "Stack technique", type: "lines", required: true, rows: 3, full: true, help: "Une technologie par ligne." },
  { key: "challenges", label: "Défis & solutions", type: "challenges", rows: 5, full: true, help: "Une ligne par défi au format : Défi => Solution" },
  { key: "results", label: "Résultats", type: "lines", required: true, rows: 4, full: true, help: "Un résultat vérifiable par ligne." },
  { key: "screenshots", label: "Captures", type: "lines", rows: 2, full: true, help: "Chemins sous /projects/<slug>/ — ex. projets/mon-slug/topologie.png. Slots vides affichés « à fournir »." },
  { key: "github", label: "URL GitHub", type: "text", help: "Uniquement si le dépôt réel existe — sinon vide." },
];

/* ---------------- Compétences ---------------- */

export const skillFields: AdminField[] = [
  { key: "name", label: "Nom de la technologie", type: "text", required: true },
  { key: "category", label: "Catégorie", type: "select", required: true, options: skillCategoryOptions },
  { key: "level", label: "Niveau (échelle honnête)", type: "select", required: true, options: skillLevelOptions, help: "Ne déclarez un niveau que s'il est justifié par une pratique réelle." },
  { key: "brand", label: "Logo de marque", type: "text", help: "Clé optionnelle du registre d'icônes (ex. linux, docker, ansible) — vide si inconnue." },
  { key: "description", label: "Description", type: "textarea", required: true, rows: 2, full: true },
  { key: "practice", label: "Pratique concrète", type: "textarea", required: true, rows: 3, full: true, help: "Lab, stage ou projet qui justifie le niveau déclaré." },
];

/* ---------------- Articles ---------------- */

export const articleFields: AdminField[] = [
  { key: "slug", label: "Slug (URL)", type: "text", required: true, help: "ex. durcissement-ssh-ubuntu — définit /blog/<slug>." },
  { key: "title", label: "Titre", type: "text", required: true },
  { key: "category", label: "Catégorie", type: "select", required: true, options: articleCategoryOptions },
  { key: "date", label: "Date de rédaction", type: "text", required: true, help: "Format AAAA-MM-JJ — la date réelle, jamais antidatée." },
  { key: "excerpt", label: "Extrait (cartes)", type: "textarea", required: true, rows: 3, full: true },
  { key: "related", label: "Articles liés", type: "lines", rows: 2, full: true, help: "Un slug par ligne (optionnel)." },
  { key: "body", label: "Corps de l'article (Markdown)", type: "markdown", required: true, rows: 18, full: true, help: "Markdown supporté : ## titres, listes, ```blocs de code```." },
];
