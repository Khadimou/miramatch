# Déploiement du Système de Notifications MIRA MATCH

## 📦 Ce qui a été implémenté

### 1. Service de Notifications (`backend/src/services/notification.service.ts`)
- Service complet pour gérer les notifications push et en base de données
- Intégration avec l'API Mira externe : `https://mira.159.69.221.252.nip.io/api/v2`
- Système non-bloquant : si l'API Mira échoue, l'offre est quand même créée
- Logs détaillés avec préfixe `[Notification]`

### 2. Routes API (`backend/src/routes/notifications.routes.ts`)
- `GET /api/notifications/unread` - Récupérer les notifications non lues
- `PATCH /api/notifications/:id/read` - Marquer une notification comme lue
- `PATCH /api/notifications/read-all` - Marquer toutes les notifications comme lues

### 3. Intégration dans la Création de Devis
**Fichier modifié** : `backend/src/routes/quotes.routes.ts`

Lors de la création d'une offre (QuoteOffer) :
1. L'offre est créée dans la base de données
2. Une `UserNotification` est créée pour le client
3. Une notification push est envoyée via l'API Mira
4. Le client reçoit la notification dans son menu cloche

### 4. Améliorations techniques
- Fix du bug de compilation TypeScript dans `server.ts` (PORT converti en number)
- Ajout des imports et routes de notifications dans le serveur
- Variables d'environnement pour configurer l'API Mira

## 🚀 Instructions de Déploiement

### Étape 1 : Upload du package sur le serveur

```bash
# Depuis votre machine locale (PowerShell)
scp backend-notifications-system.tar.gz thiolkia@159.69.221.252:~/
```

### Étape 2 : Extraction et build sur le serveur

```bash
# SSH sur le serveur
ssh thiolkia@159.69.221.252

# Naviguer vers le dossier backend
cd ~/mira-match-backend

# Extraire les nouveaux fichiers
tar -xzf ../backend-notifications-system.tar.gz

# Vérifier que le fichier .env contient les nouvelles variables
cat .env | grep MIRA_API

# Si la variable MIRA_API_URL n'est pas présente, l'ajouter :
echo '' >> .env
echo '# API Mira pour les notifications push' >> .env
echo 'MIRA_API_URL="https://mira.159.69.221.252.nip.io/api/v2"' >> .env

# Build le TypeScript
npm run build

# Redémarrer le backend
pm2 restart mira-match-backend

# Vérifier les logs
pm2 logs mira-match-backend --lines 50
```

### Étape 3 : Vérification

Vérifiez que le serveur démarre correctement :
```bash
pm2 logs mira-match-backend --lines 50
```

Vous devriez voir :
```
🚀 Server running on 0.0.0.0:3001
📡 API available at http://localhost:3001/api
```

## 🧪 Tests

### Test 1 : Créer une offre et vérifier les logs

```bash
# Surveiller les logs en temps réel
pm2 logs mira-match-backend

# Dans un autre terminal, créer une offre depuis l'app mobile
# Vous devriez voir ces logs :
```

Logs attendus :
```
[Notification] Sending push notification to user: user123
[Notification] Quote ID: quote456
[Notification] Push notification sent successfully
[Notification] Creating user notification in DB for user: user123
[Notification] User notification created successfully
[Notification] Complete notification sent for new quote offer
```

### Test 2 : Vérifier les notifications en DB

```bash
# Se connecter à Prisma Studio (optionnel)
npm run prisma:studio

# Ou via curl
curl -X GET http://159.69.221.252:3001/api/notifications/unread \
  -H "Authorization: Bearer CLIENT_TOKEN"
```

### Test 3 : Tester les endpoints

```bash
# Récupérer les notifications non lues
curl -X GET http://159.69.221.252:3001/api/notifications/unread \
  -H "Authorization: Bearer YOUR_TOKEN"

# Marquer une notification comme lue
curl -X PATCH http://159.69.221.252:3001/api/notifications/NOTIF_ID/read \
  -H "Authorization: Bearer YOUR_TOKEN"

# Marquer toutes les notifications comme lues
curl -X PATCH http://159.69.221.252:3001/api/notifications/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Vérifications Post-Déploiement

### ✅ Checklist

- [ ] Le serveur démarre sans erreur : `pm2 logs mira-match-backend`
- [ ] Les variables d'environnement sont configurées : `cat .env | grep MIRA_API`
- [ ] La route `/api/notifications/unread` répond : `curl http://localhost:3001/api/notifications/unread -H "Authorization: Bearer TOKEN"`
- [ ] Une offre créée génère bien des logs `[Notification]`
- [ ] Les UserNotifications sont créées en base de données
- [ ] L'API Mira reçoit bien les requêtes (vérifier les logs)

## 📝 Nouveaux Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/notifications/unread` | Récupère les notifications non lues de l'utilisateur connecté |
| PATCH | `/api/notifications/:id/read` | Marque une notification comme lue |
| PATCH | `/api/notifications/read-all` | Marque toutes les notifications comme lues |

## 🔧 Structure des Fichiers Ajoutés/Modifiés

```
backend/
├── src/
│   ├── services/
│   │   └── notification.service.ts          [NOUVEAU]
│   ├── routes/
│   │   ├── notifications.routes.ts          [NOUVEAU]
│   │   └── quotes.routes.ts                 [MODIFIÉ]
│   └── server.ts                            [MODIFIÉ]
├── .env                                      [MODIFIÉ]
└── NOTIFICATIONS.md                          [NOUVEAU]
```

## 🐛 Résolution des Problèmes

### Problème : L'API Mira retourne une erreur

**Solution** : Vérifiez que l'URL de l'API est correcte dans le fichier `.env`

```bash
cat .env | grep MIRA_API_URL
```

### Problème : Les notifications ne sont pas créées en base de données

**Solution** : Vérifiez les logs pour voir l'erreur exacte

```bash
pm2 logs mira-match-backend | grep Notification
```

### Problème : Le serveur ne démarre pas après le déploiement

**Solution** : Vérifiez les erreurs de compilation

```bash
cd ~/mira-match-backend
npm run build
# Regardez les erreurs de TypeScript
```

## 📚 Documentation

Pour plus de détails sur le système de notifications, consultez :
- `backend/NOTIFICATIONS.md` - Documentation complète du système
- Logs du serveur : `pm2 logs mira-match-backend`

## 🎯 Prochaines Étapes (Optionnel)

1. **Côté Frontend** : Implémenter l'affichage des notifications dans l'app mobile
   - Créer un badge de notification dans le header
   - Créer un écran pour afficher toutes les notifications
   - Implémenter le marquage comme lu au clic

2. **Notifications WebSocket** : Ajouter des notifications en temps réel via Socket.io

3. **Nettoyage automatique** : Script cron pour supprimer les anciennes notifications

## ⚠️ Notes Importantes

1. Le système de notifications est **non-bloquant** : si l'API Mira échoue, l'offre est quand même créée
2. Toutes les erreurs sont loggées mais ne bloquent pas le flux principal
3. Les UserNotifications sont automatiquement supprimées si l'utilisateur est supprimé (Cascade)
4. L'API Mira n'a pas besoin d'authentification par clé API

## 📞 Support

En cas de problème, vérifiez :
1. Les logs du serveur : `pm2 logs mira-match-backend`
2. La configuration `.env`
3. Que le build s'est bien passé : `ls -la dist/`
