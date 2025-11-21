#!/bin/bash

# Script de déploiement pour MIRA MATCH Backend
# À exécuter sur le serveur SSH thiolkia@159.69.221.252

set -e  # Arrêter en cas d'erreur

# Source nvm pour utiliser Node.js v20
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "🚀 Starting MIRA MATCH Backend Deployment..."
echo "📌 Node version: $(node --version)"
echo "📌 NPM version: $(npm --version)"

# Configuration
PROJECT_DIR="/home/thiolkia/MIRA_MATCH"
BACKEND_DIR="$PROJECT_DIR/backend"
APP_NAME="mira-match-backend"
LOG_FILE="/home/thiolkia/deploy.log"

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# 1. Aller dans le répertoire du projet
log "📂 Navigating to project directory..."
cd "$PROJECT_DIR" || { error "Failed to navigate to $PROJECT_DIR"; exit 1; }

# 2. Sauvegarder la branche actuelle
CURRENT_BRANCH=$(git branch --show-current)
log "📍 Current branch: $CURRENT_BRANCH"

# 3. Stash les changements locaux si nécessaire
if ! git diff-index --quiet HEAD --; then
    warn "Uncommitted changes detected, stashing..."
    git stash
fi

# 4. Récupérer les dernières modifications
log "📥 Pulling latest changes from GitHub..."
git fetch origin
git pull origin main || { error "Failed to pull from GitHub"; exit 1; }

# 5. Installer les dépendances backend si nécessaire
log "📦 Installing backend dependencies..."
cd "$BACKEND_DIR" || { error "Failed to navigate to backend directory"; exit 1; }

if [ -f "package-lock.json" ]; then
    npm ci --production=false || npm install || { error "Failed to install dependencies"; exit 1; }
else
    npm install || { error "Failed to install dependencies"; exit 1; }
fi

# 6. Générer le client Prisma
log "🔧 Generating Prisma Client..."
npx prisma generate || { error "Failed to generate Prisma Client"; exit 1; }

# 7. Appliquer les changements de schéma Prisma
log "🗄️  Pushing Prisma schema changes..."
npx prisma db push --accept-data-loss || { warn "Prisma push failed or no changes needed"; }

# 8. Build le backend TypeScript
log "🔨 Building TypeScript backend..."
npm run build || { error "Failed to build backend"; exit 1; }

# 9. Redémarrer l'application avec PM2
log "🔄 Restarting backend with PM2..."

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    error "PM2 is not installed. Installing globally..."
    npm install -g pm2
fi

# Vérifier si l'app existe déjà dans PM2
if pm2 list | grep -q "$APP_NAME"; then
    log "♻️  Restarting existing PM2 process..."
    pm2 restart "$APP_NAME" || { error "Failed to restart PM2 process"; exit 1; }
else
    log "🆕 Starting new PM2 process..."
    pm2 start npm --name "$APP_NAME" -- start || { error "Failed to start PM2 process"; exit 1; }
fi

# 10. Sauvegarder la configuration PM2
pm2 save

# 11. Afficher le statut
log "📊 Current PM2 status:"
pm2 status

# 12. Afficher les derniers logs
log "📝 Recent logs:"
pm2 logs "$APP_NAME" --lines 20 --nostream

log "✅ Deployment completed successfully!"
log "🌐 Backend should be running on port 3000"
log "📡 API: http://159.69.221.252:3000/api"
log "💬 Socket.IO: http://159.69.221.252:3000"

exit 0
