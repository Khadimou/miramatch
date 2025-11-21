# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MIRA MATCH is a Tinder-style matching platform connecting creators (tailors, artisans) with client projects. Built with React Native (Expo) frontend and Express.js backend with Prisma ORM.

## Commands

### Frontend (React Native/Expo)
```bash
npm start              # Start Expo dev server
npm run android        # Launch on Android emulator
npm run ios            # Launch on iOS simulator
npm run web            # Launch web version
```

### Backend (Express.js API)
```bash
npm run backend        # Start backend dev server (port 3000)
cd backend && npm run dev              # Alternative: run from backend directory
cd backend && npm run prisma:studio    # Open Prisma Studio for DB management
cd backend && npm run seed             # Seed the database with test data
```

### Setup & Installation
```bash
npm run setup          # Install all dependencies (frontend + backend)
npm run install:all    # Install dependencies only
./start-dev.ps1        # Windows: Auto-start both frontend and backend
```

### Database (Prisma)
**IMPORTANT: Always use `prisma db push` to apply schema changes**
```bash
cd backend
npx prisma db push                  # Push schema changes to database
npx prisma generate                 # Regenerate Prisma Client
npx prisma studio                   # Open Prisma Studio GUI
```

## Architecture

### Monorepo Structure
- **Root**: React Native/Expo mobile app
- **backend/**: Express.js API server with Prisma ORM
- Shared TypeScript types between frontend and backend

### Database & API
- **ORM**: Prisma with PostgreSQL (Prisma Accelerate cloud)
- **Auth**: JWT tokens stored in expo-secure-store
- **Real-time**: Socket.io for chat and live updates
- **File uploads**: Multer (stored in `backend/uploads/`)

### Key Data Models (Prisma Schema)
The schema uses different naming conventions:
- `QuoteRequest` = Project in the app (client's project request)
- `QuoteOffer` = Quote in the app (creator's bid/offer)
- `Seller` = Creator profile
- `ProjectLike` = When creator likes a project (creates a match)
- `ProjectPass` = When creator passes on a project

Important relationships:
- `User` → `Seller` (1:1, if role is CREATOR)
- `QuoteRequest` → `QuoteOffer[]` (1:many, project has multiple bids)
- `Seller` → `ProjectLike[]` (1:many, creator's liked projects)
- `Conversation` → `Message[]` (1:many)

### Authentication Flow
1. User logs in → Backend generates JWT
2. JWT stored in expo-secure-store (mobile)
3. All API calls include `Authorization: Bearer ${token}` header
4. Backend middleware validates JWT and attaches userId to request
5. Role-based access: requireCreator() / requireClient() middleware

### Swipe & Matching Logic
1. Creator fetches available projects: `GET /api/projects/available`
   - Backend filters out already liked/passed projects for this seller
2. Creator swipes right (like): `POST /api/projects/:id/like`
   - Creates ProjectLike record
   - Opens quote modal for creator to submit bid
3. Creator submits quote: `POST /api/quotes`
   - Creates QuoteOffer record linked to QuoteRequest
   - Client can accept/reject the offer later

### Context Architecture
**Three main React contexts manage app state:**
1. **AuthContext** (`src/context/AuthContext.tsx`)
   - User authentication state (token, user profile)
   - Login/logout/register functions
   - Persists token to expo-secure-store

2. **SwipeContext** (`src/context/SwipeContext.tsx`)
   - Projects feed for swiping
   - Current card index
   - Like/pass actions

3. **MessagesContext** (`src/context/MessagesContext.tsx`)
   - Conversations list
   - Unread message count
   - Socket.io connection management

### Navigation Structure
Bottom tabs (for creators):
- **Discover**: SwipeScreen (main swipe interface)
- **Matches**: MatchesScreen → nested tabs:
  - Proposals: Sent quotes awaiting response
  - Messages: Chat conversations
- **Profile**: ProfileScreen

Stack navigation for modals:
- QuoteModalScreen (submit quote after liking)
- ProjectDetailsModal (view project details)
- ChatScreen (individual conversation)

## Development Guidelines

### API Service Pattern
All API calls go through `src/services/apiService.ts`, which:
- Automatically includes JWT token from SecureStore
- Handles token refresh on 401 errors
- Provides typed request/response interfaces

### Socket.io Events
**Client emits:**
- `join_conversation` - Join conversation room
- `send_message` - Send new message
- `typing` / `stop_typing` - Typing indicators

**Client listens for:**
- `new_message` - Incoming message
- `user_typing` / `user_stop_typing` - Other user typing

### Backend Middleware
- `authenticate()` - Validates JWT, sets req.userId
- `requireCreator()` - Ensures user has Seller profile
- `requireClient()` - Ensures user is a client (not creator)

### Environment Variables
**Backend** (`backend/.env`):
```
DATABASE_URL="prisma://accelerate.prisma-data.net/..."
JWT_SECRET="your-secret-key"
PORT=3000
```

**Frontend**: API URL configured in `src/services/apiService.ts`
- Development: Uses local IP or localhost
- Production: Update BASE_URL to deployed backend

## Testing Strategy

### Running the App
1. Start backend: `npm run backend` (terminal 1)
2. Start Expo: `npm start` (terminal 2)
3. Scan QR code with Expo Go app (iOS/Android)

### Test Credentials
Check `backend/prisma/seed.ts` for seeded test users

### Database Inspection
- Use Prisma Studio: `cd backend && npx prisma studio`
- Inspect QuoteRequest (projects), QuoteOffer (quotes), ProjectLike (matches)

## Common Patterns

### Making API Calls
```typescript
import apiService from '../services/apiService';

// Authenticated request (token added automatically)
const projects = await apiService.get<Project[]>('/api/projects/available');

// POST with data
await apiService.post('/api/quotes', {
  quoteRequestId: projectId,
  price: 50000,
  deliveryTime: 7,
  description: "..."
});
```

### Socket.io Usage
```typescript
import { socketService } from '../services/socketService';

// Connect on mount
socketService.connect(token);

// Join conversation
socketService.joinConversation(conversationId);

// Listen for messages
socketService.on('new_message', handleNewMessage);

// Send message
socketService.sendMessage(conversationId, messageData);

// Cleanup
socketService.off('new_message', handleNewMessage);
```

### Adding New API Routes
1. Create route file in `backend/src/routes/`
2. Import in `backend/src/server.ts`
3. Add route: `app.use('/api/your-route', yourRoutes)`
4. Use `authenticate()` middleware for protected routes
5. Update TypeScript types in `src/types/index.ts`

### Database Schema Changes
**Always use Prisma push workflow:**
1. Edit `backend/prisma/schema.prisma`
2. Run `cd backend && npx prisma db push`
3. Run `npx prisma generate` to update Prisma Client
4. Update TypeScript types if needed
5. **Never use migrations** - this project uses push-based workflow

## Important Notes

- **Monorepo**: Frontend (root) and backend (subdirectory) share dependencies
- **Prisma Accelerate**: Database uses connection pooling, queries are cached
- **Mobile-first**: Primary target is iOS/Android via Expo
- **File uploads**: Images/audio stored locally in `backend/uploads/` (not cloud storage yet)
- **JWT expiry**: Tokens expire after 7 days
- **CORS**: Backend accepts all origins in development (`origin: '*'`)
- **Port conflicts**: Backend runs on 3000, Expo Metro on 8081
