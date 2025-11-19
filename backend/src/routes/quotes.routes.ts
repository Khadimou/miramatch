import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest, requireCreator } from '../middleware/auth';

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

export default router;

