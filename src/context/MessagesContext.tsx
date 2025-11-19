import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, Message } from '../types';
import { apiService } from '../services/apiService';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

// Mode développement : utiliser les mock data au lieu du backend
const USE_MOCK_DATA = true; // Mettre à false quand le backend sera prêt

interface MessagesContextType {
  conversations: Conversation[];
  isLoading: boolean;
  loadConversations: () => Promise<void>;
  getConversation: (conversationId: string) => Conversation | undefined;
  getTotalUnreadCount: () => number;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, creator } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les conversations au montage
  useEffect(() => {
    if (!USE_MOCK_DATA && isAuthenticated) {
      loadConversations();
    } else {
      // Mode mock : pas de conversations
      setConversations([]);
    }
  }, [isAuthenticated]);

  // Écouter les nouveaux messages via socket
  useEffect(() => {
    if (USE_MOCK_DATA || !isAuthenticated || !socketService.isConnected()) return;

    const unsubscribe = socketService.onNewMessage((message: Message) => {
      updateConversationWithNewMessage(message);
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated]);

  const loadConversations = async () => {
    // Mode mock : ne rien faire
    if (USE_MOCK_DATA) {
      setConversations([]);
      return;
    }

    // Mode production : charger depuis l'API
    try {
      setIsLoading(true);
      const data = await apiService.getMyConversations();
      setConversations(data);
    } catch (error) {
      console.error('Load conversations error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConversationWithNewMessage = (message: Message) => {
    setConversations((prev) => {
      const index = prev.findIndex((c) => c.id === message.conversationId);
      if (index === -1) {
        // Nouvelle conversation, recharger la liste
        loadConversations();
        return prev;
      }

      const updated = [...prev];
      const conversation = { ...updated[index] };

      // Mettre à jour le dernier message
      conversation.lastMessage = message;
      conversation.updatedAt = message.createdAt;

      // Incrémenter le compteur de non-lus si le message n'est pas de nous
      if (message.senderType !== 'creator' && !message.isRead) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      }

      updated[index] = conversation;

      // Trier par date de mise à jour (plus récent en premier)
      updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      return updated;
    });
  };

  const getConversation = (conversationId: string): Conversation | undefined => {
    return conversations.find((c) => c.id === conversationId);
  };

  const getTotalUnreadCount = (): number => {
    return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
  };

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        isLoading,
        loadConversations,
        getConversation,
        getTotalUnreadCount,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within MessagesProvider');
  }
  return context;
};
