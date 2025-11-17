// Types pour MIRA MATCH

export interface Creator {
  id: string;
  name: string;
  email: string;
  brandName?: string; // Nom de la marque
  sellerType: string; // "Couturier", "Artisan", "Designer", etc.
  specialty: string; // "Couturier", "Artisan", "Designer", etc.
  bio: string;
  profileImage?: string;
  portfolio: PortfolioItem[];
  location: string;
  rating: number;
  completedProjects: number;
  responseTime: string; // "< 24h", "< 48h", etc.
  // Statistiques
  stats?: {
    projectsLiked: number;
    quotesSent: number;
    quotesAccepted: number;
    acceptanceRate: number; // En pourcentage
  };
}

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
}

export interface Client {
  id: string;
  name: string;
  profileImage?: string;
}

export interface Project {
  id: string;
  title: string;
  productName: string; // Nom du produit
  description: string;
  requirements?: string; // Exigences détaillées
  category: ProjectCategory;
  designType: string; // Type de création
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  basePrice?: number; // Prix de base
  deadline?: string;
  images: string[];
  customImageUrl?: string; // Image principale personnalisée
  client: Client;
  specifications?: string[];
  materials?: string[];
  measurements?: Measurements; // Mensurations
  createdAt: string;
  location: string;
  city?: string; // Ville du client
  status: 'open' | 'in_progress' | 'completed';
}

export interface Measurements {
  bust?: number;
  waist?: number;
  hips?: number;
  height?: number;
  weight?: number;
  shoeSize?: number;
  other?: Record<string, string | number>;
}

export type ProjectCategory =
  | 'Vêtement sur mesure'
  | 'Retouche'
  | 'Accessoire'
  | 'Décoration'
  | 'Bijou'
  | 'Maroquinerie'
  | 'Autre';

export interface Quote {
  id: string;
  projectId: string;
  creatorId: string;
  price: number;
  currency: string; // XOF, EUR, USD
  deliveryTime: string; // "2 semaines", "1 mois", etc.
  deliveryDays?: number; // Délai en jours
  message: string; // Description courte
  detailedProposal?: string; // Proposition détaillée
  attachments?: string[]; // URLs des photos/fichiers joints
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface Match {
  id: string;
  projectId: string;
  creatorId: string;
  createdAt: string;
  hasQuote: boolean;
}

// Types pour les messages et conversations
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'creator' | 'client';
  content?: string; // Message texte
  audioUrl?: string; // URL de l'audio
  audioDuration?: number; // Durée en secondes
  type: 'text' | 'audio';
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  projectId: string;
  project?: Project; // Projet associé
  creatorId: string;
  clientId: string;
  client: Client;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Type pour l'authentification
export interface AuthResponse {
  token: string;
  user: Creator;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
