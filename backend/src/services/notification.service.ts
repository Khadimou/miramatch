import prisma from '../config/database';

const MIRA_API_URL = process.env.MIRA_API_URL || 'https://mira.159.69.221.252.nip.io/api/v2';

export interface NotificationData {
  type: 'new_quote_offer' | 'quote_accepted' | 'quote_rejected' | 'quote_updated' | 'new_message';
  title: string;
  message: string;
  data?: any;
}

/**
 * Service de notification pour MIRA MATCH
 * Gère les notifications push via l'API Mira et les notifications en base de données
 */
export const notificationService = {
  /**
   * Envoyer une notification push via l'API Mira
   */
  async sendPushNotification(
    userId: string,
    sellerId: string,
    quoteId: string,
    price: number,
    currency: string,
    deliveryTime: number,
    description: string
  ): Promise<boolean> {
    try {
      console.log('[Notification] Sending push notification to user:', userId);
      console.log('[Notification] Quote ID:', quoteId);

      const url = `${MIRA_API_URL}/quotes/${quoteId}/offers`;

      const payload = {
        seller_id: sellerId,
        price: price,
        delivery_time: deliveryTime,
        description: description,
        currency: currency,
      };

      console.log('[Notification] Payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Notification] API Mira error:', response.status, errorText);
        // Ne pas bloquer si l'API Mira échoue
        return false;
      }

      console.log('[Notification] Push notification sent successfully');
      return true;
    } catch (error) {
      console.error('[Notification] Error sending push notification:', error);
      // Ne pas bloquer si l'API Mira échoue
      return false;
    }
  },

  /**
   * Créer une notification en base de données (UserNotification)
   */
  async createUserNotification(
    userId: string,
    notificationData: NotificationData
  ): Promise<void> {
    try {
      console.log('[Notification] Creating user notification in DB for user:', userId);

      await prisma.userNotification.create({
        data: {
          userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || {},
          isRead: false,
        },
      });

      console.log('[Notification] User notification created successfully');
    } catch (error) {
      console.error('[Notification] Error creating user notification:', error);
      throw error;
    }
  },

  /**
   * Envoyer une notification complète (push + DB)
   */
  async notifyNewQuoteOffer(
    userId: string,
    sellerId: string,
    quoteId: string,
    quoteOfferId: string,
    sellerName: string,
    projectName: string,
    price: number,
    currency: string,
    deliveryTime: number,
    description: string
  ): Promise<void> {
    try {
      const notificationData: NotificationData = {
        type: 'new_quote_offer',
        title: '🎉 Nouvelle proposition reçue !',
        message: `${sellerName} a envoyé une proposition de ${price} ${currency} pour "${projectName}"`,
        data: {
          quoteId,
          quoteOfferId,
          projectName,
          sellerName,
          price,
          currency,
        },
      };

      // Créer la notification en base de données
      await this.createUserNotification(userId, notificationData);

      // Envoyer la notification push via API Mira (non bloquant)
      await this.sendPushNotification(
        userId,
        sellerId,
        quoteId,
        price,
        currency,
        deliveryTime,
        description
      );

      console.log('[Notification] Complete notification sent for new quote offer');
    } catch (error) {
      console.error('[Notification] Error in notifyNewQuoteOffer:', error);
      // Ne pas bloquer la création du devis si la notification échoue
    }
  },

  /**
   * Notifier la modification d'une offre
   */
  async notifyQuoteUpdated(
    userId: string,
    sellerName: string,
    projectName: string,
    price: number,
    currency: string,
    deliveryTime: number,
    quoteOfferId: string
  ): Promise<void> {
    try {
      const notificationData: NotificationData = {
        type: 'quote_updated',
        title: '🔄 Proposition modifiée',
        message: `${sellerName} a modifié sa proposition pour "${projectName}" - ${price} ${currency}, ${deliveryTime} jours`,
        data: {
          quoteOfferId,
          projectName,
          sellerName,
          price,
          currency,
          deliveryTime,
        },
      };

      // Créer la notification en base de données pour le client
      await this.createUserNotification(userId, notificationData);

      console.log('[Notification] Quote updated notification sent to client');
    } catch (error) {
      console.error('[Notification] Error in notifyQuoteUpdated:', error);
      // Ne pas bloquer la modification du devis si la notification échoue
    }
  },

  /**
   * Notifier l'acceptation d'une offre
   */
  async notifyQuoteAccepted(
    sellerId: string,
    quoteId: string,
    projectName: string,
    clientName: string
  ): Promise<void> {
    try {
      const notificationData: NotificationData = {
        type: 'quote_accepted',
        title: '✅ Offre acceptée !',
        message: `${clientName} a accepté votre proposition pour "${projectName}"`,
        data: {
          quoteId,
          projectName,
          clientName,
        },
      };

      // Pour le seller, on utilise le modèle Notification (pas UserNotification)
      await prisma.notification.create({
        data: {
          sellerId,
          type: 'QUOTE_OFFER',
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data,
          isRead: false,
        },
      });

      console.log('[Notification] Quote accepted notification sent to seller');
    } catch (error) {
      console.error('[Notification] Error in notifyQuoteAccepted:', error);
    }
  },

  /**
   * Récupérer les notifications non lues d'un utilisateur
   */
  async getUnreadNotifications(userId: string): Promise<any[]> {
    try {
      const notifications = await prisma.userNotification.findMany({
        where: {
          userId,
          isRead: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return notifications;
    } catch (error) {
      console.error('[Notification] Error getting unread notifications:', error);
      return [];
    }
  },

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await prisma.userNotification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      console.log('[Notification] Notification marked as read:', notificationId);
    } catch (error) {
      console.error('[Notification] Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Marquer toutes les notifications d'un utilisateur comme lues
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.userNotification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      console.log('[Notification] All notifications marked as read for user:', userId);
    } catch (error) {
      console.error('[Notification] Error marking all as read:', error);
      throw error;
    }
  },
};
