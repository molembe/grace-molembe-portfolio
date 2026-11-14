import type { Project } from "@/types";

/**
 * RÉALISATIONS TECHNIQUES.
 *
 * STATUTS (affichés tels quels, jamais travestis) :
 *  - published    : réalisé et documenté (lab personnel ou projet livré)
 *  - in-progress  : en cours — JAMAIS présenté comme terminé
 *  - experimental : preuve de concept / lab exploratoire
 *
 * CONTENU : descriptions types de labs standards, à ajuster/personnaliser
 * par le propriétaire (challenges, résultats, captures, liens GitHub).
 * Les captures attendues sous /public/projects/<slug>/ sont des slots :
 * la UI affiche un cadre « Capture à fournir » si le fichier manque.
 * `github` n'est renseigné que si l'URL réelle est fournie.
 */

export const projects: Project[] = [
  {
    slug: "automatisation-reseau-ansible",
    title: "Automatisation réseau avec Ansible",
    category: "automation",
    status: "published",
    summary:
      "Automatisation de la configuration d'un parc de routeurs et commutateurs de lab : playbooks idempotents pour VLAN, interfaces, routes et sauvegarde centralisée des configurations.",
    problem:
      "Configurer chaque équipement réseau à la main est long, répétitif et sujet aux erreurs humaines : deux configurations « identiques » divergent vite, et aucune traçabilité des changements n'existe. Le besoin était un socle reproductible, versionné dans Git, capable de pousser une configuration cohérente sur plusieurs équipements en une commande.",
    objectives: [
      "Versionner toute la configuration réseau dans Git (infrastructure as code)",
      "Écrire des playbooks idempotents : VLANs, interfaces, routage inter-VLAN",
      "Centraliser la sauvegarde horodatée des configurations d'équipements",
      "Vérifier l'état avant/après exécution (dry-run, tests de connectivité)",
    ],
    architecture:
      "Un nœud de contrôle Ansible sous Ubuntu Server orchestre les équipements en SSH. L'inventaire est organisé par rôle (core, distribution, access) et par site. Les rôles sont découpés par fonction (vlans, interfaces, routing, backup) avec des variables par groupe. Les playbooks sont exécutés depuis un dépôt Git, et les configurations récupérées sont archivées par date dans un répertoire dédié.",
    diagram: "ansible-flow",
    stack: ["Ansible", "Ubuntu Server", "Linux", "Git", "Bash", "SSH", "GNS3"],
    challenges: [
      {
        challenge:
          "Modules réseau hétérogènes selon les plateformes d'équipements émulées dans GNS3.",
        solution:
          "Structuration en rôles avec variables par groupe d'inventaire et tests systématiques en --check avant application réelle.",
      },
      {
        challenge: "Idempotence difficile sur certaines commandes de configuration.",
        solution:
          "Passage par des modules déclaratifs quand ils existent, et par des tâches conditionnées à des commandes de vérification sinon.",
      },
    ],
    results: [
      "Déploiement d'une configuration VLAN complète sur le lab en une seule commande",
      "Sauvegardes de configuration horodatées et restaurables",
      "Historique Git complet des changements de configuration",
    ],
    screenshots: [
      "/projects/automatisation-reseau-ansible/playbook-run.png",
      "/projects/automatisation-reseau-ansible/vlan-check.png",
    ],
    featured: true,
  },
  {
    slug: "infrastructure-virtualisation-proxmox",
    title: "Infrastructure de virtualisation avec Proxmox VE",
    category: "virtualization",
    status: "published",
    summary:
      "Mise en place d'une infrastructure de virtualisation Proxmox VE pour héberger des serveurs de lab : VMs Ubuntu Server et Windows Server, conteneurs LXC, sauvegardes planifiées et réseau virtuel segmenté.",
    problem:
      "Les tests d'infrastructures (serveurs, supervision, PKI) exigent des machines jetables, isolées et rapidement reproductibles. Installer physiquement chaque serveur est impossible : il fallait une plateforme de virtualisation souple, avec isolation réseau et sauvegarde fiable.",
    objectives: [
      "Déployer un hôte Proxmox VE avec stockage dédié aux VMs et conteneurs",
      "Segmenter le réseau virtuel : VLANs et bridges dédiés par zone",
      "Automatiser la création de VMs Ubuntu Server (templates + cloud-init)",
      "Planifier des sauvegardes testées (snapshot + backup vzdump)",
    ],
    architecture:
      "L'hôte Proxmox VE expose des bridges Linux mappés sur des VLANs. Les templates cloud-init permettent de créer une VM Ubuntu Server configurée (hostname, IP, clé SSH) en moins de deux minutes. Les conteneurs LXC hébergent les services légers (Nginx, supervision), les VMs les services exigeants. Les sauvegardes vzdump sont planifiées la nuit sur un stockage séparé.",
    diagram: "proxmox-cluster",
    stack: ["Proxmox VE", "Ubuntu Server", "Windows Server", "LXC", "cloud-init", "VLAN"],
    challenges: [
      {
        challenge: "Isolation réseau entre zones de lab tout en gardant un accès d'administration.",
        solution:
          "Bridges Proxmox mappés sur des VLANs dédiés, avec un bridge d'administration séparé du trafic des VMs.",
      },
      {
        challenge: "Temps de déploiement des VMs trop long à la main.",
        solution:
          "Templates cloud-init : provisionnement paramétré (IP, hostname, clés) à la création.",
      },
    ],
    results: [
      "VM opérationnelle en moins de 2 minutes à partir d'un template",
      "Zones réseau isolées pour les labs sécurité et services",
      "Sauvegardes nocturnes automatiques, restauration testée",
    ],
    screenshots: [
      "/projects/infrastructure-virtualisation-proxmox/cluster-view.png",
      "/projects/infrastructure-virtualisation-proxmox/backup-jobs.png",
    ],
    featured: true,
  },
  {
    slug: "application-gestion-rh-django",
    title: "Application de gestion des dossiers RH avec Django",
    category: "development",
    status: "published",
    summary:
      "Application web de gestion des dossiers du personnel (agents, contrats, documents) développée avec Django : authentification par rôle, CRUD sécurisé, recherche et historique des modifications.",
    problem:
      "Suivre les dossiers du personnel dans des fichiers dispersés rend la recherche lente et la traçabilité nulle : qui a modifié quoi, quand ? Le besoin était une application centralisée avec des droits différenciés selon les profils et un historique des changements.",
    objectives: [
      "Modéliser agents, contrats, documents et affectations",
      "Authentification et autorisation par rôles (administration, consultation)",
      "Recherche multi-critères et export des listes",
      "Journaliser chaque modification (qui, quoi, quand)",
    ],
    architecture:
      "Application Django (MTV) avec PostgreSQL, interface d'administration Django personnalisée. Les vues sensibles sont protégées par des permissions par rôle, les formulaires validés côté serveur, et un modèle d'audit enregistre les créations/modifications avec l'utilisateur et l'horodatage. Déploiement de test avec Gunicorn derrière Nginx.",
    stack: ["Python", "Django", "PostgreSQL", "Nginx", "Gunicorn", "HTML/CSS"],
    challenges: [
      {
        challenge: "Droits d'accès fins sans complexifier l'administration.",
        solution:
          "Groupes Django + permissions par modèle, décorateurs de vue et queryset filtré par rôle.",
      },
      {
        challenge: "Traçabilité des modifications sur tous les modèles sensibles.",
        solution:
          "Modèle d'audit central alimenté via signals post_save/post_delete avec l'utilisateur courant.",
      },
    ],
    results: [
      "CRUD complet opérationnel avec recherche et filtres",
      "Historique d'audit consultable pour chaque dossier",
      "Déployée en environnement de test derrière Nginx",
    ],
    screenshots: [
      "/projects/application-gestion-rh-django/liste-agents.png",
      "/projects/application-gestion-rh-django/fiche-agent.png",
    ],
    featured: true,
  },
  {
    slug: "infrastructure-pki-certificats",
    title: "Infrastructure PKI et gestion des certificats",
    category: "security",
    status: "published",
    summary:
      "Conception d'une PKI de lab : autorité racine hors ligne, autorité intermédiaire, émission et révocation de certificats serveurs, TLS sur Nginx et durcissement SSH par clé.",
    problem:
      "Les services de lab communiquent en clair ou avec des certificats auto-signés non vérifiables. Il fallait une chaîne de confiance propre : une racine protégée, une intermédiaire opérationnelle, et un processus documenté d'émission, de déploiement et de révocation.",
    objectives: [
      "Monter une hiérarchie Root CA (hors ligne) → Intermediate CA",
      "Émettre des certificats serveurs avec SAN corrects",
      "Déployer TLS sur Nginx et imposer les versions/par suites modernes",
      "Documenter la révocation (CRL) et le renouvellement",
    ],
    architecture:
      "La clé racine est générée sur une machine isolée et chiffrée au repos. L'intermédiaire signe les certificats finaux (serveurs, clients). OpenSSL assure la génération (CSR, extensions x509v3, SAN). Nginx sert en TLS 1.2/1.3 avec en-têtes de sécurité, et la CRL est publiée pour la révocation. SSH durci : authentification par clé uniquement.",
    diagram: "pki-hierarchy",
    stack: ["OpenSSL", "TLS/SSL", "Nginx", "Ubuntu Server", "SSH", "Linux Security"],
    challenges: [
      {
        challenge: "Éviter les pièges classiques : SAN manquants, extensions absentes, chaîne incomplète.",
        solution:
          "Fichiers de configuration OpenSSL par type de certificat (ca, server, client) et vérification systématique avec openssl verify / openssl x509 -text.",
      },
      {
        challenge: "Sécuriser la clé racine tout en gardant l'intermédiaire utilisable.",
        solution:
          "Racine hors ligne (machine isolée, clé chiffrée), intermédiaire seule exposée aux opérations de signature.",
      },
    ],
    results: [
      "Chaîne de confiance complète et vérifiable (verify OK)",
      "Nginx servi en TLS avec note de configuration solide",
      "Procédure d'émission et de révocation documentée et réutilisable",
    ],
    screenshots: [
      "/projects/infrastructure-pki-certificats/cert-chain.png",
      "/projects/infrastructure-pki-certificats/nginx-tls.png",
    ],
  },
  {
    slug: "supervision-serveurs-services",
    title: "Supervision des serveurs et services",
    category: "monitoring",
    status: "published",
    summary:
      "Mise en place d'une supervision de lab avec Nagios Core : état des services (SSH, HTTP, ping), notifications, et compléments temps réel avec Glances et GoAccess pour les logs web.",
    problem:
      "Un service qui tombe ne doit pas être découvert par l'utilisateur. Le besoin était de connaître l'état des machines et services critiques en continu, d'être alerté, et d'avoir une vue rapide des métriques et du trafic web.",
    objectives: [
      "Superviser disponibilité machine (ping) et services (SSH, HTTP, disque)",
      "Configurer des notifications claires (état, service, depuis quand)",
      "Ajouter une vue temps réel système avec Glances",
      "Analyser le trafic web avec GoAccess sur les logs Nginx",
    ],
    architecture:
      "Serveur Nagios Core supervisant les hôtes du lab via des checks actifs (check_ping, check_ssh, check_http, check_disk via NRPE). Glances est déployé en mode serveur/web sur les machines à observer. GoAccess traite les logs Nginx en temps réel pour les visites, codes HTTP et adresses clientes.",
    diagram: "monitoring-stack",
    stack: ["Nagios", "Glances", "GoAccess", "NRPE", "Ubuntu Server", "Nginx", "Bash"],
    challenges: [
      {
        challenge: "Faux positifs de supervision (seuils mal calibrés, checks pendant les sauvegardes).",
        solution:
          "Seuils distincts warning/critical par service, fenêtres de maintenance et dépendances entre hôtes.",
      },
      {
        challenge: "Rendre la supervision lisible d'un coup d'œil.",
        solution:
          "Dashboard Nagios épuré + Glances en mode web pour la granularité système par machine.",
      },
    ],
    results: [
      "Détection des pannes en quelques minutes au lieu d'une découverte manuelle",
      "Historique d'état consultable par hôte et par service",
      "Analyse trafic web quotidienne automatisée avec GoAccess",
    ],
    screenshots: [
      "/projects/supervision-serveurs-services/nagios-dashboard.png",
      "/projects/supervision-serveurs-services/glances-web.png",
    ],
  },
  {
    slug: "gestion-stock-informatique-odoo",
    title: "Gestion de stock informatique avec Odoo",
    category: "development",
    status: "published",
    summary:
      "Paramétrage d'Odoo pour gérer un stock de matériel informatique : articles, emplacements, mouvements (entrée/sortie/affectation) et états des équipements.",
    problem:
      "Le suivi du matériel (PC, switchs, imprimantes, consommables) dans des tableurs perd l'historique des mouvements et les états. Il fallait un référentiel unique, multi-utilisateurs, avec traçabilité des entrées/sorties et des affectations.",
    objectives: [
      "Modéliser le catalogue matériel et les emplacements de stockage",
      "Tracer chaque mouvement (réception, sortie, retour, rebut)",
      "Suivre l'état des équipements (neuf, en service, SAV, réformé)",
      "Produire des états de stock à date",
    ],
    architecture:
      "Odoo (Community) avec le module Inventaire paramétré : catégories d'articles, unités, emplacements logiques (atelier, prêt, production, rebut). Les transferts internes modélisent les affectations, et des champs personnalisés suivent l'état de l'équipement et son numéro de série.",
    stack: ["Odoo", "PostgreSQL", "Python", "Linux"],
    challenges: [
      {
        challenge: "Modéliser des affectations matérielles avec les concepts « ERP » génériques.",
        solution:
          "Utilisation des transferts internes entre emplacements dédiés (prêt → production) plutôt que d'ajouter un module externe.",
      },
      {
        challenge: "Fiabiliser les numéros de série saisis.",
        solution:
          "Unicité contrôlée à la saisie et rapprochement avec les bons de réception.",
      },
    ],
    results: [
      "Référentiel matériel unique avec historique complet des mouvements",
      "Inventaires à date fiables et exportables",
      "États des équipements visibles en un clic",
    ],
    screenshots: [
      "/projects/gestion-stock-informatique-odoo/inventaire.png",
      "/projects/gestion-stock-informatique-odoo/mouvements.png",
    ],
  },
  {
    slug: "laboratoire-mpls-vrf",
    title: "Laboratoire réseau MPLS et VRF",
    category: "networking",
    status: "experimental",
    summary:
      "Preuve de concept MPLS L3VPN : segmentation VRF sur routeurs PE, MP-BGP pour la propagation des routes VPN, et labovulation de la coexistence de clients isolés sur un même cœur.",
    problem:
      "Comment un opérateur transporte-t-il les trafics de plusieurs clients isolés sur une même infrastructure ? L'objectif pédagogique était de le démontrer concrètement : VRF par client, MP-BGP entre PE, label MPLS dans le cœur — et vérifier l'isolation de bout en bout.",
    objectives: [
      "Segmenter le plan de contrôle avec un VRF par client sur les PE",
      "Établir MP-BGP (VPNv4) entre routeurs PE avec routes distinguées RD/RT",
      "Activer le label switching (LDP) dans le cœur P",
      "Démontrer l'isolation : mêmes sous-réseaux côté clients, zéro fuite",
    ],
    architecture:
      "Topologie lab : deux clients (A, B) raccordés à deux PE via des VRF distincts. Le cœur (routeurs P) transporte les paquets labellisés ; les PE échangent les routes VPN via MP-BGP (address-family VPNv4) avec import/export de route-target. Les tests se font avec des tables de routage séparées (show ip route vrf) et des traces bout-en-bout par client.",
    diagram: "mpls-l3vpn",
    stack: ["MPLS", "VRF", "MP-BGP", "LDP", "GNS3", "Routage", "TCP/IP"],
    challenges: [
      {
        challenge: "Comprendre pourquoi les routes VPN n'apparaissaient pas côté PE distant.",
        solution:
          "Vérification méthodique : neighbor activé en VPNv4, route-target import/export cohérents, next-hop atteignable dans le cœur (LDP actif).",
      },
      {
        challenge: "Isolation à prouver, pas à supposer.",
        solution:
          "Plan de tests : mêmes plages IP chez les deux clients, tests croisés de joignabilité — échec attendu et constaté, isolation validée.",
      },
    ],
    results: [
      "Deux clients isolés transportés sur un même cœur MPLS",
      "Procédure de débogage MP-BGP/VPNv4 documentée",
      "Topologie GNS3 réutilisable pour les prochains labs VPN",
    ],
    screenshots: [
      "/projects/laboratoire-mpls-vrf/topologie.png",
      "/projects/laboratoire-mpls-vrf/show-ip-vrf.png",
    ],
  },
  {
    slug: "rappel-ia-android",
    title: "Rappel IA : application Android de rappels intelligents",
    category: "development",
    status: "in-progress",
    summary:
      "Application Android de rappels qui comprend des saisies en langage naturel (« rappelle-moi demain 8h ») et organise les rappels par priorité et contexte. En cours de développement.",
    problem:
      "Les rappels classiques exigent de remplir date/heure champ par champ. L'idée : une saisie unique en langage naturel, interprétée localement, qui crée un rappel correctement daté et catégorisé — sans dépendance cloud.",
    objectives: [
      "Saisie en langage naturel → extraction date/heure/action",
      "Rappels planifiés fiables (AlarmManager, survie au redémarrage)",
      "Catégorisation et priorisation automatiques des rappels",
      "Fonctionnement hors ligne, données locales",
    ],
    architecture:
      "Application Android native. L'analyse de la saisie combine règles linguistiques et heuristiques d'extraction de dates. Les rappels sont planifiés avec AlarmManager + BootReceiver pour la persistance, stockés localement (Room/SQLite). Interface simple : liste priorisée, création par une seule ligne de texte.",
    stack: ["Kotlin", "Android", "SQLite", "NLP (règles locales)"],
    challenges: [
      {
        challenge: "Extraction de dates fiable en français (« demain matin », « dans 2 jours », « vendredi »).",
        solution:
          "Parseur à règles progressif avec normalisation des expressions relatives, tests sur corpus de saisies réelles.",
      },
      {
        challenge: "Rappels annulés par le système (doze, redémarrage).",
        solution:
          "AlarmManager exact + ré-armement au boot + vérification à l'ouverture de l'app.",
      },
    ],
    results: [
      "Prototype fonctionnel : création et déclenchement de rappels à partir du texte libre",
      "Persistance des rappels validée après redémarrage",
      "À venir : catégorisation automatique, notifications riches, publication",
    ],
    screenshots: [
      "/projects/rappel-ia-android/ecran-accueil.png",
      "/projects/rappel-ia-android/creation-rappel.png",
    ],
  },
];

export const projectCategories: { id: string; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "networking", label: "Networking" },
  { id: "automation", label: "Automation" },
  { id: "virtualization", label: "Virtualization" },
  { id: "devops", label: "DevOps" },
  { id: "security", label: "Cybersecurity" },
  { id: "monitoring", label: "Monitoring" },
  { id: "development", label: "Development" },
];

export const projectStatusMeta: Record<
  string,
  { label: string; tone: "success" | "warning" | "accent" }
> = {
  published: { label: "Réalisé · lab personnel", tone: "success" },
  "in-progress": { label: "En cours", tone: "warning" },
  experimental: { label: "Expérimental · PoC", tone: "accent" },
};
