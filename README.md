# MIRA MATCH

Application mobile de matching style Tinder pour connecter les créateurs (couturiers, artisans) avec les projets des clients.

## Concept

MIRA MATCH permet aux créateurs de :
- Découvrir des projets de création (vêtements sur mesure, accessoires, etc.)
- Swiper sur les projets (like/pass)
- Proposer des devis instantanés quand ils "like" un projet
- Gérer leurs matches et propositions

Cette app fonctionne en complémentarité avec MIRA Studio où les clients créent leurs projets.

## Technologies

- **React Native** avec **Expo**
- **TypeScript**
- **React Navigation** (tabs + stack)
- **React Native Gesture Handler** pour les animations de swipe
- **React Native Reanimated** pour les animations fluides

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

## Installation

1. Installer les dépendances :
```bash
cd MIRA_MATCH
npm install
```

2. Lancer l'application :
```bash
npm start
```

3. Scanner le QR code avec l'app Expo Go :
   - **iOS** : Télécharger "Expo Go" sur l'App Store
   - **Android** : Télécharger "Expo Go" sur le Play Store

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

## Prochaines étapes

### Intégration backend (Next.js/Prisma)
- Créer les API endpoints pour :
  - Authentification des créateurs
  - Récupération des projets
  - Création de matches
  - Soumission de devis
- Connecter l'app aux APIs réelles
- Gérer l'état avec React Query ou SWR

### Fonctionnalités à ajouter
- [ ] Notifications push pour nouveaux projets
- [ ] Chat entre créateur et client
- [ ] Système de filtres (budget, localisation, catégorie)
- [ ] Historique des projets complétés
- [ ] Rating et reviews
- [ ] Upload de photos pour le portfolio

## Scripts disponibles

```bash
npm start          # Lancer le serveur Expo
npm run android    # Lancer sur Android (nécessite émulateur)
npm run ios        # Lancer sur iOS (nécessite macOS + Xcode)
npm run web        # Lancer version web
```

## Support

Cette app fonctionne sur :
- iOS (iPhone/iPad)
- Android
- Web (pour le développement)

Note : Pour builder une version native iOS, vous aurez besoin d'un Mac avec Xcode. Pour le développement depuis Windows, utilisez Expo Go pour tester sur votre téléphone.
