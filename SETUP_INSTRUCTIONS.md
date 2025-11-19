# Instructions d'installation - MIRA MATCH avec Backend Prisma

## Vue d'ensemble

MIRA MATCH est maintenant configuré pour utiliser une base de données Prisma Accelerate. Le projet comprend :
- **Frontend** : Application React Native (Expo)
- **Backend** : API REST Express.js + Prisma + Socket.io

## 📋 Prérequis

- Node.js 18+ installé
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)

## 🚀 Installation

### 1. Configuration du Backend

#### A. Créer le fichier .env
Dans le dossier `backend/`, créez un fichier `.env` avec le contenu suivant :

```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiZTQzYTAzMDYtMzFhNS00MmNmLTg3ZTEtODQ5OTA3YTM1ODNkIiwidGVuYW50X2lkIjoiYTNlZGQ2Y2ExYzgzODMyNDdlZjgwMzJhNjUxODg2NmZmZjZlMDNlYjJlOTI0ZGMwNjlmNWYyZWU2YThkYzFjZiIsImludGVybmFsX3NlY3JldCI6IjY2MzI2NWQ0LTY3YjItNDJlYy1iZmY4LThiZjlhY2Q5ZWRlMyJ9.p3jdlGP4CLjSMeDExCosrUY8cACdBZBspnMmB3rl4Nc"
PULSE_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiOGI1NWEyNzYtNzRjYS00NGMyLTk2ZWMtYWNlMTFiNDM0MzU0IiwidGVuYW50X2lkIjoiYTNlZGQ2Y2ExYzgzODMyNDdlZjgwMzJhNjUxODg2NmZmZjZlMDNlYjJlOTI0ZGMwNjlmNWYyZWU2YThkYzFjZiIsImludGVybmFsX3NlY3JldCI6IjY2MzI2NWQ0LTY3YjItNDJlYy1iZmY4LThiZjlhY2Q5ZWRlMyJ9.RW6AiPfkKWTu4ybRr3vDHSPH4b7FJFFhvwmqukju9S0"
JWT_SECRET="miramatch-secret-key-change-in-production"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
```

#### B. Installer les dépendances du backend

```bash
cd backend
npm install
```

#### C. Générer le Prisma Client

```bash
npm run prisma:generate
```

#### D. (Optionnel) Synchroniser le schema avec la base de données

```bash
npm run prisma:push
```

#### E. Démarrer le serveur backend

```bash
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:3000`

### 2. Configuration du Frontend

#### A. Créer le fichier .env
À la racine du projet, créez un fichier `.env` avec :

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

**Note pour le développement mobile** :
- Si vous testez sur un appareil physique, remplacez `localhost` par l'adresse IP de votre ordinateur
- Exemple : `EXPO_PUBLIC_API_URL=http://192.168.1.10:3000/api`

#### B. Installer les dépendances du frontend

```bash
npm install
```

#### C. Démarrer l'application Expo

```bash
npm start
```

## 📱 Test de l'application

### 1. Créer un compte créateur

Dans l'application, inscrivez-vous avec :
- Email
- Mot de passe
- Nom
- Rôle: **CREATOR**

### 2. Créer un compte client (optionnel)

Pour tester le côté client, créez un autre compte avec le rôle **CLIENT**

### 3. Tester les fonctionnalités

- **Swipe** : Les créateurs peuvent voir et swiper sur les projets
- **Devis** : Envoyer des propositions de devis
- **Messages** : Chat en temps réel entre créateurs et clients
- **Matches** : Voir les projets likés

## 🔧 Résolution de problèmes

### Le backend ne démarre pas

- Vérifiez que le fichier `.env` est bien dans le dossier `backend/`
- Vérifiez que le port 3000 n'est pas déjà utilisé
- Vérifiez que les clés DATABASE_URL et PULSE_API_KEY sont correctes

### Le frontend ne se connecte pas au backend

- Vérifiez que le backend est bien démarré
- Sur un appareil physique, utilisez l'IP de votre ordinateur au lieu de `localhost`
- Vérifiez que le firewall n'est pas bloquant

### Erreur Prisma

```bash
# Régénérer le client Prisma
cd backend
npm run prisma:generate

# Réinitialiser la base de données (attention, cela supprime les données)
npm run prisma:push --force-reset
```

## 🏗️ Architecture

```
MIRA_MATCH/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Configuration (Prisma)
│   │   ├── middleware/        # Auth middleware
│   │   ├── routes/            # Routes API
│   │   └── server.ts          # Serveur Express
│   ├── prisma/
│   │   └── schema.prisma      # Schema Prisma
│   └── package.json
│
├── src/                       # Frontend React Native
│   ├── components/
│   ├── screens/
│   ├── services/
│   │   ├── apiService.ts      # Appels API
│   │   ├── authService.ts     # Authentification
│   │   └── socketService.ts   # WebSocket
│   ├── context/
│   └── navigation/
│
└── package.json
```

## 📚 Mapping des données

Le backend fait automatiquement le mapping entre les modèles MIRA MATCH et Prisma :

| MIRA MATCH | Prisma |
|------------|--------|
| Project | QuoteRequest |
| Quote | QuoteOffer |
| Creator | User + Seller |
| Client | User |
| Conversation | Conversation |
| Message | Message |

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

Les tokens sont stockés de manière sécurisée via `expo-secure-store` dans le frontend.

Tous les endpoints (sauf `/api/auth/*`) nécessitent un token Bearer dans le header :
```
Authorization: Bearer <token>
```

## 📡 Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Projets
- `GET /api/projects/available` - Projets disponibles (créateurs)
- `GET /api/projects/:id` - Détails d'un projet
- `POST /api/projects/:id/like` - Liker un projet
- `POST /api/projects/:id/pass` - Passer un projet

### Devis
- `POST /api/quotes` - Créer un devis
- `GET /api/quotes/my-quotes` - Mes devis
- `PATCH /api/quotes/:id` - Mettre à jour un devis
- `GET /api/quotes/:id` - Détails d'un devis

### Conversations
- `GET /api/conversations` - Mes conversations
- `GET /api/conversations/:id/messages` - Messages d'une conversation
- `POST /api/conversations/:id/messages` - Envoyer un message
- `PATCH /api/conversations/messages/:id/read` - Marquer comme lu

### Upload
- `POST /api/upload` - Upload d'image
- `POST /api/upload/audio` - Upload d'audio

## 🔄 WebSocket Events

Le serveur Socket.io expose ces événements :

**Émis par le client :**
- `join_conversation` - Rejoindre une conversation
- `leave_conversation` - Quitter une conversation
- `send_message` - Envoyer un message
- `typing` - Commencer à taper
- `stop_typing` - Arrêter de taper

**Reçus par le client :**
- `new_message` - Nouveau message reçu
- `user_typing` - Un utilisateur tape
- `user_stop_typing` - Un utilisateur a arrêté de taper

## 🚀 Déploiement

### Backend

Le backend peut être déployé sur :
- **Heroku**
- **Railway**
- **Render**
- **DigitalOcean**
- **AWS EC2**

N'oubliez pas de :
1. Configurer les variables d'environnement
2. Exécuter `npm run prisma:generate` après le déploiement
3. Configurer CORS avec l'URL de votre frontend

### Frontend

L'application React Native peut être compilée :
- **Android** : `eas build --platform android`
- **iOS** : `eas build --platform ios`

## 📝 Prochaines étapes

1. ✅ Backend API avec Prisma configuré
2. ✅ Authentification JWT
3. ✅ Endpoints CRUD pour projets, devis, messages
4. ✅ WebSocket pour chat temps réel
5. ⏳ Upload de fichiers vers S3/Cloudinary
6. ⏳ Notifications push
7. ⏳ Paiements intégrés
8. ⏳ Tests unitaires et d'intégration

## 💡 Conseils

- Utilisez Prisma Studio pour visualiser/éditer les données : `npm run prisma:studio`
- Consultez les logs du backend pour débugger
- Utilisez Postman ou Insomnia pour tester les endpoints API
- Le schema Prisma peut être modifié selon vos besoins

## 🆘 Support

Pour toute question ou problème :
1. Consultez la documentation Prisma : https://www.prisma.io/docs
2. Consultez la documentation Expo : https://docs.expo.dev
3. Vérifiez les logs du backend et du frontend

---

**Développé avec ❤️ pour MIRA MATCH**

