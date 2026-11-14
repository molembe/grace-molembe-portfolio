import type { Lab } from "@/types";

/**
 * LABORATOIRES — fiches techniques documentées.
 * Procédures génériques et reproductibles, exécutées en environnement de lab.
 * Les extraits de configuration sont volontairement génériques (aucune
 * infrastructure interne d'entreprise n'est exposée).
 */

export const labs: Lab[] = [
  /* ===================== NETWORK LAB ===================== */
  {
    slug: "segmentation-vlan",
    kind: "network",
    title: "Segmentation VLAN et routage inter-VLAN",
    summary:
      "Isolation des flux par VLAN (802.1Q), trunk entre commutateurs, routage inter-VLAN sur routeur « router-on-a-stick ».",
    tags: ["VLAN", "802.1Q", "Switching", "Routage"],
    objective:
      "Découper un réseau plat en zones étanches (management, utilisateurs, serveurs, supervision), contrôler les flux inter-zones et poser les bases de toute segmentation ultérieure.",
    environment: ["GNS3", "Commutateurs L2 émulés", "Routeur de distribution", "Postes de test"],
    procedure: [
      {
        title: "Créer les VLANs et affecter les ports",
        body: "Sur chaque commutateur : VLANs numérotés par fonction, ports d'accès affectés, port trunk vers la distribution.",
        code: "vlan 10\n name MANAGEMENT\nvlan 20\n name USERS\nvlan 30\n name SERVERS\ninterface range fa0/1 - 10\n switchport mode access\n switchport access vlan 20\ninterface gi0/0\n switchport mode trunk",
        lang: "text",
      },
      {
        title: "Router entre les VLANs",
        body: "Sous-interfaces 802.1Q sur le routeur, une passerelle par VLAN, avec liste de contrôle d'accès pour restreindre management → utilisateurs.",
        code: "interface gi0/0.10\n encapsulation dot1Q 10\n ip address 10.0.10.1 255.255.255.0\ninterface gi0/0.20\n encapsulation dot1Q 20\n ip address 10.0.20.1 255.255.255.0",
        lang: "text",
      },
      {
        title: "Tester l'isolation",
        body: "Joignabilité intra-VLAN attendue, inter-VLAN contrôlée par ACL. Vérifications : ping croisés, show vlan brief, show interfaces trunk.",
      },
    ],
    verification:
      "show vlan brief conforme aux affectations ; pings intra-VLAN réussis ; flux inter-VLAN uniquement là où l'ACL l'autorise ; trunk actif sur les VLANs attendus.",
    lessons: [
      "Un réseau plat est un risque : la segmentation doit précéder les services.",
      "Nommer les VLANs par fonction (pas par numéro) rend la config lisible.",
      "Toute règle inter-VLAN se documente : qui parle à qui, et pourquoi.",
    ],
    diagram: "vlan-segmentation",
    relatedProject: "automatisation-reseau-ansible",
  },
  {
    slug: "mpls-l3vpn",
    kind: "network",
    title: "MPLS L3VPN — transport multi-clients",
    summary:
      "VRF par client sur les PE, MP-BGP VPNv4 pour l'échange des routes, label switching dans le cœur P.",
    tags: ["MPLS", "VRF", "MP-BGP", "LDP"],
    objective:
      "Démontrer qu'un même cœur MPLS transporte les trafics de deux clients strictement isolés, avec des plans d'adressage identiques chez les clients.",
    environment: ["GNS3", "2 routeurs PE", "1 routeur P", "CE par site client"],
    procedure: [
      {
        title: "Activer MPLS dans le cœur",
        body: "Le cœur (routeur P) transporte des paquets labellisés : activation de MPLS et LDP sur les interfaces cœur.",
        code: "interface gi0/0\n mpls ip\nmpls label protocol ldp",
        lang: "text",
      },
      {
        title: "Créer les VRF clients sur les PE",
        body: "Un VRF par client avec route distinguisher et import/export de route-target cohérents entre sites du même client.",
        code: "ip vrf CLIENT_A\n rd 65000:100\n route-target export 65000:100\n route-target import 65000:100\ninterface gi0/1\n ip vrf forwarding CLIENT_A\n ip address 10.0.0.1 255.255.255.252",
        lang: "text",
      },
      {
        title: "Échanger les routes VPN via MP-BGP",
        body: "Peering BGP interne entre PE avec address-family VPNv4 ; le PE apprend les routes préfixées par RD de son pair.",
        code: "router bgp 65000\n neighbor 10.255.0.2 remote-as 65000\n address-family vpnv4\n  neighbor 10.255.0.2 activate",
        lang: "text",
      },
      {
        title: "Prouver l'isolation",
        body: "Adressage identique chez les deux clients : les joignabilités croisées doivent échouer ; les tables show ip route vrf restent disjointes.",
      },
    ],
    verification:
      "show mpls ldp neighbor établi ; show bgp vpnv4 unicast all présent côté PE ; show ip route vrf CLIENT_A distinct de CLIENT_B ; tests croisés échouent comme attendu.",
    lessons: [
      "Sans LDP actif de bout en bout, les routes VPN s'affichent mais ne transitent pas.",
      "Les route-target sont la clé de l'isolation : une erreur d'import/export = fuite.",
      "L'isolation se prouve par un plan de tests, jamais par une supposition.",
    ],
    diagram: "mpls-l3vpn",
    relatedProject: "laboratoire-mpls-vrf",
  },
  {
    slug: "vpn-ipsec-site-a-site",
    kind: "network",
    title: "VPN IPsec site-à-site",
    summary:
      "Tunnel IPsec entre deux sites avec IKE phase 1/2, trafic chiffré et vérification des associations de sécurité.",
    tags: ["VPN", "IPsec", "IKE", "Chiffrement"],
    objective:
      "Interconnecter deux sites de lab par un tunnel chiffré : négociation IKE, sélecteurs de trafic, et contrôles de confidentialité.",
    environment: ["GNS3", "2 passerelles", "LAN de test par site", "Capture Wireshark"],
    procedure: [
      {
        title: "Configurer la phase 1 (IKE)",
        body: "Proposition ISAKMP : chiffrement, intégrité, groupe DH, durée de vie, clé pré-partagée de lab.",
        code: "crypto isakmp policy 10\n encr aes\n authentication pre-share\n group 14\ncrypto isakmp key CLAB address <PEER>",
        lang: "text",
      },
      {
        title: "Configurer la phase 2 (IPsec)",
        body: "Transform-set, ACL de trafic à chiffrer (sous-réseaux privés des deux sites), crypto map appliquée à l'interface externe.",
        code: "crypto ipsec transform-set TS esp-aes esp-sha-hmac\nip access-list extended VPN-TRAFFIC\n permit ip 10.20.0.0 0.0.255.255 10.30.0.0 0.0.255.255",
        lang: "text",
      },
      {
        title: "Vérifier le chiffrement réel",
        body: "Capture sur le lien externe : les payloads doivent être illisibles (ESP) ; les compteurs encrypt/decrypt progressent avec le trafic.",
      },
    ],
    verification:
      "show crypto isakmp sa (QM_IDLE) ; show crypto ipsec sa avec compteurs croissants ; capture Wireshark sans payload en clair.",
    lessons: [
      "Les sélecteurs de trafic mal appariés sont la première cause de tunnel silencieux.",
      "Une SA établie ne garantit pas le flux : toujours vérifier les compteurs.",
      "Le chiffrement se démontre par capture, pas par joignabilité seule.",
    ],
    diagram: "vpn-ipsec",
  },
  {
    slug: "automatisation-reseau-ansible",
    kind: "network",
    title: "Automatisation réseau avec Ansible",
    summary:
      "Playbooks idempotents pour pousser VLANs, interfaces et sauvegardes sur un parc d'équipements, depuis un dépôt Git.",
    tags: ["Ansible", "IaC", "SSH", "Git"],
    objective:
      "Remplacer la configuration manuelle unitaire par des playbooks versionnés, réutilisables et vérifiables en dry-run.",
    environment: ["Ubuntu Server (nœud de contrôle)", "GNS3", "Dépôt Git", "Inventaire par rôles"],
    procedure: [
      {
        title: "Structurer l'inventaire",
        body: "Groupes par rôle (core, distribution, access) et variables communes ; les hôtes du lab sont déclarés une seule fois.",
        code: "[core]\ncore01 ansible_host=10.0.10.2\n[distribution]\ndist01 ansible_host=10.0.20.2\n[all:vars]\nansible_network_os=ios\nansible_connection=network_cli",
        lang: "text",
      },
      {
        title: "Écrire le playbook VLAN",
        body: "Tâches déclaratives avec vérification avant application ; exécution d'abord en --check puis réelle.",
        code: "- name: Ensure VLANs exist\n  ios_vlan:\n    vlan_id: \"{{ item.id }}\"\n    name: \"{{ item.name }}\"\n  loop: \"{{ vlans }}\"\n  loop_control:\n    label: \"{{ item.name }}\"",
        lang: "yaml",
      },
      {
        title: "Sauvegarder les configurations",
        body: "Rôle de backup : récupération des running-config horodatées, commit dans le dépôt Git.",
      },
    ],
    verification:
      "Playbook --check sans diff sur deuxième exécution (idempotence) ; VLANs présents sur tous les hôtes ciblés ; dépôt Git contenant l'historique des configs.",
    lessons: [
      "Le dry-run systématique évite 90 % des incidents de déploiement.",
      "Un inventaire bien structuré vaut mieux qu'un playbook malin.",
      "La sauvegarde automatisée transforme un incident en restauration.",
    ],
    diagram: "ansible-flow",
    relatedProject: "automatisation-reseau-ansible",
  },

  /* ===================== SYSTEM LAB ===================== */
  {
    slug: "ubuntu-server-baseline",
    kind: "system",
    title: "Ubuntu Server — socle d'administration",
    summary:
      "Préparation d'un serveur Ubuntu propre : réseau netplan, utilisateur administrateur, mises à jour, pare-feu et services essentiels.",
    tags: ["Ubuntu Server", "netplan", "ufw", "systemd"],
    objective:
      "Poser un socle reproductible avant tout service : réseau statique, accès d'administration maîtrisé, système à jour et journal exploitable.",
    environment: ["Ubuntu Server 24.04 (VM Proxmox)", "Accès SSH par clé"],
    procedure: [
      {
        title: "Configurer le réseau en statique",
        body: "netplan avec adresse fixe, passerelle et DNS ; application et vérification immédiates.",
        code: "network:\n  version: 2\n  ethernets:\n    ens18:\n      addresses: [10.0.20.10/24]\n      routes:\n        - to: default\n          via: 10.0.20.1\n      nameservers:\n        addresses: [10.0.10.53]",
        lang: "yaml",
      },
      {
        title: "Sécuriser l'accès et le pare-feu",
        body: "Compte d'administration dédié (pas root), clés SSH, ufw n'autorisant que SSH au départ.",
        code: "adduser ops --gecos \"\"\nusermod -aG sudo ops\nufw allow OpenSSH\nufw enable",
        lang: "bash",
      },
      {
        title: "Mises à jour et journal",
        body: "unattended-upgrades activé, journald persistant pour garder l'historique après redémarrage.",
        code: "apt update && apt full-upgrade\napt install unattended-upgrades\nsed -i 's/#Storage=auto/Storage=persistent/' /etc/systemd/journald.conf",
        lang: "bash",
      },
    ],
    verification:
      "ip addr conforme au netplan ; ufw status actif avec le strict minimum ; journalctl --boot=0 retourne l'historique après un redémarrage de test.",
    lessons: [
      "Un socle propre se documente une fois et se réutilise partout.",
      "Le pare-feu se configure au premier jour, pas après le premier incident.",
      "journald persistant est la première brique d'un diagnostic fiable.",
    ],
    relatedProject: "infrastructure-virtualisation-proxmox",
  },
  {
    slug: "docker-selfhosting",
    kind: "system",
    title: "Docker — conteneuriser ses services",
    summary:
      "Images, volumes, réseaux : conteneurisation de services de lab avec compose et bonnes pratiques de build multi-stage.",
    tags: ["Docker", "Compose", "Volumes", "Réseaux"],
    objective:
      "Isoler les services, rendre leurs déploiements reproductibles et maîtriser la persistance des données.",
    environment: ["Ubuntu Server", "Docker Engine", "Docker Compose"],
    procedure: [
      {
        title: "Dockerfile multi-stage",
        body: "Build dans une image complète, exécution dans une image minimale : surface d'attaque et taille réduites.",
        code: "FROM node:22-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:22-alpine\nWORKDIR /app\nCOPY --from=build /app/node_modules ./\nCOPY --from=build /app/.next ./\nCOPY --from=build /app/public ./\nCOPY --from=build /app/package.json ./\nCMD [\"npx\", \"next\", \"start\"]",
        lang: "dockerfile",
      },
      {
        title: "Stack compose",
        body: "Réseau dédié, volumes nommés pour les données, restart policy, variables d'environnement hors image.",
        code: "services:\n  app:\n    build: .\n    restart: unless-stopped\n    env_file: .env\n  db:\n    image: postgres:16-alpine\n    volumes:\n      - db-data:/var/lib/postgresql/data\nvolumes:\n  db-data:",
        lang: "yaml",
      },
      {
        title: "Exploiter proprement",
        body: "Logs via docker logs/journald, mise à jour par pull + up -d, sauvegarde des volumes nommés.",
      },
    ],
    verification:
      "docker ps sain ; données persistées après down/up ; image finale minimale (taille contrôlée) ; .env jamais commité.",
    lessons: [
      "Le multi-stage n'est pas une option : taille et sécurité s'améliorent d'un coup.",
      "Les volumes nommés sont la seule persistance fiable.",
      "Un compose documenté est un mini-déploiement as code.",
    ],
    relatedProject: "infrastructure-virtualisation-proxmox",
  },
  {
    slug: "proxmox-ve-setup",
    kind: "system",
    title: "Proxmox VE — hyperviseur de lab",
    summary:
      "Installation de Proxmox VE, bridges par VLAN, templates cloud-init et sauvegardes planifiées.",
    tags: ["Proxmox VE", "KVM", "LXC", "cloud-init"],
    objective:
      "Disposer d'une plateforme de virtualisation souple : machines jetables à la demande, réseau segmenté, sauvegardes fiables.",
    environment: ["Hôte Proxmox VE", "Stockage dédié", "Switch de lab (VLANs)"],
    procedure: [
      {
        title: "Bridges mappés sur les VLANs",
        body: "Un bridge par zone (admin, users, serveurs) avec VLAN aware, pour isoler les trafics dès l'hyperviseur.",
        code: "auto vmbr1\niface vmbr1 inet manual\n bridge-ports enp3s0\n bridge-vlan-aware yes\n bridge-vids 10-30",
        lang: "text",
      },
      {
        title: "Template cloud-init",
        body: "VM Ubuntu de base convertie en template : chaque clone reçoit hostname, IP et clé SSH au provisionnement.",
        code: "qm create 9000 --memory 2048 --net0 virtio,bridge=vmbr1\nqm importdisk 9000 ubuntu-noble.qcow2 local-lvm\nqm template 9000\nqm clone 9000 101 --name web01\nqm set 101 --sshkeys ~/.ssh/id_ed25519.pub --ipconfig0 ip=10.0.20.21/24,gw=10.0.20.1",
        lang: "bash",
      },
      {
        title: "Sauvegardes planifiées",
        body: "Job vzdump nocturne vers un stockage séparé, rétention définie, restauration testée sur une VM jetable.",
      },
    ],
    verification:
      "Clone de template opérationnel en < 2 minutes avec la bonne IP ; restauration d'une sauvegarde testée ; VLANs visibles côté VM (tcpdump/tags).",
    lessons: [
      "Le template cloud-init supprime 90 % de la corvée d'installation.",
      "Séparer stockage VM et stockage de sauvegarde n'est pas du luxe.",
      "Une restauration jamais testée est une sauvegarde fictive.",
    ],
    diagram: "proxmox-cluster",
    relatedProject: "infrastructure-virtualisation-proxmox",
  },
  {
    slug: "nginx-reverse-proxy-tls",
    kind: "system",
    title: "Nginx — reverse proxy et TLS",
    summary:
      "Frontal unique pour les services de lab : TLS terminé, en-têtes de sécurité, gzip et cache statique.",
    tags: ["Nginx", "TLS", "Reverse proxy", "Headers"],
    objective:
      "Exposer les services derrière un point d'entrée unique et sécurisé : certificats PKI interne, redirection HTTPS, durcissement des en-têtes.",
    environment: ["Ubuntu Server", "Nginx", "Certificats de la PKI de lab"],
    procedure: [
      {
        title: "Server block HTTPS durci",
        body: "TLS 1.2/1.3 uniquement, suites modernes, redirection permanente du port 80.",
        code: "server {\n  listen 443 ssl;\n  ssl_certificate     /etc/ssl/lab/app.crt;\n  ssl_certificate_key /etc/ssl/lab/app.key;\n  ssl_protocols TLSv1.2 TLSv1.3;\n  add_header Strict-Transport-Security \"max-age=63072000\" always;\n  add_header X-Frame-Options DENY always;\n  location / { proxy_pass http://127.0.0.1:3000; }\n}",
        lang: "nginx",
      },
      {
        title: "Cache statique et gzip",
        body: "Assets versionnés en cache long, compression texte activée.",
        code: "gzip on;\ngzip_types text/css application/javascript application/json image/svg+xml;\nlocation /_next/static/ {\n  expires 30d;\n  add_header Cache-Control \"public, immutable\";\n}",
        lang: "nginx",
      },
      {
        title: "Vérifier avec un client externe",
        body: "curl -I pour les en-têtes, test HTTP→HTTPS, contrôle du certificat présenté (chaîne complète).",
      },
    ],
    verification:
      "curl -I affiche HSTS et X-Frame-Options ; HTTP redirige en 301 vers HTTPS ; openssl s_client confirme la chaîne ; assets servis en cache.",
    lessons: [
      "Les en-têtes de sécurité se posent au frontal, une fois pour tous les services.",
      "Une chaîne de certificats incomplète casse des clients pourtant valides.",
      "Le cache statique est l'optimisation au meilleur rapport effort/gain.",
    ],
    relatedProject: "infrastructure-pki-certificats",
  },
  {
    slug: "postgresql-install-hardening",
    kind: "system",
    title: "PostgreSQL — installation et durcissement",
    summary:
      "Base de données de lab installée proprement : authentification locale maîtrisée, accès réseau restreint, sauvegardes pg_dump.",
    tags: ["PostgreSQL", "pg_hba", "Sauvegarde", "Durcissement"],
    objective:
      "Fournir aux applications (Django, Odoo) une base fiable, sauvegardée, et inaccessible au-delà du strict nécessaire.",
    environment: ["Ubuntu Server", "PostgreSQL 16", "ufw"],
    procedure: [
      {
        title: "Installation et rôle applicatif",
        body: "Paquet officiel, rôle et base dédiés par application, mot de passe généré hors dépôt.",
        code: "apt install postgresql\nsudo -u postgres psql\nCREATE ROLE app_rh LOGIN PASSWORD '<secret>';\nCREATE DATABASE rh OWNER app_rh;",
        lang: "sql",
      },
      {
        title: "Restreindre l'accès",
        body: "listen_addresses limité à localhost ou au réseau applicatif ; pg_hba en md5/scram depuis les seules IP utiles.",
        code: "# postgresql.conf\nlisten_addresses = 'localhost'\n\n# pg_hba.conf\nhost  rh  app_rh  127.0.0.1/32  scram-sha-256",
        lang: "text",
      },
      {
        title: "Sauvegardes planifiées",
        body: "pg_dump quotidien compressé, rétention courte, test de restauration sur une base jetable.",
        code: "0 2 * * * pg_dump -U app_rh rh | gzip > /var/backups/rh-$(date +\\%F).sql.gz",
        lang: "bash",
      },
    ],
    verification:
      "Connexion refusée depuis une IP non listée ; restauration du dump testée ; wal/logs dans un volume persistant.",
    lessons: [
      "Une base exposée au réseau « au cas où » est une dette de sécurité.",
      "Le pg_hba est le vrai pare-feu applicatif de PostgreSQL.",
      "Un dump jamais restauré n'est pas une sauvegarde.",
    ],
  },
  {
    slug: "pki-interne-lab",
    kind: "system",
    title: "PKI interne — CA racine et intermédiaire",
    summary:
      "Chaîne de confiance de lab : racine hors ligne, intermédiaire opérationnelle, émission et déploiement de certificats serveurs.",
    tags: ["PKI", "OpenSSL", "CA", "Certificats"],
    objective:
      "Établir une autorité de certification interne crédible : racine protégée, intermédiaire active, procédure d'émission répétable.",
    environment: ["Machine isolée (racine)", "VM intermédiaire", "OpenSSL"],
    procedure: [
      {
        title: "Racine hors ligne",
        body: "Génération sur machine isolée, clé chiffrée, jamais copiée sur le réseau.",
        code: "openssl genrsa -aes256 -out ca.key 4096\nopenssl req -x509 -new -key ca.key -sha256 -days 3650 \\\n  -out ca.crt -subj \"/CN=Lab Root CA\"",
        lang: "bash",
      },
      {
        title: "Intermédiaire signée par la racine",
        body: "CSR de l'intermédiaire, extension pathlen:0, signature par la racine, chaîne complète distribuée.",
        code: "openssl req -new -key int.key -out int.csr -subj \"/CN=Lab Int CA\"\nopenssl x509 -req -in int.csr -CA ca.crt -CAkey ca.key \\\n  -extfile int.ext -days 1825 -sha256 -out int.crt",
        lang: "bash",
      },
      {
        title: "Émettre un certificat serveur",
        body: "CSR + extensions SAN obligatoires, signature par l'intermédiaire, déploiement chaîne complète sur Nginx.",
        code: "openssl x509 -req -in web.csr -CA int.crt -CAkey int.key \\\n  -extfile server.ext -days 397 -sha256 -out web.crt\ncat web.crt int.crt > web-fullchain.crt",
        lang: "bash",
      },
    ],
    verification:
      "openssl verify -CAfile ca.crt -untrusted int.crt web.crt → OK ; navigateur de test sans alerte (racine importée) ; CRL publiée et consultée.",
    lessons: [
      "La racine n'a pas besoin d'être en ligne — c'est même l'inverse.",
      "Sans SAN correct, le certificat est inutilisable malgré une chaîne parfaite.",
      "La CRL/revocation se teste AVANT d'en avoir besoin.",
    ],
    diagram: "pki-hierarchy",
    relatedProject: "infrastructure-pki-certificats",
  },
  {
    slug: "server-hardening-ssh",
    kind: "system",
    title: "Durcissement serveur — SSH et socle sécurité",
    summary:
      "Réduction de la surface d'attaque : SSH par clé uniquement, pare-feu strict, mises à jour automatiques et vérifications périodiques.",
    tags: ["SSH", "ufw", "Hardening", "Audit"],
    objective:
      "Appliquer une baseline de sécurité reproductible à chaque serveur du lab, avant tout service exposé.",
    environment: ["Ubuntu Server", "OpenSSH", "ufw"],
    procedure: [
      {
        title: "SSH durci",
        body: "Authentification par clé exclusivement, root interdit, éventuellement port dédié.",
        code: "PasswordAuthentication no\nPermitRootLogin no\nPubkeyAuthentication yes\nKbdInteractiveAuthentication no\nMaxAuthTries 3",
        lang: "text",
      },
      {
        title: "Pare-feu minimal",
        body: "ufw deny par défaut, autorisations explicites service par service.",
        code: "ufw default deny incoming\nufw allow OpenSSH\nufw limit OpenSSH\nufw enable",
        lang: "bash",
      },
      {
        title: "Vérifications périodiques",
        body: "Contrôle des connexions (journal), des paquets installés et des écoutes réseau inattendues.",
        code: "ss -tulpn\nsudo lastb | head\napt list --upgradable",
        lang: "bash",
      },
    ],
    verification:
      "Tentative de login par mot de passe refusée ; seules les écoutes attendues dans ss -tulpn ; ufw status cohérent avec la politique.",
    lessons: [
      "Le durcissement se scripte (Ansible) : identique partout, vérifiable.",
      "Chaque port ouvert doit avoir un propriétaire documenté.",
      "Les logs d'échec d'authentification sont une mine d'information.",
    ],
    relatedProject: "infrastructure-pki-certificats",
  },
];

export const labKindMeta: Record<string, { label: string; href: string }> = {
  network: { label: "Network Lab", href: "/network-lab" },
  system: { label: "System Lab", href: "/system-lab" },
};
