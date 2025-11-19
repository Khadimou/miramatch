# 🚀 DÉMARRAGE RAPIDE - MIRA MATCH

## ⚡ Installation rapide (3 étapes)

### 1️⃣ Créer le fichier .env du backend

Créez le fichier `backend/.env` avec ce contenu :

```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiZTQzYTAzMDYtMzFhNS00MmNmLTg3ZTEtODQ5OTA3YTM1ODNkIiwidGVuYW50X2lkIjoiYTNlZGQ2Y2ExYzgzODMyNDdlZjgwMzJhNjUxODg2NmZmZjZlMDNlYjJlOTI0ZGMwNjlmNWYyZWU2YThkYzFjZiIsImludGVybmFsX3NlY3JldCI6IjY2MzI2NWQ0LTY3YjItNDJlYy1iZmY4LThiZjlhY2Q5ZWRlMyJ9.p3jdlGP4CLjSMeDExCosrUY8cACdBZBspnMmB3rl4Nc"
PULSE_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiOGI1NWEyNzYtNzRjYS00NGMyLTk2ZWMtYWNlMTFiNDM0MzU0IiwidGVuYW50X2lkIjoiYTNlZGQ2Y2ExYzgzODMyNDdlZjgwMzJhNjUxODg2NmZmZjZlMDNlYjJlOTI0ZGMwNjlmNWYyZWU2YThkYzFjZiIsImludGVybmFsX3NlY3JldCI6IjY2MzI2NWQ0LTY3YjItNDJlYy1iZmY4LThiZjlhY2Q5ZWRlMyJ9.RW6AiPfkKWTu4ybRr3vDHSPH4b7FJFFhvwmqukju9S0"
JWT_SECRET="miramatch-secret-key-change-in-production"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
```

### 2️⃣ Installer et configurer

```bash
npm run setup
```

Cette commande va :
- ✅ Installer les dépendances du frontend
- ✅ Installer les dépendances du backend
- ✅ Générer le Prisma Client

### 3️⃣ Lancer l'application

**Terminal 1** - Backend :
```bash
npm run backend
```

**Terminal 2** - Frontend :
```bash
npm start
```

## 🎯 C'est tout !

Votre application est maintenant connectée à la base de données Prisma Accelerate.

---

## 📖 Besoin de plus d'informations ?

Consultez `SETUP_INSTRUCTIONS.md` pour la documentation complète.

## 🐛 Problèmes ?

### Le backend ne démarre pas
→ Vérifiez que le fichier `backend/.env` existe avec les bonnes valeurs

### Le frontend ne se connecte pas
→ Créez un fichier `.env` à la racine avec :
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Sur appareil mobile
→ Remplacez `localhost` par l'IP de votre ordinateur dans les fichiers .env

## ✅ Vérification

Le backend est prêt quand vous voyez :
```
🚀 Server running on port 3000
📡 API available at http://localhost:3000/api
💬 Socket.IO available at http://localhost:3000
```

Le frontend est prêt quand Expo affiche le QR code.

---

**Bon développement ! 🎉**

