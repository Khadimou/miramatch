import { io, Socket } from 'socket.io-client';
import { Message } from '../types';
import { authService } from './authService';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Connexion au serveur Socket.io
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('No auth token available');
      }

      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.setupDefaultListeners();

      return new Promise((resolve, reject) => {
        if (!this.socket) return reject(new Error('Socket not initialized'));

        this.socket.on('connect', () => {
          console.log('Socket connected:', this.socket?.id);
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Socket connect error:', error);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('Socket disconnected');
    }
  }

  /**
   * Configuration des listeners par défaut
   */
  private setupDefaultListeners(): void {
    if (!this.socket) return;

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    });
  }

  /**
   * Rejoindre une conversation
   */
  joinConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('join_conversation', { conversationId });
    console.log('Joined conversation:', conversationId);
  }

  /**
   * Quitter une conversation
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('leave_conversation', { conversationId });
    console.log('Left conversation:', conversationId);
  }

  /**
   * Envoyer un message
   */
  sendMessage(conversationId: string, message: Partial<Message>): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('send_message', {
      conversationId,
      ...message,
    });
  }

  /**
   * Indiquer que l'utilisateur est en train d'écrire
   */
  startTyping(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_start', { conversationId });
  }

  /**
   * Indiquer que l'utilisateur a arrêté d'écrire
   */
  stopTyping(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_stop', { conversationId });
  }

  /**
   * Marquer un message comme lu
   */
  markAsRead(messageId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('message_read', { messageId });
  }

  /**
   * Écouter les nouveaux messages
   */
  onNewMessage(callback: (message: Message) => void): () => void {
    if (!this.socket) return () => {};

    const eventName = 'new_message';
    this.socket.on(eventName, callback);

    // Ajouter à la liste des listeners
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)?.add(callback);

    // Retourner une fonction de nettoyage
    return () => {
      this.socket?.off(eventName, callback);
      this.listeners.get(eventName)?.delete(callback);
    };
  }

  /**
   * Écouter quand quelqu'un écrit
   */
  onTyping(callback: (data: { conversationId: string; userId: string }) => void): () => void {
    if (!this.socket) return () => {};

    const eventName = 'user_typing';
    this.socket.on(eventName, callback);

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)?.add(callback);

    return () => {
      this.socket?.off(eventName, callback);
      this.listeners.get(eventName)?.delete(callback);
    };
  }

  /**
   * Écouter quand quelqu'un arrête d'écrire
   */
  onTypingStopped(callback: (data: { conversationId: string; userId: string }) => void): () => void {
    if (!this.socket) return () => {};

    const eventName = 'user_typing_stopped';
    this.socket.on(eventName, callback);

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)?.add(callback);

    return () => {
      this.socket?.off(eventName, callback);
      this.listeners.get(eventName)?.delete(callback);
    };
  }

  /**
   * Écouter les messages lus
   */
  onMessageRead(callback: (data: { messageId: string; readBy: string }) => void): () => void {
    if (!this.socket) return () => {};

    const eventName = 'message_read';
    this.socket.on(eventName, callback);

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)?.add(callback);

    return () => {
      this.socket?.off(eventName, callback);
      this.listeners.get(eventName)?.delete(callback);
    };
  }

  /**
   * Vérifier si connecté
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Obtenir l'instance socket (pour les cas avancés)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export une instance singleton
export const socketService = new SocketService();
