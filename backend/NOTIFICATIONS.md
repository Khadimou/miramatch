# Système de Notifications MIRA MATCH

Ce document décrit le système de notifications push intégré à MIRA MATCH.

## Architecture

Le système de notifications utilise une approche hybride :

1. **Notifications en base de données** (`UserNotification`) - Stockées dans Prisma pour consultation ultérieure
2. **Notifications push mobiles** - Envoyées via l'API Mira externe pour notifications en temps réel

## Flux de notification lors de la création d'une offre

```
Vendeur crée une offre
        ↓
Upload des fichiers → /api/upload
        ↓
Création QuoteOffer → Base de données Prisma
        ↓
    ┌───┴───┐
    ↓       ↓
Notification DB   Notification Push
(UserNotification)  (API Mira)
        ↓
Client reçoit notification
        ↓
Menu cloche en haut de page
        ↓
Client consulte les offres
        ↓
Client accepte/refuse l'offre
```

## Configuration

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# API Mira pour les notifications push
MIRA_API_URL="https://mira.159.69.221.252.nip.io/api/v2"
```

Note : L'API Mira n'a pas besoin de clé d'authentification.

## API Endpoints

### Notifications

#### 1. Récupérer les notifications non lues

```http
GET /api/notifications/unread
Authorization: Bearer {token}
```

**Réponse** :
```json
[
  {
    "id": "notif123",
    "userId": "user456",
    "type": "new_quote_offer",
    "title": "🎉 Nouvelle proposition reçue !",
    "message": "Jean Dupont a envoyé une proposition de 50000 XOF pour \"Robe traditionnelle\"",
    "data": {
      "quoteId": "quote789",
      "quoteOfferId": "offer101",
      "projectName": "Robe traditionnelle",
      "sellerName": "Jean Dupont",
      "price": 50000,
      "currency": "XOF"
    },
    "isRead": false,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
]
```

#### 2. Marquer une notification comme lue

```http
PATCH /api/notifications/{notificationId}/read
Authorization: Bearer {token}
```

**Réponse** :
```json
{
  "success": true
}
```

#### 3. Marquer toutes les notifications comme lues

```http
PATCH /api/notifications/read-all
Authorization: Bearer {token}
```

**Réponse** :
```json
{
  "success": true
}
```

## Service de Notification

Le service `notification.service.ts` expose plusieurs méthodes :

### `notifyNewQuoteOffer()`

Envoie une notification complète (DB + Push) lorsqu'un vendeur crée une offre.

```typescript
await notificationService.notifyNewQuoteOffer(
  userId,           // ID du client qui reçoit la notification
  quoteId,          // ID du projet (QuoteRequest)
  quoteOfferId,     // ID de l'offre (QuoteOffer)
  sellerName,       // Nom du vendeur
  projectName,      // Nom du projet
  price,            // Prix de l'offre
  currency          // Devise (XOF, EUR, etc.)
);
```

### `notifyQuoteAccepted()`

Notifie le vendeur lorsqu'un client accepte son offre.

```typescript
await notificationService.notifyQuoteAccepted(
  sellerId,         // ID du vendeur
  quoteId,          // ID du projet
  projectName,      // Nom du projet
  clientName        // Nom du client
);
```

### Autres méthodes disponibles

- `getUnreadNotifications(userId)` - Récupère les notifications non lues
- `markAsRead(notificationId)` - Marque une notification comme lue
- `markAllAsRead(userId)` - Marque toutes les notifications comme lues
- `sendPushNotification(userId, quoteId, data)` - Envoie uniquement la notification push
- `createUserNotification(userId, data)` - Crée uniquement la notification en DB

## Types de notifications

| Type | Description |
|------|-------------|
| `new_quote_offer` | Nouvelle proposition de devis reçue |
| `quote_accepted` | Offre acceptée par le client |
| `quote_rejected` | Offre refusée par le client |
| `new_message` | Nouveau message dans une conversation |

## Gestion des erreurs

Le système de notifications est conçu pour **ne jamais bloquer** les opérations principales :

- Si l'API Mira échoue, la notification push n'est pas envoyée mais l'offre est quand même créée
- Si la création de la notification en DB échoue, elle est loggée mais n'empêche pas la création de l'offre
- Tous les échecs sont loggés dans la console avec le préfixe `[Notification]`

## Logs

Les logs de notification suivent ce format :

```
[Notification] Sending push notification to user: user123
[Notification] Quote ID: quote456
[Notification] Data: {...}
[Notification] Push notification sent successfully
[Notification] Creating user notification in DB for user: user123
[Notification] User notification created successfully
[Notification] Complete notification sent for new quote offer
```

## Test manuel

### 1. Créer une offre

```bash
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "projectId": "project123",
    "price": 50000,
    "currency": "XOF",
    "deliveryTime": 14,
    "message": "Je peux réaliser ce projet",
    "detailedProposal": "Proposition détaillée..."
  }'
```

### 2. Vérifier les notifications

```bash
curl -X GET http://localhost:3000/api/notifications/unread \
  -H "Authorization: Bearer CLIENT_TOKEN"
```

### 3. Marquer comme lue

```bash
curl -X PATCH http://localhost:3000/api/notifications/notif123/read \
  -H "Authorization: Bearer CLIENT_TOKEN"
```

## Intégration frontend

Exemple de code React Native pour récupérer et afficher les notifications :

```typescript
import { apiService } from '../services/apiService';

// Récupérer les notifications
const notifications = await apiService.getUnreadNotifications();

// Afficher le badge avec le nombre de notifications
<Badge count={notifications.length} />

// Marquer comme lue au clic
const handleNotificationClick = async (notificationId: string) => {
  await apiService.markNotificationAsRead(notificationId);
  // Naviguer vers la page appropriée
};
```

## Base de données

### Modèle UserNotification

```prisma
model UserNotification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  title     String
  message   String
  data      Json?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
}
```

## Sécurité

- Toutes les routes de notifications nécessitent une authentification JWT
- Un utilisateur ne peut voir que ses propres notifications
- Les notifications sont automatiquement supprimées si l'utilisateur est supprimé (onDelete: Cascade)

## Performances

- Les notifications sont indexées par `userId` et `createdAt` pour des requêtes rapides
- Les notifications push sont envoyées de manière asynchrone (non bloquante)
- Pas de limitation sur le nombre de notifications stockées (à implémenter si nécessaire)

## TODO / Améliorations futures

- [ ] Ajouter un système de nettoyage automatique des anciennes notifications (> 30 jours)
- [ ] Implémenter les notifications WebSocket en temps réel
- [ ] Ajouter des préférences utilisateur (types de notifications à recevoir)
- [ ] Ajouter des templates de notifications multilingues
- [ ] Implémenter un système de priorité pour les notifications
