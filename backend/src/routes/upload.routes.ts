import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth';

const router = Router();

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  },
});

// Upload d'image
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    // Dans un vrai environnement, vous uploaderiez sur S3, Cloudinary, etc.
    // Pour l'instant, on retourne l'URL locale
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`;

    return res.status(200).json({ url });
  } catch (error) {
    console.error('Upload image error:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

// Upload d'audio
const audioUpload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /m4a|mp3|wav|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers audio sont autorisés'));
    }
  },
});

router.post('/audio', authenticate, audioUpload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`;

    // Durée par défaut de 0, dans un vrai environnement, vous analyseriez le fichier
    const duration = 0;

    return res.status(200).json({ url, duration });
  } catch (error) {
    console.error('Upload audio error:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'upload audio' });
  }
});

export default router;

