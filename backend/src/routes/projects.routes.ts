import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest, requireCreator, requireClient } from '../middleware/auth';

const router = Router();

// Obtenir les projets disponibles pour les créateurs
router.get('/available', authenticate, requireCreator, async (req: AuthRequest, res) => {
  try {
    // Récupérer le seller associé à l'utilisateur
    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Profil créateur non trouvé' });
    }

    // Récupérer les IDs des projets déjà likés ou passés par ce créateur
    const likedProjectIds = await prisma.projectLike.findMany({
      where: { sellerId: seller.id },
      select: { quoteRequestId: true },
    });

    const passedProjectIds = await prisma.projectPass.findMany({
      where: { sellerId: seller.id },
      select: { quoteRequestId: true },
    });

    const excludedIds = [
      ...likedProjectIds.map((p) => p.quoteRequestId),
      ...passedProjectIds.map((p) => p.quoteRequestId),
    ];

    const quoteRequests = await prisma.quoteRequest.findMany({
      where: {
        status: 'open',
        scope: 'BROADCAST', // Projets publics
        id: {
          notIn: excludedIds, // Exclure les projets déjà likés ou passés
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        offers: {
          where: {
            sellerId: seller.id,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transformer en format Project de MIRA MATCH
    const projects = quoteRequests.map((qr) => ({
      id: qr.id,
      title: qr.productName || 'Projet personnalisé',
      productName: qr.productName || '',
      description: qr.description || '',
      requirements: qr.requirements,
      category: 'Vêtement sur mesure' as const,
      designType: qr.designType || '',
      budget: {
        min: qr.basePrice ? qr.basePrice * 0.8 : 0,
        max: qr.basePrice ? qr.basePrice * 1.2 : 0,
        currency: qr.budgetCurrency || 'XOF',
      },
      basePrice: qr.basePrice,
      deadline: qr.deadline?.toISOString(),
      images: qr.customImageUrl ? [qr.customImageUrl] : [],
      customImageUrl: qr.customImageUrl,
      client: {
        id: qr.user.id,
        name: qr.user.name || 'Client',
        profileImage: qr.user.image,
      },
      specifications: qr.customizationOptions,
      materials: [],
      measurements: qr.measurements as any,
      createdAt: qr.createdAt.toISOString(),
      location: '',
      city: '',
      status: qr.status as 'open' | 'in_progress' | 'completed',
    }));

    return res.status(200).json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
  }
});

// Obtenir les projets matchés (likés) - DOIT ÊTRE AVANT /:projectId
router.get('/matches', authenticate, requireCreator, async (req: AuthRequest, res) => {
  try {
    // Récupérer le seller associé à l'utilisateur
    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Profil créateur non trouvé' });
    }

    // Récupérer les projets likés avec leurs détails
    const likes = await prisma.projectLike.findMany({
      where: { sellerId: seller.id },
      include: {
        quoteRequest: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            offers: {
              where: {
                sellerId: seller.id,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transformer en format Match de MIRA MATCH
    const matches = likes.map((like) => ({
      id: like.id,
      projectId: like.quoteRequest.id,
      creatorId: req.userId,
      createdAt: like.createdAt.toISOString(),
      hasQuote: like.quoteRequest.offers.length > 0,
      project: {
        id: like.quoteRequest.id,
        title: like.quoteRequest.productName || 'Projet personnalisé',
        productName: like.quoteRequest.productName || '',
        description: like.quoteRequest.description || '',
        requirements: like.quoteRequest.requirements,
        category: 'Vêtement sur mesure' as const,
        designType: like.quoteRequest.designType || '',
        budget: {
          min: like.quoteRequest.basePrice ? like.quoteRequest.basePrice * 0.8 : 0,
          max: like.quoteRequest.basePrice ? like.quoteRequest.basePrice * 1.2 : 0,
          currency: like.quoteRequest.budgetCurrency || 'XOF',
        },
        basePrice: like.quoteRequest.basePrice,
        deadline: like.quoteRequest.deadline?.toISOString(),
        images: like.quoteRequest.customImageUrl ? [like.quoteRequest.customImageUrl] : [],
        customImageUrl: like.quoteRequest.customImageUrl,
        client: {
          id: like.quoteRequest.user.id,
          name: like.quoteRequest.user.name || 'Client',
          profileImage: like.quoteRequest.user.image,
        },
        specifications: like.quoteRequest.customizationOptions,
        materials: [],
        measurements: like.quoteRequest.measurements as any,
        createdAt: like.quoteRequest.createdAt.toISOString(),
        location: '',
        city: '',
        status: like.quoteRequest.status as 'open' | 'in_progress' | 'completed',
      },
    }));

    return res.status(200).json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des matches' });
  }
});

// Obtenir un projet spécifique
router.get('/:projectId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    const quoteRequest = await prisma.quoteRequest.findUnique({
      where: { id: projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!quoteRequest) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const project = {
      id: quoteRequest.id,
      title: quoteRequest.productName || 'Projet personnalisé',
      productName: quoteRequest.productName || '',
      description: quoteRequest.description || '',
      requirements: quoteRequest.requirements,
      category: 'Vêtement sur mesure' as const,
      designType: quoteRequest.designType || '',
      budget: {
        min: quoteRequest.basePrice ? quoteRequest.basePrice * 0.8 : 0,
        max: quoteRequest.basePrice ? quoteRequest.basePrice * 1.2 : 0,
        currency: quoteRequest.budgetCurrency || 'XOF',
      },
      basePrice: quoteRequest.basePrice,
      deadline: quoteRequest.deadline?.toISOString(),
      images: quoteRequest.customImageUrl ? [quoteRequest.customImageUrl] : [],
      customImageUrl: quoteRequest.customImageUrl,
      client: {
        id: quoteRequest.user.id,
        name: quoteRequest.user.name || 'Client',
        profileImage: quoteRequest.user.image,
      },
      specifications: quoteRequest.customizationOptions,
      materials: [],
      measurements: quoteRequest.measurements as any,
      createdAt: quoteRequest.createdAt.toISOString(),
      location: '',
      city: '',
      status: quoteRequest.status as 'open' | 'in_progress' | 'completed',
    };

    return res.status(200).json(project);
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération du projet' });
  }
});

// Liker un projet (créer un match)
router.post('/:projectId/like', authenticate, requireCreator, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    // Récupérer le seller associé à l'utilisateur
    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Profil créateur non trouvé' });
    }

    // Vérifier que le projet existe
    const project = await prisma.quoteRequest.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // Créer le like (match)
    const like = await prisma.projectLike.create({
      data: {
        sellerId: seller.id,
        quoteRequestId: projectId,
      },
    });

    return res.status(201).json({
      id: like.id,
      projectId: like.quoteRequestId,
      creatorId: req.userId,
      createdAt: like.createdAt.toISOString(),
      hasQuote: false,
    });
  } catch (error) {
    console.error('Like project error:', error);
    // Vérifier si c'est une erreur de doublon (unique constraint)
    if ((error as any).code === 'P2002') {
      return res.status(409).json({ error: 'Projet déjà liké' });
    }
    return res.status(500).json({ error: 'Erreur lors du like' });
  }
});

// Passer un projet
router.post('/:projectId/pass', authenticate, requireCreator, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    // Récupérer le seller associé à l'utilisateur
    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Profil créateur non trouvé' });
    }

    // Vérifier que le projet existe
    const project = await prisma.quoteRequest.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // Créer le pass
    await prisma.projectPass.create({
      data: {
        sellerId: seller.id,
        quoteRequestId: projectId,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Pass project error:', error);
    // Vérifier si c'est une erreur de doublon (unique constraint)
    if ((error as any).code === 'P2002') {
      return res.status(409).json({ error: 'Projet déjà passé' });
    }
    return res.status(500).json({ error: 'Erreur lors du pass' });
  }
});

export default router;

