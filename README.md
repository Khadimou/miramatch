# 🎨 MIRA MATCH

**Une plateforme de matching entre créateurs/artisans et clients pour des projets personnalisés**

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)

Application mobile de matching style Tinder pour connecter les créateurs (couturiers, artisans) avec les projets des clients. **Maintenant avec backend Prisma Accelerate intégré !**

## Concept

MIRA MATCH permet aux créateurs de :
- Découvrir des projets de création (vêtements sur mesure, accessoires, etc.)
- Swiper sur les projets (like/pass)
- Proposer des devis instantanés quand ils "like" un projet
- Gérer leurs matches et propositions

Cette app fonctionne en complémentarité avec MIRA Studio où les clients créent leurs projets.

## 🚀 Nouveau : Backend intégré !

✅ **Backend Express.js** avec Prisma Accelerate  
✅ **Base de données PostgreSQL** cloud  
✅ **API REST** complète  
✅ **WebSocket temps réel** avec Socket.io  
✅ **Authentification JWT**  
✅ **Upload de fichiers**

## Technologies

### Frontend
- **React Native** avec **Expo**
- **TypeScript**
- **React Navigation** (tabs + stack)
- **React Native Gesture Handler** pour les animations de swipe
- **React Native Reanimated** pour les animations fluides
- **Socket.io-client** pour le chat temps réel

### Backend
- **Express.js** - API REST
- **Prisma** - ORM avec Accelerate
- **PostgreSQL** - Base de données (Prisma Cloud)
- **Socket.io** - WebSocket temps réel
- **JWT** - Authentification
- **Multer** - Upload de fichiers
- **bcrypt** - Sécurité des mots de passe

## Structure du projet

```
MIRA_MATCH/
├── src/
│   ├── components/        # Composants réutilisables
│   │   └── ProjectCard.tsx
│   ├── screens/          # Écrans de l'application
│   │   ├── LoginScreen.tsx
│   │   ├── SwipeScreen.tsx
│   │   ├── MatchesScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── QuoteModalScreen.tsx
│   ├── navigation/       # Configuration navigation
│   │   └── AppNavigator.tsx
│   ├── context/          # Contextes React
│   │   ├── AuthContext.tsx
│   │   └── SwipeContext.tsx
│   ├── types/            # Types TypeScript
│   │   └── index.ts
│   ├── services/         # Services et données
│   │   └── mockData.ts
│   └── constants/        # Constantes (thème, couleurs)
│       └── theme.ts
├── App.tsx
└── package.json
```

## 🎯 Démarrage rapide

### Option 1 : Script automatique (Windows)

```bash
# Lance backend + frontend automatiquement
./start-dev.ps1
```

### Option 2 : Installation manuelle

```bash
# 1. Installer toutes les dépendances (frontend + backend)
npm run setup

# 2. Terminal 1 - Démarrer le backend API
npm run backend

# 3. Terminal 2 - Démarrer le frontend Expo
npm start
```

### ⚠️ Avant de démarrer

1. Créez le fichier `backend/.env` avec les credentials (voir `START_HERE.md`)
2. Ou laissez le script `start-dev.ps1` le créer automatiquement

### 📱 Tester sur mobile

Scanner le QR code avec l'app Expo Go :
- **iOS** : Télécharger "Expo Go" sur l'App Store
- **Android** : Télécharger "Expo Go" sur le Play Store

**Note** : Sur un appareil physique, remplacez `localhost` par l'IP de votre ordinateur dans les fichiers `.env`

## Utilisation

### Connexion
Pour tester l'app, entrez n'importe quel email et mot de passe sur l'écran de login.

### Navigation
L'app contient 3 onglets principaux :
- **Découvrir** : Interface de swipe pour parcourir les projets
- **Matches** : Liste des projets likés et gestion des devis
- **Profil** : Informations du créateur

### Swiper sur les projets
- Glisser vers la **droite** ou appuyer sur ❤️ pour liker un projet
- Glisser vers la **gauche** ou appuyer sur ✕ pour passer
- Quand vous likez un projet, un formulaire de devis s'affiche automatiquement

### Proposer un devis
Après avoir liké un projet :
1. Le modal de devis s'ouvre
2. Remplir le prix, délai et message
3. Envoyer le devis au client

## Données mockées

L'application utilise des données mockées pour le développement :
- 5 projets de test dans différentes catégories
- 1 profil créateur de test
- Toutes les données sont dans `src/services/mockData.ts`

## ✅ Fonctionnalités implémentées

### Backend API (✅ Complet)
- ✅ Authentification JWT (inscription/connexion)
- ✅ Récupération des projets pour swipe
- ✅ Like/Pass de projets
- ✅ Création et gestion de devis
- ✅ Chat temps réel (Socket.io)
- ✅ Upload d'images et audio
- ✅ Base de données Prisma Accelerate

### Frontend (✅ Complet)
- ✅ Swipe sur les projets
- ✅ Formulaire de devis
- ✅ Liste des matches
- ✅ Chat avec messages texte et audio
- ✅ Profil utilisateur
- ✅ Authentification

## 🔜 Prochaines étapes

### Court terme
- [ ] Tests automatisés (Jest + React Native Testing Library)
- [ ] Upload vers S3/Cloudinary au lieu du stockage local
- [ ] Pagination pour les projets
- [ ] Filtres (budget, localisation, catégorie)

### Moyen terme
- [ ] Notifications push (Expo Notifications)
- [ ] Rating et reviews
- [ ] Système de paiement (Stripe)
- [ ] Analytics et métriques
- [ ] Déploiement production (backend + app stores)

## 📚 Documentation complète

- 📖 **[START_HERE.md](START_HERE.md)** - Guide de démarrage rapide (5 min)
- 📋 **[CONNECTION_SUMMARY.md](CONNECTION_SUMMARY.md)** - Résumé de l'intégration Prisma
- 📚 **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Instructions détaillées
- 🏗️ **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture technique
- 🔧 **[backend/README.md](backend/README.md)** - Documentation backend API

## 🛠️ Scripts disponibles

### Frontend
```bash
npm start          # Lancer Expo
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS
npm run web        # Lancer version web
```

### Backend
```bash
npm run backend           # Démarrer le serveur API
npm run backend:install   # Installer dépendances backend
npm run backend:setup     # Setup complet backend
```

### Tout ensemble
```bash
npm run setup      # Installer tout (frontend + backend)
npm run install:all # Installer les dépendances partout
./start-dev.ps1    # Démarrer tout (Windows PowerShell)
```

## 📡 API Endpoints

```bash
# Authentification
POST /api/auth/register      # Inscription
POST /api/auth/login         # Connexion
POST /api/auth/refresh       # Rafraîchir token

# Projets
GET  /api/projects/available # Liste des projets (créateurs)
GET  /api/projects/:id       # Détails d'un projet
POST /api/projects/:id/like  # Liker un projet
POST /api/projects/:id/pass  # Passer un projet

# Devis
POST  /api/quotes            # Créer un devis
PATCH /api/quotes/:id        # Mettre à jour un devis
GET   /api/quotes/my-quotes  # Mes devis
GET   /api/quotes/:id        # Détails d'un devis

# Conversations
GET  /api/conversations             # Mes conversations
GET  /api/conversations/:id/messages # Messages d'une conversation
POST /api/conversations/:id/messages # Envoyer un message

# Upload
POST /api/upload       # Upload image
POST /api/upload/audio # Upload audio
```

## 🧪 Test de l'API

```bash
# Health check
curl http://localhost:3000/api/health

# Ou utilisez Prisma Studio pour voir les données
cd backend
npm run prisma:studio
```

## 🔐 Sécurité

- ✅ JWT pour l'authentification (expiration 7 jours)
- ✅ Mots de passe hashés avec bcrypt
- ✅ Validation des rôles (créateur vs client)
- ✅ CORS configuré
- ✅ Variables sensibles dans .env

## 🌐 Support

Cette app fonctionne sur :
- ✅ iOS (iPhone/iPad)
- ✅ Android
- ✅ Web (pour le développement)

**Backend** :
- ✅ Windows / macOS / Linux
- ✅ Node.js 18+

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT.

---

**Développé avec ❤️ pour connecter créateurs et clients**

Pour toute question, consultez la documentation ou ouvrez une issue.
