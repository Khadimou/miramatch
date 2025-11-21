/**
 * Serveur de webhook GitHub pour déploiement automatique
 *
 * Installation:
 * npm install express body-parser crypto child_process
 *
 * Utilisation:
 * node setup-webhook-server.js
 *
 * Puis configurer le webhook GitHub:
 * URL: http://159.69.221.252:9000/webhook
 * Content type: application/json
 * Secret: votre-secret-webhook (même que WEBHOOK_SECRET)
 * Events: Just the push event
 */

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.WEBHOOK_PORT || 9000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'change-me-in-production';
const DEPLOY_SCRIPT = process.env.DEPLOY_SCRIPT || '/home/thiolkia/MIRA_MATCH/backend/deploy.sh';

// Middleware pour parser le JSON
app.use(bodyParser.json());

// Fonction pour vérifier la signature GitHub
function verifySignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    return false;
  }

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Endpoint de webhook
app.post('/webhook', (req, res) => {
  console.log('📥 Webhook received');

  // Vérifier la signature
  if (!verifySignature(req)) {
    console.error('❌ Invalid signature');
    return res.status(401).send('Invalid signature');
  }

  const event = req.headers['x-github-event'];
  const payload = req.body;

  console.log(`📦 Event: ${event}`);
  console.log(`🌿 Branch: ${payload.ref}`);

  // Ne déployer que pour les push sur la branche main
  if (event === 'push' && payload.ref === 'refs/heads/main') {
    console.log('🚀 Triggering deployment...');

    // Exécuter le script de déploiement
    exec(`bash ${DEPLOY_SCRIPT}`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Deployment failed:', error);
        console.error('stderr:', stderr);
        return;
      }

      console.log('✅ Deployment completed');
      console.log('stdout:', stdout);
    });

    res.status(200).send('Deployment triggered');
  } else {
    console.log('⏭️  Skipping deployment (not a push to main)');
    res.status(200).send('Event received but not processed');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    deployScript: DEPLOY_SCRIPT,
  });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log('🎣 GitHub Webhook Server started');
  console.log(`📡 Listening on http://0.0.0.0:${PORT}`);
  console.log(`🔐 Webhook URL: http://159.69.221.252:${PORT}/webhook`);
  console.log(`🔑 Secret configured: ${WEBHOOK_SECRET ? 'Yes' : 'No'}`);
  console.log(`📜 Deploy script: ${DEPLOY_SCRIPT}`);
  console.log('\n⚠️  Make sure to:');
  console.log('  1. Set WEBHOOK_SECRET environment variable');
  console.log('  2. Configure GitHub webhook with the same secret');
  console.log('  3. Open port 9000 in firewall');
  console.log('  4. Make deploy.sh executable: chmod +x deploy.sh');
});
