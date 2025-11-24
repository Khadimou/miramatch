import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { emailService } from '../services/email.service';

const router = Router();

/**
 * Générer un code de vérification à 6 chiffres
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Inscription avec code de vérification
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      phone,
      brandName,
      country,
      employees,
      selfProduction,
      productionCountry,
      monthlyProduction,
      additionalInfo,
    } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Valider les champs requis
    if (!email || !password || !name || !phone || !brandName || !country || !employees || !productionCountry || !monthlyProduction) {
      return res.status(400).json({ error: 'Tous les champs requis doivent être remplis' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Générer le code de vérification
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Créer l'utilisateur et le seller dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur avec status UNCONFIRMED
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role: 'SELLER',
          accountStatus: 'UNCONFIRMED',
          verificationCode,
          verificationExpires,
        },
      });

      // Créer le profil Seller
      const seller = await tx.seller.create({
        data: {
          userId: user.id,
          brandName,
          phone,
          country,
          employees,
          selfProduction,
          productionCountry,
          monthlyProduction: parseInt(monthlyProduction),
          additionalInfo: additionalInfo || null,
        },
      });

      return { user, seller };
    });

    // Envoyer l'email de vérification
    try {
      await emailService.sendVerificationEmail(email, verificationCode, name);
    } catch (emailError) {
      console.error('[Register] Email sending error (non-blocking):', emailError);
      // Ne pas bloquer l'inscription si l'email échoue
    }

    return res.status(201).json({
      success: true,
      userId: result.user.id,
      message: 'Inscription réussie. Un code de vérification a été envoyé à votre email.',
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

// Vérifier le code de vérification
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email et code requis' });
    }

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
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si le compte est déjà vérifié
    if (user.accountStatus === 'CONFIRMED') {
      return res.status(400).json({ error: 'Ce compte est déjà vérifié' });
    }

    // Vérifier le code et l'expiration
    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Code de vérification invalide' });
    }

    if (!user.verificationExpires || user.verificationExpires < new Date()) {
      return res.status(400).json({ error: 'Code de vérification expiré' });
    }

    // Mettre à jour le statut de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        accountStatus: 'CONFIRMED',
        emailVerified: new Date(),
        verificationCode: null,
        verificationExpires: null,
      },
    });

    // Envoyer l'email de bienvenue
    try {
      await emailService.sendWelcomeEmail(email, user.name || 'Créateur');
    } catch (emailError) {
      console.error('[VerifyCode] Welcome email error (non-blocking):', emailError);
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
      success: true,
      token,
      user: userData,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

// Renvoyer le code de vérification
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si le compte est déjà vérifié
    if (user.accountStatus === 'CONFIRMED') {
      return res.status(400).json({ error: 'Ce compte est déjà vérifié' });
    }

    // Générer un nouveau code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Mettre à jour le code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationExpires,
      },
    });

    // Envoyer l'email
    try {
      await emailService.sendVerificationEmail(email, verificationCode, user.name || 'Créateur');
    } catch (emailError) {
      console.error('[ResendCode] Email error:', emailError);
      return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
    }

    return res.status(200).json({
      success: true,
      message: 'Un nouveau code de vérification a été envoyé',
    });
  } catch (error) {
    console.error('Resend code error:', error);
    return res.status(500).json({ error: 'Erreur lors du renvoi du code' });
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

