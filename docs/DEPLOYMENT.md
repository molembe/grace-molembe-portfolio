# Documentation de déploiement — Portfolio Engineering

Cible : **Ubuntu Server 24.04 LTS** · Docker Compose · Nginx · HTTPS Let's Encrypt.

## 1. Prérequis serveur

```bash
sudo apt update && sudo apt full-upgrade -y
# Pare-feu : uniquement SSH, HTTP, HTTPS
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw enable
# Docker + plugin compose
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # puis se déconnecter/reconnecter
```

DNS : créer un enregistrement A pointant le domaine vers l'IP du serveur, et
vérifier la propagation (`dig +short VOTRE_DOMAINE`).

## 2. Récupération du code

```bash
git clone <URL_DU_DEPOT> portfolio && cd portfolio
cp .env.example .env
nano .env    # renseigner NEXT_PUBLIC_SITE_URL=https://VOTRE_DOMAINE
```

## 3. Build et démarrage

```bash
docker compose build
docker compose up -d
docker compose ps        # app + nginx + certbot doivent être Up
curl -I http://localhost # 301 vers HTTPS
```

Le site répond alors sur HTTP (redirigé) ; HTTPS nécessite le certificat (étape 4).

## 4. Certificat Let's Encrypt

Éditer `nginx/default.conf` : remplacer `server_name _` par le domaine réel et
les chemins de certificats (`/etc/letsencrypt/live/VOTRE_DOMAINE/...`).

```bash
# Premier certificat (webroot via le volume certbot-www) :
docker compose run --rm certbot certonly --webroot -w /var/www/certbot \
  -d VOTRE_DOMAINE --email VOTRE_EMAIL --agree-tos --no-eff-email
docker compose restart nginx
```

Le service `certbot` renouvelle automatiquement (2 vérifications/jour).
Recharger Nginx après renouvellement : `docker compose exec nginx nginx -s reload`.

> Alternative sans domaine public : générer un certificat autonome et monter
> `./nginx/certs` (le compose référence déjà ce volume).

## 5. Exploitation

| Action | Commande |
|---|---|
| Logs application | `docker compose logs -f app` |
| Logs accès Nginx | `docker compose logs -f nginx` |
| Redéploiement (nouveau code) | `git pull && docker compose build && docker compose up -d` |
| Sauvegarde des messages de contact | `docker run --rm -v portfolio_app-data:/data -v $PWD:/backup alpine tar czf /backup/messages-$(date +%F).tgz -C /data .` |

### Messages du formulaire de contact

Les messages sont validés (zod), anti-spammés (honeypot + rate-limit 5/h/IP) puis
**stockés localement** dans le volume `app-data` (fichier `messages.jsonl`).
Ils sont consultables et supprimables depuis le back-office (`/admin` > Messages).
Branchement SMTP : ajouter les variables au service `app` et activer l'envoi dans
`src/app/api/contact/route.ts` (emplacement indiqué en commentaire).

### Back-office `/admin` — mise à jour du contenu sans redéploiement

Le site dispose d'un back-office privé permettant de modifier le contenu de
l'interface vitrine **sans toucher au code ni redéployer** :

| Section | Contenu modifiable |
|---|---|
| Profil & photo | nom, titres, tagline, intro, disponibilité, e-mail, GitHub, LinkedIn, activation du CV, photo de profil (JPEG/PNG/WebP, 4 Mo max) |
| Parcours | expériences professionnelles et formation (chronologie `/experience` et `/about`) |
| Projets | ajout/modification/suppression des projets publiés (`/projects`) |
| Compétences | technologies, catégories, niveaux 1-5 (`/skills`) |
| Articles | Tech Blog en Markdown (`/blog`) |
| Messages | boîte de réception du formulaire de contact |

Après chaque enregistrement, les pages publiques concernées sont régénérées
immédiatement (`revalidatePath`) — aucun redémarrage nécessaire.

**Activation** : renseigner `ADMIN_PASSWORD` (8 caractères minimum) et idéalement
`ADMIN_SESSION_SECRET` (`openssl rand -hex 32`) dans le `.env` ; le compose les
transmet au conteneur. Sans `ADMIN_PASSWORD`, `/admin` est désactivé (page de
login le signale) et les pages publiques fonctionnent normalement.

**Sécurité** : session cookie HttpOnly signée HMAC-SHA256 (12 h), comparaison du
mot de passe en temps constant, rate-limit 10 essais / 15 min / IP, `noindex`,
robots.txt `Disallow: /admin`, mutations réservées aux sessions valides.

**Persistance** : les modifications vivent dans le volume `app-data`
(`/app/.data/content/*.json`, `/app/.data/uploads/…`) — incluses dans la
sauvegarde décrite au tableau d'exploitation ci-dessus. Le bouton
« Réinitialiser » d'une section supprime l'override correspondant : le site
retombe sur les valeurs du code source.

**Photo de profil** : servie par `/api/media/profile` (versionnée par mtime,
cache navigateur long). En l'absence de photo, le monogramme (initiales) est
affiché dans le hero et sur la page About.

### Branchement futur — Django REST Framework

L'architecture prévoit le remplacement de la couche de données :
`src/lib/content.ts` est l'unique point d'accès au contenu. Pour brancher une API
DRF : implémenter les mêmes fonctions en `fetch` sur l'API (les types de
`src/types/index.ts` servent de contrat côté serializers).

## 6. CI GitHub (recommandé)

Workflow minimal `.github/workflows/ci.yml` : à chaque push → `bun install`,
`bun run lint`, `next build` (type-check). Le déploiement reste manuel ou via
webhook/SSH selon l'infrastructure.

## 7. Sécurité — rappel des mesures actives

- Headers : CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy (middleware Next.js **et** Nginx).
- Formulaire : validation stricte, honeypot, délai minimal, rate-limit, texte brut.
- Image Docker : multi-stage, utilisateur non-root, pas de secrets embarqués.
- Secrets : uniquement dans `.env` (ignoré par Git) ou variables compose.
