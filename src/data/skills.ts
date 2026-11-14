import type { Skill, SkillCategory } from "@/types";

/**
 * COMPÉTENCES — niveaux par DÉFAUT prudents, à ajuster ligne par ligne.
 *
 * ÉCHELLE HONNÊTE :
 *  1 Notions        — découvert, manipulé en cours
 *  2 Bases          — utilisé en lab avec documentation à portée de main
 *  3 Intermédiaire  — autonome sur un usage courant
 *  4 Avancé         — production + optimisation + dépannage profond
 *  5 Expert         — référent, capable de concevoir et d'enseigner
 *
 * Chaque entrée porte une expérience pratique réelle (lab, stage, projet)
 * pour justifier le niveau déclaré. Aucun niveau inventé sans pratique.
 */

export const skillCategories: { id: SkillCategory; label: string; blurb: string }[] = [
  {
    id: "networking",
    label: "Networking",
    blurb: "Conception et exploitation d'architectures IP segmentées et routées.",
  },
  {
    id: "system",
    label: "System Administration",
    blurb: "Administration des serveurs Linux et Windows, services réseau.",
  },
  {
    id: "automation",
    label: "Automation",
    blurb: "Infrastructure as code et industrialisation des configurations.",
  },
  {
    id: "virtualization",
    label: "Virtualization",
    blurb: "Hyperviseurs et laboratoires réseau virtualisés.",
  },
  {
    id: "devops",
    label: "DevOps",
    blurb: "Conteneurisation, pipelines CI/CD et reverse proxy.",
  },
  {
    id: "development",
    label: "Development",
    blurb: "Développement d'outils et d'applications web.",
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity",
    blurb: "PKI, TLS, durcissement des systèmes et des réseaux.",
  },
  {
    id: "monitoring",
    label: "Monitoring",
    blurb: "Supervision d'infrastructures et analyse de trafic.",
  },
];

export const skills: Skill[] = [
  /* ---------- Networking ---------- */
  {
    name: "TCP/IP",
    category: "networking",
    level: 3,
    description:
      "Modèle en couches, adressage IPv4/IPv6, sous-réseaux, tables de routage, analyse de flux.",
    practice:
      "Diagnostiques quotidiens en lab : capture de paquets, vérification de chemins, résolution de problèmes de routage dans GNS3.",
  },
  {
    name: "VLAN",
    category: "networking",
    level: 3,
    description: "Segmentation L2, trunks 802.1Q, routage inter-VLAN.",
    practice:
      "Segmentation complète d'un lab (management, users, serveurs, supervision) sur commutateurs et routeurs émulés.",
  },
  {
    name: "Routing",
    category: "networking",
    level: 3,
    description: "Routage statique, protocoles IGP, redistribution, filtrage.",
    practice:
      "Labs de routage statique et dynamique sur GNS3, vérification des tables et du plan de données.",
  },
  {
    name: "Switching",
    category: "networking",
    level: 3,
    description: "Commutation L2, STP, agrégation de liens, sécurité de port.",
    practice:
      "Configuration de commutateurs dans le lab : trunks, EtherChannel, bonnes pratiques STP.",
  },
  {
    name: "MPLS",
    category: "networking",
    level: 2,
    description: "Label switching, LDP, architecture PE/P, L3VPN.",
    practice:
      "PoC MPLS L3VPN complète dans GNS3 : labels, MP-BGP VPNv4, isolation de clients.",
  },
  {
    name: "VRF",
    category: "networking",
    level: 2,
    description: "Tables de routage virtuelles, isolation L3 par contexte.",
    practice:
      "Segmentation de clients dans le lab MPLS : VRF par client, import/export de route-target.",
  },
  {
    name: "VPN",
    category: "networking",
    level: 2,
    description: "Tunnels site-à-site et accès distant, chiffrement IPsec.",
    practice:
      "Tunnels IPsec entre sites de lab, tests de joignabilité et vérification des SAs.",
  },
  {
    name: "DNS",
    category: "networking",
    level: 3,
    description: "Zones, enregistrements, résolution récursive, serveurs autoritaires.",
    practice:
      "Serveurs DNS de lab (bind) pour les zones internes, tests de résolution et de délégation.",
  },
  {
    name: "DHCP",
    category: "networking",
    level: 3,
    description: "Baux, relais, réservations, intégration VLAN.",
    practice:
      "DHCP par VLAN avec relais dans le lab, réservations pour l'infrastructure.",
  },

  /* ---------- System Administration ---------- */
  {
    name: "Linux",
    category: "system",
    level: 3,
    description: "Administration Debian/Ubuntu : services, permissions, journal, réseau.",
    practice:
      "Serveurs de lab administrés au quotidien : systemd, journalctl, gestion des paquets, durcissement de base.",
    brand: "linux",
  },
  {
    name: "Ubuntu Server",
    category: "system",
    level: 3,
    description: "Installation, netplan, LVM, mises à jour, sauvegardes.",
    practice:
      "Système d'exploitation principal des labs et des VMs Proxmox (templates cloud-init).",
    brand: "ubuntu",
  },
  {
    name: "Windows Server",
    category: "system",
    level: 2,
    description: "AD DS, GPO de base, DNS/DHCP Microsoft, partage de fichiers.",
    practice:
      "VMs Windows Server dans le lab : domaine, GPO simples, services réseau de base.",
    brand: "windows",
  },
  {
    name: "SSH",
    category: "system",
    level: 4,
    description: "Authentification par clé, tunnels, durcissement du démon.",
    practice:
      "Accès à tous les équipements du lab en SSH par clé ; durcissement appliqué (désactivation root/password).",
  },
  {
    name: "Bash",
    category: "system",
    level: 3,
    description: "Scripting d'automatisation : cron, parsing, gestion d'erreurs.",
    practice:
      "Scripts de sauvegarde, de vérification d'état et d'exploitation des logs dans les labs.",
    brand: "bash",
  },
  {
    name: "Services réseau",
    category: "system",
    level: 3,
    description: "Nginx, SSH, DNS, DHCP, NFS : configuration et exploitation.",
    practice:
      "Déploiement et exploitation de ces services sur les serveurs de lab.",
  },

  /* ---------- Automation ---------- */
  {
    name: "Ansible",
    category: "automation",
    level: 3,
    description:
      "Playbooks idempotents, rôles, inventaires, modules réseau et système.",
    practice:
      "Automatisation complète du lab réseau (VLANs, interfaces, sauvegardes) et des serveurs (durcissement, paquets).",
    brand: "ansible",
  },
  {
    name: "Python",
    category: "automation",
    level: 3,
    description: "Scripts d'administration, parsing, API, outils CLI.",
    practice:
      "Outils de supervision et de gestion, scripts Django, automatisations diverses du lab.",
    brand: "python",
  },
  {
    name: "Git",
    category: "automation",
    level: 3,
    description: "Branches, historique propre, résolution de conflits.",
    practice:
      "Tout le contenu des labs et du site versionné ; revue de l'historique avant chaque changement.",
    brand: "git",
  },
  {
    name: "GitHub",
    category: "automation",
    level: 3,
    description: "Dépôts distants, Pull Requests, GitHub Actions de base.",
    practice:
      "Hébergement des projets et des playbooks ; workflows de lint simples.",
    brand: "github",
  },
  {
    name: "Infrastructure as Code",
    category: "automation",
    level: 3,
    description: "Configuration déclarative, versionnée et reproductible.",
    practice:
      "Toute la configuration du lab passe par le dépôt Git (Ansible, scripts, documentation).",
  },

  /* ---------- Virtualization ---------- */
  {
    name: "Proxmox VE",
    category: "virtualization",
    level: 3,
    description: "VMs, conteneurs LXC, stockage, sauvegardes, réseau virtuel.",
    practice:
      "Hyperviseur principal du lab : templates cloud-init, sauvegardes planifiées, bridges par VLAN.",
    brand: "proxmox",
  },
  {
    name: "VMware",
    category: "virtualization",
    level: 2,
    description: "ESXi/vSphere : notions, VMs, vSwitch.",
    practice:
      "Manipulation de VMs sur ESXi de lab (snapshots, réseau virtuel, consoles).",
    brand: "vmware",
  },
  {
    name: "GNS3",
    category: "virtualization",
    level: 3,
    description: "Émulation réseau : topologies, images routeurs, liaisons avec le réel.",
    practice:
      "Tous les labs réseau (MPLS, VRF, VPN, VLANs) construits et testés dans GNS3.",
    brand: "gns3",
  },

  /* ---------- DevOps ---------- */
  {
    name: "Docker",
    category: "devops",
    level: 3,
    description: "Images, volumes, réseaux, Dockerfile multi-stage.",
    practice:
      "Conteneurisation des services de lab ; ce portfolio est dockerisé avec un Dockerfile multi-stage.",
    brand: "docker",
  },
  {
    name: "Docker Compose",
    category: "devops",
    level: 3,
    description: "Stacks multi-conteneurs déclaratives, réseaux, dépendances.",
    practice:
      "Stack portfolio (app + nginx + certbot) décrite en compose pour le déploiement VPS.",
    brand: "docker",
  },
  {
    name: "CI/CD",
    category: "devops",
    level: 2,
    description: "Pipelines de build/test/déploiement automatisés.",
    practice:
      "Workflows GitHub Actions simples : lint et build vérifiés à chaque push.",
  },
  {
    name: "Nginx",
    category: "devops",
    level: 3,
    description: "Reverse proxy, TLS, cache statique, en-têtes de sécurité.",
    practice:
      "Frontal du portfolio et des apps de lab : TLS terminé, gzip, headers, cache.",
    brand: "nginx",
  },

  /* ---------- Development ---------- */
  {
    name: "Python",
    category: "development",
    level: 3,
    description: "Langage principal : backend Django, scripts, outils.",
    practice:
      "Application RH Django, scripts d'exploitation, parseur de dates pour Rappel IA.",
    brand: "python",
  },
  {
    name: "Django",
    category: "development",
    level: 3,
    description: "MTV, ORM, authentification, admin, déploiement Gunicorn.",
    practice:
      "Application de gestion des dossiers RH : rôles, audit, recherche, déploiement de test.",
    brand: "django",
  },
  {
    name: "React",
    category: "development",
    level: 2,
    description: "Composants, hooks, état local, rendu déclaratif.",
    practice:
      "Interfaces d'outils internes et ce portfolio (composants interactifs).",
    brand: "react",
  },
  {
    name: "TypeScript",
    category: "development",
    level: 2,
    description: "Typage statique de JavaScript, interfaces, génériques.",
    practice:
      "Typage strict de l'ensemble du code de ce portfolio (données, composants, API).",
    brand: "typescript",
  },
  {
    name: "PHP",
    category: "development",
    level: 2,
    description: "Bases du web dynamique, formulaires, sessions.",
    practice:
      "Travaux pratiques académiques : mini-applications web PHP/MySQL.",
  },

  /* ---------- Cybersecurity ---------- */
  {
    name: "PKI",
    category: "cybersecurity",
    level: 3,
    description: "Chaînes de confiance, CA racine/intermédiaire, CRL, cycles de vie.",
    practice:
      "PKI de lab complète : racine hors ligne, intermédiaire, émission, déploiement, révocation.",
  },
  {
    name: "TLS/SSL",
    category: "cybersecurity",
    level: 3,
    description: "Configuration serveur, suites modernes, certificats, tests.",
    practice:
      "TLS 1.2/1.3 imposé sur Nginx avec en-têtes de sécurité ; vérification par outils d'analyse.",
  },
  {
    name: "SSH Hardening",
    category: "cybersecurity",
    level: 3,
    description: "Clés uniquement, désactivation root, algorithmes, fail2ban.",
    practice:
      "Durcissement systématique des serveurs du lab et documentation de la procédure.",
  },
  {
    name: "Linux Security",
    category: "cybersecurity",
    level: 3,
    description: "Permissions, utilisateurs, pare-feu nftables/ufw, mises à jour.",
    practice:
      "Baseline de durcissement appliquée aux serveurs (ufw, permissions, audit de base).",
  },
  {
    name: "Network Security",
    category: "cybersecurity",
    level: 3,
    description: "Segmentation, filtrage, zones, moindre privilège réseau.",
    practice:
      "Zones isolées par VLAN/VRF dans les labs, ACL et filtrage inter-zones.",
  },

  /* ---------- Monitoring ---------- */
  {
    name: "Nagios",
    category: "monitoring",
    level: 2,
    description: "Checks actifs/passifs, hôtes/services, notifications, NRPE.",
    practice:
      "Supervision du lab (SSH, HTTP, disque, ping) avec seuils et dépendances calibrés.",
    brand: "nagios",
  },
  {
    name: "Glances",
    category: "monitoring",
    level: 2,
    description: "Métriques système temps réel, mode serveur/web.",
    practice:
      "Vue système instantanée des serveurs du lab, en mode web pour la granularité.",
    brand: "glances",
  },
  {
    name: "GoAccess",
    category: "monitoring",
    level: 2,
    description: "Analyse de logs web en temps réel (visites, codes, clients).",
    practice:
      "Tableaux de bord quotidiens sur les logs Nginx du lab et du portfolio.",
    brand: "goaccess",
  },
];

export const skillLevelLabels: Record<number, string> = {
  1: "Notions",
  2: "Bases",
  3: "Intermédiaire",
  4: "Avancé",
  5: "Expert",
};
