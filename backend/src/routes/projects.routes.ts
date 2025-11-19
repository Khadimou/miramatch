import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest, requireCreator, requireClient } from '../middleware/auth';

const router = Router();

// Obtenir les projets disponibles pour les créateurs
router.get('/available', authenticate, requireCreator, async (req: AuthRequest, res) => {
  try {
    const quoteRequests = await prisma.quoteRequest.findMany({
      where: {
        status: 'open',
        scope: 'BROADCAST', // Projets publics
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
            sellerId: req.userId,
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

    // Vérifier que le projet existe
    const project = await prisma.quoteRequest.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // On pourrait créer une table Match ou simplement marquer l'intérêt
    // Pour l'instant, on pourrait créer une offre vide ou juste confirmer
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Like project error:', error);
    return res.status(500).json({ error: 'Erreur lors du like' });
  }
});

// Passer un projet
router.post('/:projectId/pass', authenticate, requireCreator, async (req: AuthRequest, res) => {
  try {
    // Pour l'instant, on confirme juste l'action
    // On pourrait stocker les projets passés pour ne plus les montrer
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Pass project error:', error);
    return res.status(500).json({ error: 'Erreur lors du pass' });
  }
});

export default router;

