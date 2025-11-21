import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest, requireCreator } from '../middleware/auth';
import { notificationService } from '../services/notification.service';

const router = Router();

// Soumettre un devis (Quote)
router.post('/', authenticate, requireCreator, async (req: AuthRequest, res) => {
  try {
    const {
      projectId,
      price,
      currency,
      deliveryTime,
      message,
      detailedProposal,
      attachments,
    } = req.body;

    // Récupérer le seller associé à l'utilisateur
    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Profil créateur non trouvé' });
    }

    // Récupérer le projet pour obtenir l'ID du client
    const quoteRequest = await prisma.quoteRequest.findUnique({
      where: { id: projectId },
    });

    if (!quoteRequest) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // Créer l'offre de devis
    const quoteOffer = await prisma.quoteOffer.create({
      data: {
        quoteRequestId: projectId,
        sellerId: seller.id,
        price,
        currency: currency || 'XOF',
        deliveryTime: parseInt(deliveryTime) || 14,
        description: message,
        proposal: detailedProposal,
        attachments: attachments ? JSON.stringify(attachments) : null,
        status: 'PENDING',
      },
    });

    // Créer ou récupérer la conversation entre le créateur et le client
    let conversation = await prisma.conversation.findFirst({
      where: {
        userId: quoteRequest.userId,
        sellerId: seller.id,
        productId: null, // Pour MIRA MATCH, on n'utilise pas productId car c'est pour QuoteRequest
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: quoteRequest.userId,
          sellerId: seller.id,
          subject: `Devis pour ${quoteRequest.productName || 'votre projet'}`,
          lastMessageAt: new Date(),
        },
      });

      // Envoyer un message automatique dans la conversation
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: seller.id,
          senderType: 'creator',
          content: `Bonjour ! Je vous ai envoyé un devis pour votre projet "${quoteRequest.productName || 'personnalisé'}". N'hésitez pas à me contacter si vous avez des questions.`,
          type: 'text',
          isRead: false,
        },
      });
    }

    // Récupérer les informations du vendeur pour la notification
    const sellerUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true },
    });

    // Envoyer les notifications au client (push + DB)
    try {
      await notificationService.notifyNewQuoteOffer(
        quoteRequest.userId,
        seller.id,
        quoteRequest.id,
        quoteOffer.id,
        sellerUser?.name || 'Un créateur',
        quoteRequest.productName || 'votre projet',
        quoteOffer.price,
        quoteOffer.currency,
        quoteOffer.deliveryTime,
        quoteOffer.description
      );
    } catch (notifError) {
      console.error('[Quote] Notification error (non-blocking):', notifError);
      // Ne pas bloquer la création du devis si la notification échoue
    }

    // Transformer en format Quote de MIRA MATCH
    const quote = {
      id: quoteOffer.id,
      projectId: quoteOffer.quoteRequestId,
      creatorId: seller.userId,
      price: quoteOffer.price,
      currency: quoteOffer.currency,
      deliveryTime: `${quoteOffer.deliveryTime} jours`,
      deliveryDays: quoteOffer.deliveryTime,
      message: quoteOffer.description,
      detailedProposal: quoteOffer.proposal,
      attachments: quoteOffer.attachments ? JSON.parse(quoteOffer.attachments) : [],
      status: quoteOffer.status.toLowerCase(),
      createdAt: quoteOffer.createdAt.toISOString(),
      updatedAt: quoteOffer.updatedAt.toISOString(),
    };

    return res.status(201).json(quote);
  } catch (error) {
    console.error('Submit quote error:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi du devis' });
  }
});

// Mettre à jour un devis
router.patch('/:quoteId', authenticate, requireCreator, async (req: AuthRequest, res) => {
  try {
    const { quoteId } = req.params;
    const updates = req.body;

    // Vérifier que le devis appartient bien au créateur
    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Profil créateur non trouvé' });
    }

    const existingQuote = await prisma.quoteOffer.findUnique({
      where: { id: quoteId },
      include: {
        quoteRequest: true, // Inclure le projet pour la notification
      },
    });

    if (!existingQuote || existingQuote.sellerId !== seller.id) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    // Mettre à jour
    const updatedQuote = await prisma.quoteOffer.update({
      where: { id: quoteId },
      data: {
        price: updates.price,
        deliveryTime: updates.deliveryTime ? parseInt(updates.deliveryTime) : undefined,
        description: updates.message,
        proposal: updates.detailedProposal,
        attachments: updates.attachments ? JSON.stringify(updates.attachments) : undefined,
      },
    });

    // Envoyer une notification au client pour l'informer de la modification
    try {
      const sellerUser = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { name: true },
      });

      await notificationService.notifyQuoteUpdated(
        existingQuote.quoteRequest.userId,
        sellerUser?.name || 'Un créateur',
        existingQuote.quoteRequest.productName || 'votre projet',
        updatedQuote.price,
        updatedQuote.currency,
        updatedQuote.deliveryTime,
        updatedQuote.id
      );
    } catch (notifError) {
      console.error('[Quote Update] Notification error (non-blocking):', notifError);
      // Ne pas bloquer la modification du devis si la notification échoue
    }

    const quote = {
      id: updatedQuote.id,
      projectId: updatedQuote.quoteRequestId,
      creatorId: seller.userId,
      price: updatedQuote.price,
      currency: updatedQuote.currency,
      deliveryTime: `${updatedQuote.deliveryTime} jours`,
      deliveryDays: updatedQuote.deliveryTime,
      message: updatedQuote.description,
      detailedProposal: updatedQuote.proposal,
      attachments: updatedQuote.attachments ? JSON.parse(updatedQuote.attachments) : [],
      status: updatedQuote.status.toLowerCase(),
      createdAt: updatedQuote.createdAt.toISOString(),
      updatedAt: updatedQuote.updatedAt.toISOString(),
    };

    return res.status(200).json(quote);
  } catch (error) {
    console.error('Update quote error:', error);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour du devis' });
  }
});

// Obtenir mes devis
router.get('/my-quotes', authenticate, requireCreator, async (req: AuthRequest, res) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Profil créateur non trouvé' });
    }

    const quoteOffers = await prisma.quoteOffer.findMany({
      where: {
        sellerId: seller.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const quotes = quoteOffers.map((qo) => ({
      id: qo.id,
      projectId: qo.quoteRequestId,
      creatorId: seller.userId,
      price: qo.price,
      currency: qo.currency,
      deliveryTime: `${qo.deliveryTime} jours`,
      deliveryDays: qo.deliveryTime,
      message: qo.description,
      detailedProposal: qo.proposal,
      attachments: qo.attachments ? JSON.parse(qo.attachments) : [],
      status: qo.status.toLowerCase(),
      createdAt: qo.createdAt.toISOString(),
      updatedAt: qo.updatedAt.toISOString(),
    }));

    return res.status(200).json(quotes);
  } catch (error) {
    console.error('Get quotes error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des devis' });
  }
});

// Obtenir un devis spécifique
router.get('/:quoteId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { quoteId } = req.params;

    const quoteOffer = await prisma.quoteOffer.findUnique({
      where: { id: quoteId },
      include: {
        seller: {
          include: {
            User: true,
          },
        },
      },
    });

    if (!quoteOffer) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    const quote = {
      id: quoteOffer.id,
      projectId: quoteOffer.quoteRequestId,
      creatorId: quoteOffer.seller.userId,
      price: quoteOffer.price,
      currency: quoteOffer.currency,
      deliveryTime: `${quoteOffer.deliveryTime} jours`,
      deliveryDays: quoteOffer.deliveryTime,
      message: quoteOffer.description,
      detailedProposal: quoteOffer.proposal,
      attachments: quoteOffer.attachments ? JSON.parse(quoteOffer.attachments) : [],
      status: quoteOffer.status.toLowerCase(),
      createdAt: quoteOffer.createdAt.toISOString(),
      updatedAt: quoteOffer.updatedAt.toISOString(),
    };

    return res.status(200).json(quote);
  } catch (error) {
    console.error('Get quote error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération du devis' });
  }
});

// Supprimer un devis
router.delete('/:quoteId', authenticate, requireCreator, async (req: AuthRequest, res) => {
  try {
    const { quoteId } = req.params;
    console.log('[DELETE Quote] Request from user:', req.userId, 'for quoteId:', quoteId);

    // Vérifier que le devis appartient bien au créateur
    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      console.log('[DELETE Quote] Seller not found for userId:', req.userId);
      return res.status(404).json({ error: 'Profil créateur non trouvé' });
    }

    console.log('[DELETE Quote] Seller found:', seller.id);

    const existingQuote = await prisma.quoteOffer.findUnique({
      where: { id: quoteId },
    });

    if (!existingQuote) {
      console.log('[DELETE Quote] Quote not found:', quoteId);
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    if (existingQuote.sellerId !== seller.id) {
      console.log('[DELETE Quote] Quote does not belong to seller. Quote sellerId:', existingQuote.sellerId, 'User sellerId:', seller.id);
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer ce devis' });
    }

    console.log('[DELETE Quote] Deleting quote:', quoteId);

    // Supprimer le devis
    await prisma.quoteOffer.delete({
      where: { id: quoteId },
    });

    console.log('[DELETE Quote] Quote deleted successfully:', quoteId);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[DELETE Quote] Error:', error);
    console.error('[DELETE Quote] Error details:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ error: 'Erreur lors de la suppression du devis' });
  }
});

export default router;

