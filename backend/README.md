# MIRA MATCH Backend API

Backend API pour l'application MIRA MATCH - Une plateforme de matching entre créateurs/artisans et clients pour des projets personnalisés.

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Créer le fichier `.env` à la racine du dossier backend :
```bash
cp .env.example .env
```

3. Configurer les variables d'environnement dans `.env` :
```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
PULSE_API_KEY="YOUR_PULSE_API_KEY"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
```

4. Générer le Prisma Client :
```bash
npm run prisma:generate
```

5. (Optionnel) Push le schema vers la base de données :
```bash
npm run prisma:push
```

## Développement

Lancer le serveur en mode développement :
```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

## Scripts disponibles

- `npm run dev` - Lancer le serveur en mode développement
- `npm run build` - Compiler le TypeScript
- `npm start` - Lancer le serveur en production
- `npm run prisma:generate` - Générer le Prisma Client
- `npm run prisma:push` - Push le schema vers la base de données
- `npm run prisma:studio` - Ouvrir Prisma Studio

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Projets
- `GET /api/projects/available` - Liste des projets disponibles (créateurs)
- `GET /api/projects/:projectId` - Détails d'un projet
- `POST /api/projects/:projectId/like` - Liker un projet
- `POST /api/projects/:projectId/pass` - Passer un projet

### Devis
- `POST /api/quotes` - Soumettre un devis
- `PATCH /api/quotes/:quoteId` - Mettre à jour un devis
- `GET /api/quotes/my-quotes` - Mes devis
- `GET /api/quotes/:quoteId` - Détails d'un devis

### Conversations & Messages
- `GET /api/conversations` - Liste des conversations
- `GET /api/conversations/:conversationId/messages` - Messages d'une conversation
- `POST /api/conversations/:conversationId/messages` - Envoyer un message
- `PATCH /api/conversations/messages/:messageId/read` - Marquer comme lu

### Upload
- `POST /api/upload` - Upload d'image
- `POST /api/upload/audio` - Upload d'audio

## Structure du projet

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # Configuration Prisma
│   ├── middleware/
│   │   └── auth.ts           # Middleware d'authentification
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── quotes.routes.ts
│   │   ├── conversations.routes.ts
│   │   └── upload.routes.ts
│   └── server.ts             # Serveur Express principal
├── prisma/
│   └── schema.prisma         # Schema Prisma
├── uploads/                  # Fichiers uploadés
├── .env                      # Variables d'environnement
├── .env.example              # Exemple de configuration
├── package.json
└── tsconfig.json
```

## Mapping des types

Le backend fait le mapping entre les types MIRA MATCH et le schema Prisma :

- `Project` (MIRA MATCH) → `QuoteRequest` (Prisma)
- `Quote` (MIRA MATCH) → `QuoteOffer` (Prisma)
- `Creator` (MIRA MATCH) → `User` + `Seller` (Prisma)
- `Client` (MIRA MATCH) → `User` (Prisma)
- `Conversation` et `Message` utilisent directement les modèles Prisma

## WebSocket (Socket.io)

Le serveur expose des événements Socket.io pour le chat en temps réel :

- `join_conversation` - Rejoindre une conversation
- `leave_conversation` - Quitter une conversation
- `send_message` - Envoyer un message
- `new_message` - Recevoir un nouveau message
- `typing` / `stop_typing` - Indicateurs de saisie

## Technologies utilisées

- **Express.js** - Framework web
- **Prisma** - ORM
- **Socket.io** - Communication temps réel
- **JWT** - Authentification
- **Multer** - Upload de fichiers
- **TypeScript** - Typage statique
- **bcrypt** - Hashage des mots de passe

