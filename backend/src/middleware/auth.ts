import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant ou invalide' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
      role: string;
    };

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

export const requireCreator = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'CREATOR' && req.userRole !== 'SELLER' && req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès réservé aux créateurs' });
  }
  next();
};

export const requireClient = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'CLIENT' && req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès réservé aux clients' });
  }
  next();
};

