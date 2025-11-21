# 🚀 Guide de déploiement MIRA MATCH Backend

Ce guide explique comment configurer le déploiement automatique du backend sur le serveur SSH.

## 📋 Prérequis

Sur le serveur `thiolkia@159.69.221.252` :
- Node.js 18+ installé
- PM2 installé globalement (`npm install -g pm2`)
- Git configuré
- Accès SSH

## 🛠️ Option 1 : Déploiement manuel

### Première installation

```bash
# Se connecter au serveur
ssh thiolkia@159.69.221.252

# Cloner le repo si ce n'est pas déjà fait
cd ~
git clone https://github.com/Khadimou/miramatch.git MIRA_MATCH
cd MIRA_MATCH

# Rendre le script exécutable
chmod +x backend/deploy.sh

# Lancer le déploiement
cd backend
./deploy.sh
```

### Déploiements suivants

```bash
# Se connecter au serveur
ssh thiolkia@159.69.221.252

# Lancer le script de déploiement
cd ~/MIRA_MATCH/backend
./deploy.sh
```

Le script effectue automatiquement :
- ✅ Pull des dernières modifications
- ✅ Installation des dépendances
- ✅ Génération du client Prisma
- ✅ Push du schéma Prisma vers la DB
- ✅ Build du TypeScript
- ✅ Redémarrage du backend avec PM2

## 🤖 Option 2 : Déploiement automatique avec Webhook

### 1. Installer le serveur de webhook

```bash
# Sur le serveur
ssh thiolkia@159.69.221.252
cd ~/MIRA_MATCH/backend

# Copier les fichiers de webhook
# Les fichiers webhook-deploy.sh et setup-webhook-server.js doivent être présents

# Rendre les scripts exécutables
chmod +x deploy.sh
chmod +x webhook-deploy.sh

# Installer PM2 si nécessaire
npm install -g pm2

# Définir le secret du webhook (à garder confidentiel)
export WEBHOOK_SECRET="votre-secret-super-securise"

# Démarrer le serveur de webhook avec PM2
pm2 start setup-webhook-server.js --name "mira-webhook" -- --port 9000
pm2 save
pm2 startup  # Pour démarrer automatiquement au boot
```

### 2. Ouvrir le port 9000 dans le firewall

```bash
# Sur le serveur (avec sudo si nécessaire)
sudo ufw allow 9000/tcp
sudo ufw reload
```

### 3. Configurer le webhook sur GitHub

1. Aller sur https://github.com/Khadimou/miramatch/settings/hooks
2. Cliquer sur "Add webhook"
3. Configurer :
   - **Payload URL**: `http://159.69.221.252:9000/webhook`
   - **Content type**: `application/json`
   - **Secret**: Le même que `WEBHOOK_SECRET` (défini précédemment)
   - **Events**: Sélectionner "Just the push event"
   - **Active**: Cocher
4. Cliquer sur "Add webhook"

### 4. Tester le webhook

```bash
# Faire un push sur main depuis votre machine locale
git push origin main

# Vérifier les logs sur le serveur
ssh thiolkia@159.69.221.252
pm2 logs mira-webhook
pm2 logs mira-match-backend

# Vérifier que le déploiement s'est bien passé
cat ~/deploy.log
cat ~/webhook-deploy.log
```

## 📊 Commandes PM2 utiles

```bash
# Voir le statut des apps
pm2 status

# Voir les logs
pm2 logs mira-match-backend
pm2 logs mira-webhook

# Redémarrer manuellement
pm2 restart mira-match-backend

# Arrêter
pm2 stop mira-match-backend

# Supprimer de PM2
pm2 delete mira-match-backend

# Sauvegarder la configuration PM2
pm2 save

# Configuration pour démarrer au boot
pm2 startup
```

## 🔍 Vérification après déploiement

```bash
# Vérifier que le backend répond
curl http://159.69.221.252:3000/api/health

# Vérifier les logs
pm2 logs mira-match-backend --lines 50

# Vérifier que le webhook fonctionne
curl http://159.69.221.252:9000/health
```

## 🐛 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs d'erreur
pm2 logs mira-match-backend --err --lines 100

# Vérifier le fichier .env
cat ~/MIRA_MATCH/backend/.env

# Vérifier que Prisma est bien configuré
cd ~/MIRA_MATCH/backend
npx prisma generate
npx prisma db push

# Redémarrer manuellement
npm run build
pm2 restart mira-match-backend
```

### Le webhook ne se déclenche pas

```bash
# Vérifier que le serveur webhook tourne
pm2 status mira-webhook

# Vérifier les logs du webhook
pm2 logs mira-webhook

# Vérifier que le port est ouvert
sudo ufw status | grep 9000

# Tester manuellement le webhook
curl -X POST http://159.69.221.252:9000/webhook \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'
```

### Le script de déploiement échoue

```bash
# Vérifier les logs de déploiement
cat ~/deploy.log

# Vérifier les permissions
ls -la ~/MIRA_MATCH/backend/deploy.sh

# Rendre le script exécutable si nécessaire
chmod +x ~/MIRA_MATCH/backend/deploy.sh

# Lancer manuellement en mode verbose
bash -x ~/MIRA_MATCH/backend/deploy.sh
```

## 🔐 Sécurité

- **Ne jamais** commit le fichier `.env` avec les secrets
- **Toujours** utiliser un secret fort pour le webhook
- **Limiter** l'accès au port 9000 à GitHub uniquement (optionnel mais recommandé)
- **Sauvegarder** régulièrement la base de données

## 📝 Variables d'environnement

Créer un fichier `.env` sur le serveur :

```bash
# Sur le serveur
nano ~/MIRA_MATCH/backend/.env
```

Contenu :
```env
DATABASE_URL="votre-url-prisma-accelerate"
JWT_SECRET="votre-secret-jwt"
PORT=3000
NODE_ENV=production
WEBHOOK_SECRET="votre-secret-webhook"
```

## 🎯 Workflow de déploiement

1. **Développement local**
   - Faire vos modifications
   - Tester localement
   - Commit et push sur GitHub

2. **Déploiement automatique** (si webhook configuré)
   - Le webhook GitHub détecte le push
   - Le serveur de webhook déclenche `deploy.sh`
   - Le backend redémarre automatiquement

3. **Vérification**
   - Vérifier les logs PM2
   - Tester l'API
   - Vérifier que l'app mobile fonctionne

## 🚀 Résultat

Après configuration, chaque `git push origin main` déclenchera automatiquement :
1. 📥 Pull des changements sur le serveur
2. 📦 Installation des dépendances
3. 🔧 Génération Prisma
4. 🗄️ Mise à jour DB
5. 🔨 Build TypeScript
6. ♻️ Redémarrage du backend

Le backend sera disponible à :
- **API REST**: http://159.69.221.252:3000/api
- **Socket.IO**: http://159.69.221.252:3000
- **Health Check**: http://159.69.221.252:3000/api/health
