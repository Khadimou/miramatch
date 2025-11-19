import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

const router = Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'CLIENT',
      },
    });

    // Si c'est un créateur, créer aussi le profil Seller
    if (role === 'CREATOR') {
      await prisma.seller.create({
        data: {
          userId: user.id,
          brandName: name || 'Mon Atelier',
          phone: '',
          country: '',
          employees: '1-5',
          selfProduction: true,
          productionCountry: '',
          monthlyProduction: 0,
        },
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        seller: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // Préparer les données utilisateur
    let userData: any = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Si c'est un créateur, ajouter les infos du seller
    if (user.seller) {
      userData = {
        ...userData,
        brandName: user.seller.brandName,
        sellerType: user.seller.sellerType,
        specialty: user.seller.sellerType,
        bio: user.seller.profile?.description || '',
        profileImage: user.seller.profile?.avatar,
        location: user.seller.country,
        rating: 4.5,
        completedProjects: 0,
        responseTime: '< 24h',
        portfolio: [],
      };
    }

    return res.status(200).json({
      token,
      user: userData,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Rafraîchir le token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as { userId: string; role: string };

    // Générer un nouveau token
    const newToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token: newToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
});

export default router;

