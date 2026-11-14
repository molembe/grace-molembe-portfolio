import type { Article } from "@/types";

/**
 * ARTICLES DU TECH BLOG.
 * Corps markdown. Le temps de lecture est CALCULÉ (lib/markdown.ts),
 * jamais déclaré à la main. Les catégories couvrent les 8 axes du site ;
 * seuls les axes documentés ont des articles pour l'instant.
 */

export const articleCategories: { id: string; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "networking", label: "Networking" },
  { id: "linux-systems", label: "Linux & Systems" },
  { id: "automation", label: "Automation" },
  { id: "devops", label: "DevOps" },
  { id: "devsecops", label: "DevSecOps" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "ai", label: "Artificial Intelligence" },
  { id: "cloud", label: "Cloud Computing" },
];

export const articles: Article[] = [
  {
    slug: "segmentation-vrf-mpls-l3vpn",
    title: "Segmenter un réseau avec VRF et MPLS L3VPN : retour de lab",
    category: "networking",
    date: "2026-10-28",
    excerpt:
      "Comment un même cœur réseau transporte les trafics de deux clients strictement isolés : VRF sur les PE, MP-BGP VPNv4, LDP dans le cœur — et surtout, comment on prouve l'isolation.",
    related: ["automatiser-reseau-ansible-playbooks", "pki-interne-ubuntu-server"],
    body: `Quand on découvre MPLS, la promesse paraît abstraite : transporter les trafics de clients différents sur une même infrastructure, sans qu'ils se voient. Ce lab — construit dans GNS3 — vise à rendre ce mécanisme concret, de bout en bout.

## L'idée en une phrase

Chaque client possède sa table de routage virtuelle (**VRF**) sur les routeurs de bord (**PE**), le cœur (**P**) ne fait que commuter des paquets labellisés, et les routes VPN circulent entre PE via **MP-BGP**.

## La topologie du lab

Deux clients (A et B), deux routeurs PE, un routeur P au centre. Le piège pédagogique volontaire : les deux clients utilisent le **même plan d'adressage**. Si l'isolation est réelle, tout fonctionne malgré l'ambiguïté ; si elle est cassée, le lab le révèle immédiatement.

## Étape 1 — le cœur, purement transitif

Sur le routeur P, aucune route client : uniquement MPLS et LDP sur les interfaces cœur.

\`\`\`text
interface GigabitEthernet0/0
 mpls ip
mpls label protocol ldp
\`\`\`

Un routeur P ne doit jamais participer au routage des clients. C'est le principe même du plan de transport.

## Étape 2 — les VRF sur les PE

Chaque interface côté client rejoint un VRF avec un *route distinguisher* (unicité des routes) et des *route-target* (qui importe quoi).

\`\`\`text
ip vrf CLIENT_A
 rd 65000:100
 route-target export 65000:100
 route-target import 65000:100
!
interface GigabitEthernet0/1
 ip vrf forwarding CLIENT_A
 ip address 10.0.0.1 255.255.255.252
\`\`\`

L'erreur classique : appliquer \`ip vrf forwarding\` **après** l'adresse IP — la commande retire l'adresse. On configure le VRF d'abord, l'adresse ensuite.

## Étape 3 — MP-BGP VPNv4 entre les PE

\`\`\`text
router bgp 65000
 neighbor 10.255.0.2 remote-as 65000
 address-family vpnv4
  neighbor 10.255.0.2 activate
\`\`\`

C'est ici que les routes préfixées par le RD voyagent d'un PE à l'autre. Sans cette address-family, chaque PE reste aveugle aux réseaux de l'autre côté du cœur.

## Le débogage qui enseigne le plus

Mon premier essai affichait des routes sur le PE local mais rien chez le pair. Vérifications dans l'ordre, toujours le même :

1. \`show mpls ldp neighbor\` — la session LDP est-elle établie ? Sans labels de transport, les routes VPN existent mais ne passent pas.
2. \`show bgp vpnv4 unicast all\` — les routes sont-elles reçues ? Sinon, vérifier l'activation du neighbor en VPNv4.
3. Route-target import/export — correspondent-ils entre les sites du **même** client ?

La troisième vérification a réglé le problème : un route-target mal copié entre les deux VRF du client A.

## Prouver l'isolation, pas la supposer

Le plan de tests tient en trois lignes :

- \`ping vrf CLIENT_A <même IP>\` chez les deux clients : chacun atteint **son** extrémité ;
- \`show ip route vrf CLIENT_A\` et \`show ip route vrf CLIENT_B\` : tables strictement disjointes ;
- tentatives croisées : échec attendu, échec constaté.

L'isolation est une conclusion de test, jamais une impression.

## Ce que ce lab m'a appris

- La séparabilité des plans (transport / contrôle / accès) est ce qui rend MPLS élégant.
- Les route-target sont le vrai contrat d'isolation : une ligne fausse, une fuite.
- Documenter le débogage vaut autant que la configuration finale — c'est ce qui rend le lab réutilisable.

La topologie GNS3 complète et les vérifications sont décrites dans la fiche Network Lab dédiée.`,
  },
  {
    slug: "pki-interne-ubuntu-server",
    title: "Mettre en place une PKI interne sur Ubuntu Server (OpenSSL)",
    category: "cybersecurity",
    date: "2026-11-04",
    excerpt:
      "Autorité racine hors ligne, intermédiaire active, certificats serveurs avec SAN, déploiement TLS sur Nginx : la chaîne de confiance complète, documentée pas à pas.",
    related: ["segmentation-vrf-mpls-l3vpn", "automatiser-reseau-ansible-playbooks"],
    body: `Les certificats auto-signés « en vrac » réglent le chiffrement mais pas la confiance : chaque client doit accepter chaque certificat, un par un. Une petite PKI interne résout cela proprement — et c'est un excellent exercice d'ingénierie de la confiance.

## L'architecture : racine hors ligne, intermédiaire active

Le principe fondateur : la **racine** signe rarement, la **racine ne vit pas sur le réseau**. Elle génère sa paire de clés sur une machine isolée, signe une unique CA intermédiaire, puis retourne au coffre. L'intermédiaire, elle, émet les certificats du quotidien.

## 1. La racine

\`\`\`bash
# Sur la machine isolée uniquement
openssl genrsa -aes256 -out ca.key 4096
openssl req -x509 -new -key ca.key -sha256 -days 3650 \\
  -out ca.crt -subj "/CN=Lab Root CA"
\`\`\`

La clé est chiffrée (\`-aes256\`) et ne quitte jamais cette machine. Si la racine fuit, toute la chaîne est compromise — d'où le mode hors ligne.

## 2. L'intermédiaire

Sa CSR est signée par la racine avec une extension \`pathlen:0\` : elle ne pourra pas créer de sous-CA à son tour. La chaîne de responsabilité reste courte et contrôlée.

\`\`\`bash
openssl req -new -key int.key -out int.csr -subj "/CN=Lab Int CA"
openssl x509 -req -in int.csr -CA ca.crt -CAkey ca.key \\
  -extfile int.ext -days 1825 -sha256 -out int.crt
\`\`\`

## 3. Un certificat serveur — avec SAN

Depuis des années, le *Common Name* ne suffit plus : sans **SAN** correct, navigateurs et clients refusent le certificat. Le fichier d'extensions est décisif :

\`\`\`text
# server.ext
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = DNS:web.lab.local, IP:10.0.30.10
\`\`\`

\`\`\`bash
openssl x509 -req -in web.csr -CA int.crt -CAkey int.key \\
  -extfile server.ext -days 397 -sha256 -out web.crt
cat web.crt int.crt > web-fullchain.crt
\`\`\`

Le point souvent manqué : distribuer la **chaîne complète** (certificat + intermédiaire), sinon certains clients valident et d'autres non.

## 4. Déploiement sur Nginx

\`\`\`nginx
server {
    listen 443 ssl;
    ssl_certificate     /etc/ssl/lab/web-fullchain.crt;
    ssl_certificate_key /etc/ssl/lab/web.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    add_header Strict-Transport-Security "max-age=63072000" always;
}
\`\`\`

Vérification immédiate depuis un client :

\`\`\`bash
openssl s_client -connect web.lab.local:443 -CAfile ca.crt | head
\`\`\`

Et la validation canonique :

\`\`\`bash
openssl verify -CAfile ca.crt -untrusted int.crt web.crt
# web.crt: OK
\`\`\`

## 5. La révocation — avant d'en avoir besoin

Une PKI sans CRL n'est qu'à moitié PKI. Publier la liste de révocation et la consulter en test fait partie du lab : mieux vaut découvrir une procédure de révocation cassée un jour calme qu'un jour d'incident.

## Les trois pièges rencontrés

1. **SAN oublié** → le navigateur rejette alors que la chaîne est parfaite.
2. **Chaîne incomplète distribuée** → validité dépendante du client.
3. **Racine conservée sur le serveur actif** → le modèle de menace s'effondre.

## Conclusion

Une PKI de lab tient en quelques commandes OpenSSL, mais sa valeur est architecturale : elle force à réfléchir en chaîne de confiance, en cycles de vie et en révocation — exactement les réflexes que réclame la production. La fiche System Lab associée documente la procédure complète et réutilisable.`,
  },
  {
    slug: "automatiser-reseau-ansible-playbooks",
    title: "Automatiser la configuration réseau avec Ansible : les playbooks qui comptent",
    category: "automation",
    date: "2026-11-08",
    excerpt:
      "Inventaire par rôles, playbooks idempotents, dry-run systématique et sauvegarde versionnée : transformer la configuration réseau manuelle en infrastructure as code, sans stress.",
    related: ["segmentation-vrf-mpls-l3vpn", "pki-interne-ubuntu-server"],
    body: `Configurer un réseau équipement par équipement fonctionne… jusqu'à la deuxième fois. Le jour où il faut reproduire, corriger ou auditer, la configuration manuelle devient une dette. Ce lab industrialise la configuration d'un petit parc avec Ansible.

## L'inventaire d'abord, les playbooks ensuite

L'erreur du débutant est de commencer par le YAML. La vraie fondation, c'est l'**inventaire** : des groupes par rôle, des variables partagées, et un hôte déclaré une seule fois.

\`\`\`text
# inventory.ini
[core]
core01 ansible_host=10.0.10.2

[distribution]
dist01 ansible_host=10.0.20.2

[all:vars]
ansible_network_os=ios
ansible_connection=network_cli
ansible_user=ops
\`\`\`

Quand l'inventaire est propre, les playbooks deviennent presque ennuyeux — c'est le but.

## Le playbook VLAN, version idempotente

\`\`\`yaml
- name: Ensure VLANs exist
  hosts: distribution
  gather_facts: false
  tasks:
    - name: Configure VLANs
      ios_vlan:
        vlan_id: "{{ item.id }}"
        name: "{{ item.name }}"
      loop: "{{ vlans }}"
      loop_control:
        label: "{{ item.name }}"
\`\`\`

Exécuté deux fois, il ne produit **aucun changement** la seconde fois : c'est l'idempotence, le critère qui sépare un playbook d'un script.

## Le dry-run est une obligation morale

Aucun changement réseau ne se pousse sans \`--check\` :

\`\`\`bash
ansible-playbook -i inventory.ini playbooks/vlans.yml --check --diff
\`\`\`

Le diff affiché avant application transforme un déploiement nerveux en revue de code. Cette habitude a évité plus d'erreurs que tous les tests de lab réunis.

## La sauvegarde, le playbook le plus rentable

Le plus utile de tous n'écrit rien : il **lit**. Récupérer les running-config horodatées et les committer dans Git crée un historique complet des changements.

\`\`\`yaml
- name: Backup running-config
  ios_config:
    backup: true
    backup_options:
      filename: "{{ inventory_hostname }}-{{ ansible_date_time.date }}.cfg"
      dir_path: "../backups"
\`\`\`

Le jour d'un incident, on compare la config de nuit avec celle d'avant le changement : le diff est le diagnostic.

## Trois règles qui tiennent en production

1. **Un playbook, un but.** VLANs d'un côté, sauvegardes de l'autre : on compose, on ne monolithise pas.
2. **Variables dans l'inventaire, logique dans les rôles.** Le lab devient portable en changeant l'inventaire.
3. **Git est le seul état de vérité.** Si ce n'est pas dans le dépôt, ça n'existe pas.

## Et après ?

La suite logique : tests de conformité (playbook de vérification qui compare l'état réel à l'état attendu) et intégration CI qui exécute le \`--check\` à chaque commit du dépôt de configuration. La fiche Network Lab détaille l'inventaire et les rôles complets du lab.`,
  },
];
