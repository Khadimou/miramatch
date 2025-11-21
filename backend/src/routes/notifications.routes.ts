import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notification.service';

const router = Router();

// Récupérer toutes les notifications non lues d'un utilisateur
router.get('/unread', authenticate, async (req: AuthRequest, res) => {
  try {
    const notifications = await notificationService.getUnreadNotifications(req.userId!);
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Get unread notifications error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
  }
});

// Marquer une notification comme lue
router.patch('/:notificationId/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const { notificationId } = req.params;
    await notificationService.markAsRead(notificationId);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({ error: 'Erreur lors du marquage de la notification' });
  }
});

// Marquer toutes les notifications comme lues
router.patch('/read-all', authenticate, async (req: AuthRequest, res) => {
  try {
    await notificationService.markAllAsRead(req.userId!);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return res.status(500).json({ error: 'Erreur lors du marquage des notifications' });
  }
});

export default router;
