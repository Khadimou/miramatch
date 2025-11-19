# 🏗️ Architecture MIRA MATCH

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                     MIRA MATCH - Architecture                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐            ┌──────────────────┐
│                  │            │                  │
│  React Native    │   HTTP     │  Express.js      │
│  (Expo)          │◄──────────►│  Backend API     │
│                  │  REST API  │                  │
│  • Screens       │            │  • Auth          │
│  • Components    │            │  • Projects      │
│  • Services      │   Socket   │  • Quotes        │
│  • Navigation    │◄──────────►│  • Messages      │
│                  │   .io      │  • Upload        │
│                  │            │                  │
└──────────────────┘            └────────┬─────────┘
        │                                 │
        │                                 │
        │ Secure Store                    │ Prisma Client
        │ (JWT Token)                     │ + Accelerate
        │                                 │
        ▼                                 ▼
┌──────────────────┐            ┌──────────────────┐
│                  │            │                  │
│  expo-secure-    │            │  PostgreSQL      │
│  store           │            │  Database        │
│                  │            │  (Prisma Cloud)  │
└──────────────────┘            └──────────────────┘
```

## 🔄 Flux de données

### 1. Authentification

```
User (App) → POST /api/auth/login → Backend
                                      │
                                      ├─ bcrypt.compare(password)
                                      ├─ Generate JWT token
                                      │
Backend ← { token, user } ───────────┘
   │
   └─► Secure Store (Frontend)
```

### 2. Récupération des projets (Swipe)

```
Creator → GET /api/projects/available → Backend
                                          │
                                          ├─ Authenticate JWT
                                          ├─ Get seller from user
                                          ├─ Query QuoteRequests
                                          │
Backend ← [Projects array] ──────────────┘
   │
   └─► SwipeScreen (Frontend)
```

### 3. Envoi d'un devis

```
Creator → POST /api/quotes → Backend
              │                │
              │                ├─ Authenticate JWT
              │                ├─ Get seller
              │                ├─ Create QuoteOffer
              │                ├─ Notify client (Socket.io)
              │                │
              └────────────────┘
                   ↓
              Quote created
```

### 4. Chat temps réel

```
User A (Client)                    Backend                    User B (Creator)
      │                               │                               │
      ├─ socket.emit('send_message')─►│                               │
      │                               ├─ Save to DB (Message)         │
      │                               ├─ socket.to(conversationId)────►│
      │                               │   .emit('new_message')         │
      │                               │                               ├─► Display message
```

## 📦 Structure des modules

### Frontend (React Native)

```
src/
├── components/              # Composants réutilisables
│   ├── ProjectCard.tsx     # Carte de projet (swipe)
│   ├── LogoIcon.tsx        # Logo de l'app
│   └── SplashScreen.tsx    # Écran de démarrage
│
├── screens/                 # Écrans de l'application
│   ├── LoginScreen.tsx     # Connexion / Inscription
│   ├── SwipeScreen.tsx     # Swipe sur les projets
│   ├── MatchesScreen.tsx   # Projets likés
│   ├── QuoteModalScreen.tsx # Envoi de devis
│   ├── MessagesScreen.tsx  # Liste des conversations
│   ├── ChatScreen.tsx      # Conversation détaillée
│   └── ProfileScreen.tsx   # Profil utilisateur
│
├── services/                # Services API
│   ├── apiService.ts       # Appels REST API
│   ├── authService.ts      # Gestion auth (token)
│   ├── socketService.ts    # WebSocket temps réel
│   └── mockData.ts         # Données de test
│
├── context/                 # Context API React
│   ├── AuthContext.tsx     # État d'authentification
│   ├── SwipeContext.tsx    # État du swipe
│   └── MessagesContext.tsx # État des messages
│
├── navigation/              # Navigation
│   └── AppNavigator.tsx    # Stack & Tab navigation
│
├── constants/               # Constantes
│   └── theme.ts            # Couleurs, polices, etc.
│
└── types/                   # Types TypeScript
    └── index.ts            # Interfaces (Project, Quote, etc.)
```

### Backend (Express.js)

```
backend/src/
├── config/
│   └── database.ts         # Prisma Client + Accelerate
│
├── middleware/
│   └── auth.ts             # JWT authentication
│                           # - authenticate()
│                           # - requireCreator()
│                           # - requireClient()
│
├── routes/
│   ├── auth.routes.ts      # POST /register
│   │                       # POST /login
│   │                       # POST /refresh
│   │
│   ├── projects.routes.ts  # GET  /available
│   │                       # GET  /:id
│   │                       # POST /:id/like
│   │                       # POST /:id/pass
│   │
│   ├── quotes.routes.ts    # POST  /
│   │                       # PATCH /:id
│   │                       # GET   /my-quotes
│   │                       # GET   /:id
│   │
│   ├── conversations.routes.ts # GET  /
│   │                           # GET  /:id/messages
│   │                           # POST /:id/messages
│   │                           # PATCH /messages/:id/read
│   │
│   └── upload.routes.ts    # POST / (images)
│                           # POST /audio
│
└── server.ts               # Express app + Socket.io
```

### Base de données (Prisma)

```
backend/prisma/
└── schema.prisma           # Schema complet

Modèles principaux:
├── User                    # Utilisateurs (clients + créateurs)
├── Seller                  # Profils créateurs
├── SellerProfile           # Détails créateurs
├── QuoteRequest            # Projets/demandes (= Project)
├── QuoteOffer              # Devis/offres (= Quote)
├── Conversation            # Conversations
└── Message                 # Messages
```

## 🔐 Sécurité

### Authentification JWT

```typescript
// 1. User logs in
POST /api/auth/login
{ email, password }

// 2. Server validates & generates token
const token = jwt.sign(
  { userId: user.id, role: user.role },
  JWT_SECRET,
  { expiresIn: '7d' }
)

// 3. Client stores token
SecureStore.setItemAsync('authToken', token)

// 4. Client sends token in requests
headers: {
  'Authorization': `Bearer ${token}`
}

// 5. Server validates token
const decoded = jwt.verify(token, JWT_SECRET)
req.userId = decoded.userId
```

### Rôles et permissions

```typescript
// Dans le middleware auth.ts

requireCreator() // Seuls les créateurs peuvent :
                 // - Voir les projets disponibles
                 // - Envoyer des devis
                 // - Liker/passer des projets

requireClient()  // Seuls les clients peuvent :
                 // - Créer des projets
                 // - Accepter/rejeter des devis
```

## 🌐 API Endpoints

### Publics (sans auth)
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/health` - Health check

### Protégés (avec JWT)
- `GET /api/projects/available` - Liste projets (créateurs)
- `POST /api/quotes` - Créer devis (créateurs)
- `GET /api/conversations` - Liste conversations (tous)
- `POST /api/upload` - Upload fichiers (tous)

## 📡 WebSocket Events

### Client → Server
```javascript
socket.emit('join_conversation', conversationId)
socket.emit('send_message', { conversationId, message })
socket.emit('typing', { conversationId, userId })
socket.emit('stop_typing', { conversationId, userId })
```

### Server → Client
```javascript
socket.on('new_message', (message) => { ... })
socket.on('user_typing', ({ userId }) => { ... })
socket.on('user_stop_typing', ({ userId }) => { ... })
```

## 🔄 États de l'application

### AuthContext
```typescript
{
  user: Creator | null
  token: string | null
  isLoading: boolean
  login: (credentials) => Promise<void>
  logout: () => Promise<void>
  register: (data) => Promise<void>
}
```

### SwipeContext
```typescript
{
  projects: Project[]
  currentIndex: number
  isLoading: boolean
  likeProject: (id) => Promise<void>
  passProject: (id) => Promise<void>
  fetchProjects: () => Promise<void>
}
```

### MessagesContext
```typescript
{
  conversations: Conversation[]
  unreadCount: number
  isConnected: boolean
  fetchConversations: () => Promise<void>
  sendMessage: (conversationId, message) => Promise<void>
}
```

## 📊 Modèle de données

### User → Creator (Seller)

```typescript
User {
  id: string
  email: string
  password: string (hashed)
  role: 'CLIENT' | 'CREATOR'
  seller?: Seller  // Si role = 'CREATOR'
}

Seller {
  id: string
  userId: string
  brandName: string
  sellerType: 'ATELIER' | 'ACCESSOIRES' | 'AUTRE'
  profile?: SellerProfile
  quoteOffers: QuoteOffer[]  // Devis envoyés
}

SellerProfile {
  description: string
  avatar: string
  city: string
  phone: string
}
```

### Project (QuoteRequest) → Quote (QuoteOffer)

```typescript
QuoteRequest {  // = Project dans l'app
  id: string
  userId: string          // Client
  productName: string
  description: string
  budget: float
  customImageUrl: string
  status: 'open' | 'in_progress' | 'completed'
  offers: QuoteOffer[]    // Devis reçus
}

QuoteOffer {  // = Quote dans l'app
  id: string
  quoteRequestId: string  // Projet
  sellerId: string        // Créateur
  price: float
  deliveryTime: int       // jours
  description: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}
```

### Conversation → Message

```typescript
Conversation {
  id: string
  userId: string          // Client
  sellerId: string        // Créateur
  messages: Message[]
  lastMessageAt: DateTime
}

Message {
  id: string
  conversationId: string
  senderId: string
  senderType: 'client' | 'creator'
  content: string
  type: 'text' | 'audio'
  audioUrl?: string
  isRead: boolean
}
```

## 🚀 Déploiement

### Backend
```bash
# Sur Railway / Render / Heroku
1. Configurer les variables d'environnement
2. npm install
3. npm run prisma:generate
4. npm run build
5. npm start
```

### Frontend
```bash
# Build Android
eas build --platform android

# Build iOS
eas build --platform ios
```

## 📈 Performance

### Optimisations

1. **Prisma Accelerate** - Cache global, connexions rapides
2. **Indexes DB** - Sur userId, sellerId, createdAt
3. **Socket.io** - Temps réel sans polling
4. **JWT** - Auth stateless (pas de sessions)
5. **Expo** - Bundling optimisé

### Métriques à surveiller

- Temps de réponse API (< 200ms)
- Latence WebSocket (< 50ms)
- Taille des bundles JS (< 5MB)
- Queries DB (< 10 par requête)

## 🧪 Tests

### À implémenter

```bash
backend/
├── tests/
│   ├── auth.test.ts
│   ├── projects.test.ts
│   ├── quotes.test.ts
│   └── messages.test.ts

frontend/
├── __tests__/
│   ├── screens/
│   ├── components/
│   └── services/
```

## 📚 Documentation externe

- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [Socket.io Docs](https://socket.io/docs/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)

---

**Architecture conçue pour MIRA MATCH**
**Scalable • Sécurisé • Temps réel**

