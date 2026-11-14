import type { DiagramSpec } from "@/types";

/**
 * TOPOLOGIES DÉCLARATIVES — données pures rendues par DiagramRenderer.
 * Coordonnées pensées sur une grille ; le rendu est identique en clair/sombre.
 */

export const topologies: Record<string, DiagramSpec> = {
  "vlan-segmentation": {
    id: "vlan-segmentation",
    title: "Segmentation VLAN et routage inter-VLAN",
    description: "Router-on-a-stick : sous-interfaces 802.1Q par zone, trunk vers la distribution.",
    width: 760,
    height: 400,
    nodes: [
      { id: "rt", x: 60, y: 160, label: "Routeur distribution", sub: "gi0/0.10 .20 .30", kind: "router", w: 190 },
      { id: "sw", x: 330, y: 160, label: "Switch distribution", sub: "trunk 802.1Q", kind: "switch", w: 180 },
      { id: "sw10", x: 580, y: 60, label: "Accès VLAN 10", sub: "management", kind: "switch", w: 160 },
      { id: "sw20", x: 580, y: 168, label: "Accès VLAN 20", sub: "utilisateurs", kind: "switch", w: 160 },
      { id: "sw30", x: 580, y: 276, label: "Accès VLAN 30", sub: "serveurs", kind: "switch", w: 160 },
    ],
    edges: [
      { from: "rt", to: "sw", label: "trunk", tone: "primary" },
      { from: "sw", to: "sw10", label: "VLAN 10", tone: "accent" },
      { from: "sw", to: "sw20", label: "VLAN 20", tone: "accent" },
      { from: "sw", to: "sw30", label: "VLAN 30", tone: "accent" },
    ],
  },

  "mpls-l3vpn": {
    id: "mpls-l3vpn",
    title: "MPLS L3VPN — deux clients isolés sur un cœur commun",
    description: "VRF par client sur les PE, MP-BGP VPNv4 entre PE, LDP dans le cœur P.",
    width: 760,
    height: 420,
    groups: [
      { id: "gA", x: 20, y: 40, w: 150, h: 330, label: "Client A" },
      { id: "gB", x: 590, y: 40, w: 150, h: 330, label: "Client B" },
    ],
    nodes: [
      { id: "ceA1", x: 35, y: 90, label: "CE-A1", sub: "10.0.1.0/24", kind: "host", w: 120 },
      { id: "ceA2", x: 35, y: 300, label: "CE-A2", sub: "10.0.1.0/24", kind: "host", w: 120 },
      { id: "pe1", x: 250, y: 120, label: "PE1", sub: "VRF A + B", kind: "router", w: 120 },
      { id: "p", x: 350, y: 190, label: "P", sub: "MPLS / LDP", kind: "router", w: 110 },
      { id: "pe2", x: 450, y: 120, label: "PE2", sub: "VRF A + B", kind: "router", w: 120 },
      { id: "ceB1", x: 610, y: 90, label: "CE-B1", sub: "10.0.1.0/24", kind: "host", w: 120 },
      { id: "ceB2", x: 610, y: 300, label: "CE-B2", sub: "10.0.1.0/24", kind: "host", w: 120 },
    ],
    edges: [
      { from: "ceA1", to: "pe1", label: "VRF A", tone: "accent" },
      { from: "ceA2", to: "pe1", label: "VRF B", tone: "accent" },
      { from: "pe1", to: "p", label: "MPLS", tone: "primary" },
      { from: "p", to: "pe2", label: "MPLS", tone: "primary" },
      { from: "pe2", to: "ceB1", label: "VRF A", tone: "accent" },
      { from: "pe2", to: "ceB2", label: "VRF B", tone: "accent" },
      { from: "pe1", to: "pe2", label: "MP-BGP VPNv4", tone: "muted", dashed: true },
    ],
  },

  "vpn-ipsec": {
    id: "vpn-ipsec",
    title: "VPN IPsec site-à-site",
    description: "Deux LAN privés reliés par un tunnel ESP chiffré via Internet.",
    width: 760,
    height: 380,
    nodes: [
      { id: "lanA", x: 40, y: 150, label: "LAN A", sub: "10.20.0.0/16", kind: "host", w: 130 },
      { id: "gwA", x: 230, y: 150, label: "Passerelle A", sub: "crypto map", kind: "firewall", w: 150 },
      { id: "inet", x: 330, y: 40, label: "Internet", kind: "cloud", w: 150, h: 70 },
      { id: "gwB", x: 490, y: 150, label: "Passerelle B", sub: "crypto map", kind: "firewall", w: 150 },
      { id: "lanB", x: 620, y: 150, label: "LAN B", sub: "10.30.0.0/16", kind: "host", w: 120 },
    ],
    edges: [
      { from: "lanA", to: "gwA", tone: "muted" },
      { from: "gwA", to: "inet", tone: "muted" },
      { from: "inet", to: "gwB", tone: "muted" },
      { from: "gwB", to: "lanB", tone: "muted" },
      { from: "gwA", to: "gwB", label: "Tunnel ESP (chiffré)", tone: "accent", dashed: true },
    ],
  },

  "ansible-flow": {
    id: "ansible-flow",
    title: "Flux d'automatisation Ansible",
    description: "Dépôt Git → nœud de contrôle → SSH → équipements, sauvegardes récupérées.",
    width: 760,
    height: 400,
    groups: [{ id: "gNet", x: 470, y: 30, w: 260, h: 340, label: "Équipements réseau" }],
    nodes: [
      { id: "git", x: 40, y: 60, label: "Git", sub: "playbooks + rôles", kind: "server", w: 160 },
      { id: "ctrl", x: 240, y: 160, label: "Contrôle Ansible", sub: "Ubuntu Server", kind: "server", w: 180 },
      { id: "core", x: 500, y: 70, label: "core01", kind: "router", w: 150 },
      { id: "dist", x: 500, y: 180, label: "dist01", kind: "switch", w: 150 },
      { id: "acc", x: 500, y: 290, label: "access01", kind: "switch", w: 150 },
      { id: "bkp", x: 240, y: 300, label: "Sauvegardes", sub: "configs horodatées", kind: "server", w: 180 },
    ],
    edges: [
      { from: "git", to: "ctrl", label: "git pull", tone: "muted" },
      { from: "ctrl", to: "core", label: "SSH", tone: "accent", dashed: true },
      { from: "ctrl", to: "dist", label: "SSH", tone: "accent", dashed: true },
      { from: "ctrl", to: "acc", label: "SSH", tone: "accent", dashed: true },
      { from: "dist", to: "bkp", label: "running-config", tone: "primary" },
    ],
  },

  "proxmox-cluster": {
    id: "proxmox-cluster",
    title: "Infrastructure Proxmox VE du lab",
    description: "Hôte unique, bridges par VLAN, VMs et conteneurs LXC, stockage de sauvegarde.",
    width: 760,
    height: 420,
    groups: [
      { id: "gVm", x: 250, y: 30, w: 240, h: 190, label: "VMs (KVM)" },
      { id: "gLxc", x: 250, y: 240, w: 240, h: 150, label: "Conteneurs LXC" },
    ],
    nodes: [
      { id: "pve", x: 40, y: 170, label: "pve01", sub: "Proxmox VE", kind: "server", w: 160 },
      { id: "vmU", x: 280, y: 70, label: "ubuntu-web", sub: "cloud-init", kind: "host", w: 180 },
      { id: "vmD", x: 280, y: 150, label: "ubuntu-db", sub: "PostgreSQL", kind: "host", w: 180 },
      { id: "vmW", x: 280, y: 230, label: "win-srv", sub: "AD de lab", kind: "host", w: 180 },
      { id: "lx1", x: 280, y: 300, label: "lxc-nginx", kind: "host", w: 180 },
      { id: "lx2", x: 280, y: 360, label: "lxc-supervision", kind: "host", w: 180 },
      { id: "sto", x: 590, y: 180, label: "Stockage backup", sub: "vzdump nocturne", kind: "server", w: 160 },
    ],
    edges: [
      { from: "pve", to: "vmU", tone: "primary" },
      { from: "pve", to: "vmD", tone: "primary" },
      { from: "pve", to: "vmW", tone: "primary" },
      { from: "pve", to: "lx1", tone: "accent" },
      { from: "pve", to: "lx2", tone: "accent" },
      { from: "pve", to: "sto", label: "sauvegarde", tone: "muted", dashed: true },
    ],
  },

  "pki-hierarchy": {
    id: "pki-hierarchy",
    title: "Hiérarchie PKI du lab",
    description: "Racine hors ligne → intermédiaire → certificats serveurs, CRL publiée.",
    width: 760,
    height: 400,
    nodes: [
      { id: "root", x: 300, y: 30, label: "Root CA", sub: "hors ligne · clé chiffrée", kind: "firewall", w: 200 },
      { id: "int", x: 300, y: 150, label: "Intermediate CA", sub: "signe les certificats", kind: "server", w: 200 },
      { id: "web", x: 100, y: 290, label: "web.lab.local", sub: "TLS serveur", kind: "host", w: 170 },
      { id: "vpn", x: 320, y: 290, label: "vpn.lab.local", sub: "TLS + IPsec", kind: "host", w: 170 },
      { id: "srv", x: 540, y: 290, label: "srv.lab.local", sub: "HTTPS interne", kind: "host", w: 170 },
    ],
    edges: [
      { from: "root", to: "int", label: "signe (1 fois)", tone: "muted" },
      { from: "int", to: "web", label: "émission", tone: "accent" },
      { from: "int", to: "vpn", label: "émission", tone: "accent" },
      { from: "int", to: "srv", label: "émission", tone: "accent" },
    ],
  },

  "monitoring-stack": {
    id: "monitoring-stack",
    title: "Chaîne de supervision du lab",
    description: "Nagios (checks) + Glances (métriques) + GoAccess (logs web).",
    width: 760,
    height: 400,
    nodes: [
      { id: "nagios", x: 60, y: 160, label: "Nagios Core", sub: "checks actifs", kind: "server", w: 170 },
      { id: "web", x: 360, y: 50, label: "web01", sub: "HTTP · SSH", kind: "host", w: 160 },
      { id: "db", x: 360, y: 160, label: "db01", sub: "PostgreSQL", kind: "host", w: 160 },
      { id: "gw", x: 360, y: 270, label: "gw01", sub: "ping · SSH", kind: "router", w: 160 },
      { id: "glances", x: 600, y: 100, label: "Glances", sub: "mode web", kind: "host", w: 140 },
      { id: "goaccess", x: 600, y: 240, label: "GoAccess", sub: "logs Nginx", kind: "host", w: 140 },
    ],
    edges: [
      { from: "nagios", to: "web", label: "check_http/ssh", tone: "accent" },
      { from: "nagios", to: "db", label: "NRPE", tone: "accent" },
      { from: "nagios", to: "gw", label: "check_ping", tone: "accent" },
      { from: "web", to: "glances", label: "métriques", tone: "muted", dashed: true },
      { from: "web", to: "goaccess", label: "access.log", tone: "muted", dashed: true },
    ],
  },

  "docker-stack": {
    id: "docker-stack",
    title: "Stack Docker Compose",
    description: "Réseau dédié, volumes nommés, build multi-stage.",
    width: 760,
    height: 380,
    groups: [{ id: "gHost", x: 150, y: 60, w: 460, h: 260, label: "Hôte Docker (Ubuntu Server)" }],
    nodes: [
      { id: "nginx", x: 190, y: 110, label: "nginx", sub: "TLS · reverse proxy", kind: "server", w: 160 },
      { id: "app", x: 400, y: 110, label: "app", sub: "Next.js · serveur Node", kind: "server", w: 170 },
      { id: "vol", x: 190, y: 240, label: "Volume nommé", sub: "données persistantes", kind: "host", w: 160 },
      { id: "env", x: 400, y: 240, label: ".env", sub: "secrets hors image", kind: "host", w: 170 },
    ],
    edges: [
      { from: "nginx", to: "app", label: "proxy_pass", tone: "primary" },
      { from: "app", to: "vol", label: "montage", tone: "accent", dashed: true },
      { from: "app", to: "env", label: "env_file", tone: "muted", dashed: true },
    ],
  },
};

export function getTopology(id: string | undefined): DiagramSpec | undefined {
  return id ? topologies[id] : undefined;
}
