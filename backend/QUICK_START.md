# Backend - Démarrage rapide

## Étape 1 : Créer .env

Créez le fichier `.env` dans ce dossier (`backend/`) avec :

```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiZTQzYTAzMDYtMzFhNS00MmNmLTg3ZTEtODQ5OTA3YTM1ODNkIiwidGVuYW50X2lkIjoiYTNlZGQ2Y2ExYzgzODMyNDdlZjgwMzJhNjUxODg2NmZmZjZlMDNlYjJlOTI0ZGMwNjlmNWYyZWU2YThkYzFjZiIsImludGVybmFsX3NlY3JldCI6IjY2MzI2NWQ0LTY3YjItNDJlYy1iZmY4LThiZjlhY2Q5ZWRlMyJ9.p3jdlGP4CLjSMeDExCosrUY8cACdBZBspnMmB3rl4Nc"
PULSE_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiOGI1NWEyNzYtNzRjYS00NGMyLTk2ZWMtYWNlMTFiNDM0MzU0IiwidGVuYW50X2lkIjoiYTNlZGQ2Y2ExYzgzODMyNDdlZjgwMzJhNjUxODg2NmZmZjZlMDNlYjJlOTI0ZGMwNjlmNWYyZWU2YThkYzFjZiIsImludGVybmFsX3NlY3JldCI6IjY2MzI2NWQ0LTY3YjItNDJlYy1iZmY4LThiZjlhY2Q5ZWRlMyJ9.RW6AiPfkKWTu4ybRr3vDHSPH4b7FJFFhvwmqukju9S0"
JWT_SECRET="miramatch-secret-key-change-in-production"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
```

## Étape 2 : Installer

```bash
npm install
```

## Étape 3 : Générer Prisma Client

```bash
npm run prisma:generate
```

## Étape 4 : Lancer le serveur

```bash
npm run dev
```

## ✅ Vérification

Vous devriez voir :
```
🚀 Server running on port 3000
📡 API available at http://localhost:3000/api
💬 Socket.IO available at http://localhost:3000
```

## 🧪 Tester l'API

Ouvrez dans votre navigateur :
http://localhost:3000/api/health

Vous devriez voir :
```json
{"status":"ok","message":"MIRA MATCH API is running"}
```

## 📚 Plus d'infos

Consultez `README.md` pour la documentation complète.

