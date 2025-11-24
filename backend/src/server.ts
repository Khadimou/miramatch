import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';

// Charger les variables d'environnement
dotenv.config();

// Importer les routes
import authRoutes from './routes/auth.routes';
import projectsRoutes from './routes/projects.routes';
import quotesRoutes from './routes/quotes.routes';
import conversationsRoutes from './routes/conversations.routes';
import uploadRoutes from './routes/upload.routes';
import notificationsRoutes from './routes/notifications.routes';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Accepter toutes les origines en développement
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: '*', // Accepter toutes les origines en développement
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(uploadsDir));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationsRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MIRA MATCH API is running' });
});

// Gestion des erreurs
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Une erreur interne est survenue',
  });
});

// Socket.io pour le chat en temps réel
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Rejoindre une conversation
  socket.on('join_conversation', (data: { conversationId: string }) => {
    socket.join(data.conversationId);
    console.log(`Socket ${socket.id} joined conversation ${data.conversationId}`);
  });

  // Quitter une conversation
  socket.on('leave_conversation', (data: { conversationId: string }) => {
    socket.leave(data.conversationId);
    console.log(`Socket ${socket.id} left conversation ${data.conversationId}`);
  });

  // Envoyer un message
  socket.on('send_message', (data: { conversationId: string; message: any }) => {
    io.to(data.conversationId).emit('new_message', data.message);
  });

  // Typage en cours
  socket.on('typing_start', (data: { conversationId: string }) => {
    socket.to(data.conversationId).emit('user_typing', data);
  });

  socket.on('typing_stop', (data: { conversationId: string }) => {
    socket.to(data.conversationId).emit('user_typing_stopped', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0'; // Écouter sur toutes les interfaces réseau

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`📡 API also available at http://172.17.12.55:${PORT}/api (for mobile)`);
  console.log(`💬 Socket.IO available at http://localhost:${PORT}`);
});

export { io };

