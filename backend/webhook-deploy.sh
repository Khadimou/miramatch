#!/bin/bash

# Webhook Deployment Script pour MIRA MATCH Backend
# Ce script peut être déclenché par un webhook GitHub

# Configuration
WEBHOOK_SECRET="${GITHUB_WEBHOOK_SECRET:-your-secret-here}"
DEPLOY_SCRIPT="/home/thiolkia/MIRA_MATCH/backend/deploy.sh"
LOG_FILE="/home/thiolkia/webhook-deploy.log"

# Fonction de log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "🔔 Webhook received"

# Vérifier que le script de déploiement existe
if [ ! -f "$DEPLOY_SCRIPT" ]; then
    log "❌ Deploy script not found at $DEPLOY_SCRIPT"
    exit 1
fi

# Exécuter le script de déploiement
log "🚀 Starting deployment..."
bash "$DEPLOY_SCRIPT" 2>&1 | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    log "✅ Deployment completed successfully"
    exit 0
else
    log "❌ Deployment failed"
    exit 1
fi
