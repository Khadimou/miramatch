import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Obtenir mes conversations
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    // Déterminer si l'utilisateur est un créateur ou un client
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        seller: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    let conversations;

    if (user.seller) {
      // Créateur : conversations en tant que seller
      conversations = await prisma.conversation.findMany({
        where: {
          sellerId: user.seller.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          lastMessageAt: 'desc',
        },
      });

      // Transformer en format Conversation de MIRA MATCH
      const formattedConversations = await Promise.all(conversations.map(async (conv) => ({
        id: conv.id,
        projectId: conv.productId || '',
        creatorId: conv.sellerId,
        clientId: conv.userId,
        client: {
          id: conv.user.id,
          name: conv.user.name || 'Client',
          profileImage: conv.user.image,
        },
        lastMessage: conv.messages[0] ? {
          id: conv.messages[0].id,
          conversationId: conv.id,
          senderId: conv.messages[0].senderId,
          senderType: conv.messages[0].senderType as 'creator' | 'client',
          content: conv.messages[0].content,
          audioUrl: conv.messages[0].audioUrl,
          audioDuration: conv.messages[0].duration,
          type: conv.messages[0].type as 'text' | 'audio',
          isRead: conv.messages[0].isRead,
          createdAt: conv.messages[0].createdAt.toISOString(),
        } : undefined,
        unreadCount: await prisma.message.count({
          where: {
            conversationId: conv.id,
            isRead: false,
            senderType: 'client',
          },
        }),
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
      })));

      return res.status(200).json(formattedConversations);
    } else {
      // Client : conversations en tant que user
      conversations = await prisma.conversation.findMany({
        where: {
          userId: user.id,
        },
        include: {
          seller: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          lastMessageAt: 'desc',
        },
      });

      const formattedConversations = await Promise.all(conversations.map(async (conv) => ({
        id: conv.id,
        projectId: conv.productId || '',
        creatorId: conv.sellerId,
        clientId: conv.userId,
        client: {
          id: conv.seller.User.id,
          name: conv.seller.User.name || 'Créateur',
          profileImage: conv.seller.User.image,
        },
        lastMessage: conv.messages[0] ? {
          id: conv.messages[0].id,
          conversationId: conv.id,
          senderId: conv.messages[0].senderId,
          senderType: conv.messages[0].senderType as 'creator' | 'client',
          content: conv.messages[0].content,
          audioUrl: conv.messages[0].audioUrl,
          audioDuration: conv.messages[0].duration,
          type: conv.messages[0].type as 'text' | 'audio',
          isRead: conv.messages[0].isRead,
          createdAt: conv.messages[0].createdAt.toISOString(),
        } : undefined,
        unreadCount: await prisma.message.count({
          where: {
            conversationId: conv.id,
            isRead: false,
            senderType: 'creator',
          },
        }),
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
      })));

      return res.status(200).json(formattedConversations);
    }
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
});

// Obtenir une conversation par projectId
router.get('/project/:projectId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    // Récupérer l'utilisateur et vérifier s'il est créateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        seller: true,
      },
    });

    if (!user || !user.seller) {
      return res.status(404).json({ error: 'Profil créateur non trouvé' });
    }

    // Récupérer les infos du projet
    const quoteRequest = await prisma.quoteRequest.findUnique({
      where: { id: projectId },
    });

    if (!quoteRequest) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // Chercher la conversation entre le créateur et le client
    // Note: productId n'est pas utilisé car il référence Product, pas QuoteRequest
    let conversation = await prisma.conversation.findFirst({
      where: {
        userId: quoteRequest.userId,
        sellerId: user.seller.id,
        subject: {
          contains: quoteRequest.productName || projectId,
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
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    // Si la conversation n'existe pas, la créer automatiquement
    if (!conversation) {
      // Créer la conversation (sans productId car il référence Product)
      conversation = await prisma.conversation.create({
        data: {
          userId: quoteRequest.userId,
          sellerId: user.seller.id,
          productId: null, // Laisser null car il référence Product
          subject: `Devis pour ${quoteRequest.productName || 'votre projet'} [${projectId}]`,
          lastMessageAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      });

      // Envoyer un message automatique dans la nouvelle conversation
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.seller.id,
          senderType: 'creator',
          content: `Bonjour ! Je suis ravi que vous ayez accepté ma proposition pour "${quoteRequest.productName || 'votre projet'}". N'hésitez pas à me contacter pour discuter des détails.`,
          type: 'text',
          isRead: false,
        },
      });
    }

    // Formater la conversation
    const formattedConversation = {
      id: conversation.id,
      projectId: projectId, // Utiliser le projectId passé en paramètre
      creatorId: conversation.sellerId,
      clientId: conversation.userId,
      client: {
        id: conversation.user.id,
        name: conversation.user.name || 'Client',
        profileImage: conversation.user.image,
      },
      lastMessage: conversation.messages[0] ? {
        id: conversation.messages[0].id,
        conversationId: conversation.id,
        senderId: conversation.messages[0].senderId,
        senderType: conversation.messages[0].senderType as 'creator' | 'client',
        content: conversation.messages[0].content,
        audioUrl: conversation.messages[0].audioUrl,
        audioDuration: conversation.messages[0].duration,
        type: conversation.messages[0].type as 'text' | 'audio',
        isRead: conversation.messages[0].isRead,
        createdAt: conversation.messages[0].createdAt.toISOString(),
      } : undefined,
      unreadCount: await prisma.message.count({
        where: {
          conversationId: conversation.id,
          isRead: false,
          senderType: 'client',
        },
      }),
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
    };

    return res.status(200).json(formattedConversation);
  } catch (error) {
    console.error('Get conversation by project error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération de la conversation' });
  }
});

// Obtenir les messages d'une conversation
router.get('/:conversationId/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderType: msg.senderType as 'creator' | 'client',
      content: msg.content,
      audioUrl: msg.audioUrl,
      audioDuration: msg.duration,
      type: msg.type as 'text' | 'audio',
      isRead: msg.isRead,
      createdAt: msg.createdAt.toISOString(),
    }));

    return res.status(200).json(formattedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

// Envoyer un message
router.post('/:conversationId/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type, audioUrl, audioDuration } = req.body;

    // Déterminer le type d'expéditeur
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        seller: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const senderType = user.seller ? 'creator' : 'client';
    const senderId = user.seller ? user.seller.id : user.id;

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        senderType,
        content: content || '',
        type: type || 'text',
        audioUrl,
        duration: audioDuration,
        isRead: false,
      },
    });

    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
      },
    });

    const formattedMessage = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderType: message.senderType as 'creator' | 'client',
      content: message.content,
      audioUrl: message.audioUrl,
      audioDuration: message.duration,
      type: message.type as 'text' | 'audio',
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
    };

    return res.status(201).json(formattedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

// Marquer un message comme lu
router.patch('/messages/:messageId/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const { messageId } = req.params;

    await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({ error: 'Erreur lors du marquage du message' });
  }
});

export default router;

