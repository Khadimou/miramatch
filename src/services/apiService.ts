import { authService } from './authService';
import { Project, Quote, Conversation, Message, UserNotification } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiService = {
  /**
   * PROJETS
   */
  async getAvailableProjects(): Promise<Project[]> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/projects/available`, {
        headers,
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des projets');

      return await response.json();
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  },

  async getProjectById(projectId: string): Promise<Project> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        headers,
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération du projet');

      return await response.json();
    } catch (error) {
      console.error('Get project error:', error);
      throw error;
    }
  },

  async likeProject(projectId: string): Promise<void> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/projects/${projectId}/like`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) throw new Error('Erreur lors du like');
    } catch (error) {
      console.error('Like project error:', error);
      throw error;
    }
  },

  async passProject(projectId: string): Promise<void> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/projects/${projectId}/pass`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) throw new Error('Erreur lors du pass');
    } catch (error) {
      console.error('Pass project error:', error);
      throw error;
    }
  },

  /**
   * DEVIS (QUOTES)
   */
  async submitQuote(quoteData: Omit<Quote, 'id' | 'createdAt' | 'status'>): Promise<Quote> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/quotes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'envoi du devis');

      return await response.json();
    } catch (error) {
      console.error('Submit quote error:', error);
      throw error;
    }
  },

  async updateQuote(quoteId: string, updates: Partial<Quote>): Promise<Quote> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/quotes/${quoteId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du devis');

      return await response.json();
    } catch (error) {
      console.error('Update quote error:', error);
      throw error;
    }
  },

  async getMyQuotes(): Promise<Quote[]> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/quotes/my-quotes`, {
        headers,
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des devis');

      return await response.json();
    } catch (error) {
      console.error('Get quotes error:', error);
      throw error;
    }
  },

  async getQuoteById(quoteId: string): Promise<Quote> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/quotes/${quoteId}`, {
        headers,
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération du devis');

      return await response.json();
    } catch (error) {
      console.error('Get quote error:', error);
      throw error;
    }
  },

  async deleteQuote(quoteId: string): Promise<void> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/quotes/${quoteId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        console.error('Delete quote failed - Status:', response.status);
        console.error('Delete quote failed - Error:', errorData);
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Delete quote error:', error);
      throw error;
    }
  },

  /**
   * CONVERSATIONS & MESSAGES
   */
  async getMyConversations(): Promise<Conversation[]> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/conversations`, {
        headers,
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des conversations');

      return await response.json();
    } catch (error) {
      console.error('Get conversations error:', error);
      throw error;
    }
  },

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
        headers,
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des messages');

      return await response.json();
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  },

  async sendMessage(conversationId: string, message: Omit<Message, 'id' | 'createdAt' | 'isRead'>): Promise<Message> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(message),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'envoi du message');

      return await response.json();
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
        method: 'PATCH',
        headers,
      });

      if (!response.ok) throw new Error('Erreur lors du marquage du message');
    } catch (error) {
      console.error('Mark read error:', error);
      throw error;
    }
  },

  /**
   * UPLOAD D'IMAGES
   */
  async uploadImage(uri: string, type: 'quote' | 'profile' | 'portfolio'): Promise<string> {
    try {
      const headers = await authService.getAuthHeaders();

      // Créer un FormData pour l'upload
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri,
        name: filename,
        type: fileType,
      } as any);
      formData.append('type', type);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Erreur lors de l\'upload');

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload image error:', error);
      throw error;
    }
  },

  /**
   * UPLOAD D'AUDIO
   */
  async uploadAudio(uri: string): Promise<{ url: string; duration: number }> {
    try {
      const headers = await authService.getAuthHeaders();

      const formData = new FormData();
      const filename = uri.split('/').pop() || 'audio.m4a';

      formData.append('audio', {
        uri,
        name: filename,
        type: 'audio/m4a',
      } as any);

      const response = await fetch(`${API_URL}/upload/audio`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Erreur lors de l\'upload audio');

      return await response.json();
    } catch (error) {
      console.error('Upload audio error:', error);
      throw error;
    }
  },

  /**
   * NOTIFICATIONS
   */
  async getUnreadNotifications(): Promise<UserNotification[]> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/notifications/unread`, {
        headers,
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des notifications');

      return await response.json();
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers,
      });

      if (!response.ok) throw new Error('Erreur lors du marquage de la notification');
    } catch (error) {
      console.error('Mark notification read error:', error);
      throw error;
    }
  },

  async markAllNotificationsAsRead(): Promise<void> {
    try {
      const headers = await authService.getAuthHeaders();
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers,
      });

      if (!response.ok) throw new Error('Erreur lors du marquage des notifications');
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      throw error;
    }
  },
};
