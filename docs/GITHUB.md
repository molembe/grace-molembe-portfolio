# Publier le projet sur GitHub

Guide de mise en ligne du dépôt et des options de déploiement.

## 1. Créer le dépôt distant

Sur GitHub : **New repository** → nom `grace-molembe-portfolio` (privé ou
public selon votre choix) → ne pas initialiser avec README (il existe déjà).

## 2. Pousser le code

Le dépôt local contient déjà un historique propre (un commit initial, aucun
secret suivi — `.env*`, `config/`, `.data/`, bases SQLite sont ignorés).

```bash
git remote add origin git@github.com:<votre-compte>/grace-molembe-portfolio.git
git push -u origin main
```

## 3. Secrets — ce qui ne doit JAMAIS être poussé

| Fichier | Contenu | Alternative versionnée |
|---|---|---|
| `.env`, `.env.local` | `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | `docs/ENVIRONMENT.md` (documentation) |
| `config/` | Configuration de secours des aperçus | — |
| `.data/` | Contenu édité via le back-office, photo, messages | volume Docker en production |
| `db/*.db` | Base SQLite locale | — |

En production, définir `ADMIN_PASSWORD` (≥ 8 caractères) et
`ADMIN_SESSION_SECRET` comme **variables d'environnement** du serveur — jamais
dans le code. Voir `docs/ENVIRONMENT.md`.

## 4. Intégration continue

`.github/workflows/ci.yml` exécute sur chaque push / PR :

1. `bun install --frozen-lockfile`
2. `bun run lint` (ESLint)
3. `bunx tsc --noEmit` (vérification des types)
4. `bun run build` (build de production Next.js)

Aucun secret GitHub n'est nécessaire : les valeurs CI sont des placeholders.

## 5. Options de déploiement du site

Le site est une application Next.js **servie par un serveur** (back-office
`/admin`, API contact, upload de photo) — un hébergement statique type
GitHub Pages ne convient pas. Options supportées :

| Option | Référence |
|---|---|
| **VPS Ubuntu + Docker + Nginx TLS + Let's Encrypt** (recommandé, maîtrise complète) | `docs/DEPLOYMENT.md`, `docker-compose.yml`, `Dockerfile` |
| **Vercel** (simple, managé) | importer le dépôt, définir les variables d'environnement, build `bun run build` |
| **Tout hébergeur Node** | `bun run build` puis `bun run start` (serveur Next.js sur le port 3000) |

Sur Vercel : noter que le système de fichiers est éphémère — le contenu édité
via `/admin` (`.data/`) ne persiste pas entre les instances ; privilégier le
VPS Docker pour disposer du back-office complet, ou brancher le repository de
contenu sur une API externe (`src/lib/content.ts` prévoit la bascule Django
REST Framework).

## 6. Après le premier push

- Activer GitHub Actions (aucune configuration nécessaire, le workflow est détecté).
- Protéger la branche `main` (Settings → Branches → Require a pull request avant merge, optionnel).
- Ajouter les topics du dépôt : `portfolio`, `nextjs`, `typescript`, `devsecops`, `networking`.
