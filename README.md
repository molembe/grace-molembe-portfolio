# Portfolio Engineering — Grace à Dieu MOLEMBE

Plateforme personnelle d'ingénierie informatique : Network & Systems Engineer |
Infrastructure Automation | Linux | DevSecOps | Cybersecurity.

Conçue comme une **console NOC** : terminal interactif simulé, dashboard de
compétences à niveaux honnêtes, réalisations à statuts explicites, laboratoires
réseau et système documentés, tech blog et formulaire de contact sécurisé.

[![CI](https://github.com/molembe/grace-molembe-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/molembe/grace-molembe-portfolio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Stack

- **Next.js 16** (App Router, Server Components, SSG) · **TypeScript strict**
- **Tailwind CSS 4** + design tokens « NOC Console » (dark par défaut, light « Blueprint »)
- **framer-motion** (animations sobres, `prefers-reduced-motion` respecté)
- **shadcn/ui** (fondation accessible) re-skinée · **lucide-react** (+ logos marques via react-icons)
- **react-hook-form + zod** (contact) · **sonner** · **cmdk** (palette `Ctrl+K`)
- **react-markdown + react-syntax-highlighter** (blog et fiches lab)
- Contenu par défaut versionné dans `src/data` + `src/content`, **éditable sans
  code via le back-office `/admin`** (overrides JSON dans `.data/`), et branchable
  sur **Django REST Framework** via `src/lib/content.ts`.

## Démarrage

```bash
bun install
bun run dev    # http://localhost:3000
bun run lint   # ESLint
```

## Back-office `/admin` — mettre à jour le site sans coder

Le contenu de l'interface vitrine se modifie depuis un espace privé protégé par
mot de passe : **`/admin`** (actif si `ADMIN_PASSWORD` est défini — voir
`docs/ENVIRONMENT.md`). Sections : **Profil & photo** (identité, coordonnées, CV, photo
de profil), **Parcours**, **Projets**, **Compétences**, **Articles** (Markdown) et
**Messages** reçus via le formulaire de contact. Chaque enregistrement régénère
immédiatement les pages publiques ; « Réinitialiser » restaure les valeurs du
code. Les overrides et la photo sont stockés localement dans `.data/`
(volume Docker `app-data` en production — détails dans `docs/DEPLOYMENT.md`).

## Structure

```
src/
  app/            # 9 pages + admin (back-office protégé) + 404 + api/contact,
                  # api/media/profile + sitemap/robots/manifest
  components/     # layout, navigation, terminal, dashboard, projects, skills,
                  # diagrams (topologies SVG déclaratives), blog, labs, admin,
                  # profile (avatar), ui
  data/           # site-config.ts (identité/coordonnées), projects, skills,
                  # experience, labs — valeurs par défaut du contenu
  content/        # articles du blog par défaut (markdown dans modules typés)
  lib/            # content.ts (repository + fusion des overrides), store.ts
                  # (persistance .data/), admin-auth.ts, admin-env.ts (config
                  # back-office), seo, markdown, validation, rate-limit
  hooks/ types/   # hooks clients, contrat de données (miroir DRF)
```

## Contenu — règles d'édition

Deux canaux complémentaires : le **back-office `/admin`** (recommandé, ci-dessus)
ou l'édition directe des fichiers par défaut :

| Fichier | Ce qu'il faut compléter |
|---|---|
| `src/data/site-config.ts` | e-mail, GitHub, LinkedIn (remplacer `TBD`), CV (`available: true` après dépôt de `public/documents/cv.pdf`) |
| `src/data/skills.ts` | niveaux réels par technologie (échelle 1-5 documentée) |
| `src/data/projects.ts` | périodes, challenges/résultats réels, URLs GitHub, captures dans `public/projects/<slug>/` |
| `src/data/experience.ts` | périodes et organismes exacts (ARCEP, formation) |
| `src/content/blog.ts` | nouveaux articles (temps de lecture calculé automatiquement) |

**Principe d'honnêteté** : tout ce qui n'est pas fourni est masqué côté UI
(`TBD`), jamais inventé. Les statuts de projets (`published`, `in-progress`,
`experimental`) sont affichés tels quels.

## Sécurité

- Headers (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) via `src/middleware.ts` et Nginx.
- `/api/contact` : same-origin, rate-limit 5/h/IP, honeypot, délai minimal, validation zod, neutralisation des caractères de contrôle, stockage local JSONL (`.data/`).
- `/admin` : mot de passe serveur (`ADMIN_PASSWORD`), session cookie HttpOnly signée HMAC-SHA256 (12 h), comparaison en temps constant, rate-limit 10 essais/15 min/IP, `noindex` + `Disallow` robots, mutations derrière session valide.
- Aucune clé API côté client ; secrets uniquement serveur (`docs/ENVIRONMENT.md`).

## Déploiement

Docker multi-stage + docker-compose (app + nginx TLS + certbot) — voir
**`docs/DEPLOYMENT.md`** (Ubuntu Server, Let's Encrypt, exploitation, CI).

## Publier sur GitHub

Le dépôt est prêt : historique propre, aucun secret suivi, CI configurée
(`.github/workflows/ci.yml` : lint + types + build), licence MIT. Procédure
depuis `git remote add origin …` jusqu'aux options d'hébergement (VPS Docker
ou Vercel) : voir **`docs/GITHUB.md`**.

## Fonctionnalités clés

Terminal simulé (`help`, `about`, `skills`, `projects`, `experience`, `contact`,
`clear`, bonus) — palette `Ctrl+K` — thème clair/sombre sans flash — recherche et
filtres (projets, compétences, articles) — diagrammes SVG interactifs (zoom/pan) —
TOC + barre de progression des articles — 404 console — sitemap/robots/manifest —
JSON-LD Person — navigation clavier et skip-link — **back-office `/admin`** avec
upload de photo de profil et mise à jour du contenu en direct.
