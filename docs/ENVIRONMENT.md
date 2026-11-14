# Configuration environnement — variables & canaux

Ce document décrit toutes les variables utilisées par l'application et les deux
canaux de configuration disponibles, selon l'environnement d'exécution.

## Variables

| Variable | Requis | Rôle |
|---|---|---|
| `ADMIN_PASSWORD` | Oui (back-office) | Mot de passe unique de `/admin` — **8 caractères minimum**. Absente ⇒ back-office désactivé (message affiché sur la page de connexion). |
| `ADMIN_SESSION_SECRET` | Recommandé | Clé HMAC-SHA256 de signature des cookies de session (12 h). Absente ⇒ dérivée du mot de passe (rotation du mot de passe invalide alors toutes les sessions, ce qui est acceptable). |
| `NEXT_PUBLIC_SITE_URL` | Build Docker | URL publique du site, passée en `--build-arg` (voir `docs/DEPLOYMENT.md`). |

## Canaux de configuration

### 1. Variables d'environnement — canal canonique (production)

Définir `ADMIN_PASSWORD` et `ADMIN_SESSION_SECRET` dans l'environnement du
processus :

- **Docker Compose** : section `environment:` du service `app` (ou
  `env_file:`) — voir `docs/DEPLOYMENT.md` et `docker-compose.yml`.
- **Développement local** : `.env.local` (non versionné) — exemple :

```bash
# .env.local
ADMIN_PASSWORD=un-mot-de-passe-fort
ADMIN_SESSION_SECRET=chaine-aleatoire-longue
```

Générer un secret aléatoire : `openssl rand -hex 32`.

### 2. `config/admin.env` — fichier de secours persistant (aperçus)

Dans les environnements d'aperçu jetables, `.env` est régénéré au démarrage et
les fichiers ignorés par git (`.env*`, `.data/`) ne survivent pas au recyclage.
L'application lit donc, **en l'absence de la variable d'environnement**, le
fichier `config/admin.env` (puis `.data/admin.env`) :

```bash
# config/admin.env — format KEY=VALUE
ADMIN_PASSWORD=un-mot-de-passe-fort
ADMIN_SESSION_SECRET=chaine-aleatoire-longue
```

- Relu à chaque requête : une modification est prise en compte **sans
  redémarrage** (il suffit de recharger la page).
- Priorité : variable d'environnement > `config/admin.env` > `.data/admin.env`.
- En production, laisser ce fichier absent : la variable d'environnement reste
  la source de vérité.

## Logique d'activation du back-office

Implémentée dans `src/lib/admin-env.ts` (résolution) et
`src/lib/admin-auth.ts` (authentification) :

1. `adminEnv()` résout `password` et `secret` selon la priorité ci-dessus ;
2. le back-office est actif si le mot de passe résolu fait **≥ 8 caractères** ;
3. sinon `/admin` affiche « Back-office désactivé » avec les instructions ;
4. la comparaison du mot de passe et des signatures se fait en temps constant
   (`timingSafeEqual`), les cookies sont `HttpOnly` + `SameSite=Lax`
   (+ `Secure` en production), et les tentatives de connexion sont limitées à
   10 / 15 min / IP.

## bonnes pratiques

- Ne jamais committer un mot de passe de production : utiliser la variable
  d'environnement sur le serveur de production.
- Le mot de passe du fichier de secours est destiné aux environnements de
  prévisualisation ; le changer si l'espace de travail est partagé.
- Après rotation de `ADMIN_PASSWORD` sans `ADMIN_SESSION_SECRET` explicite,
  toutes les sessions existantes sont invalidées (la clé dérivée change) —
  comportement voulu.
