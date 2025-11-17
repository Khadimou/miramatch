// Types pour MIRA MATCH

export interface Creator {
  id: string;
  name: string;
  email: string;
  specialty: string; // "Couturier", "Artisan", "Designer", etc.
  bio: string;
  profileImage?: string;
  portfolio: PortfolioItem[];
  location: string;
  rating: number;
  completedProjects: number;
  responseTime: string; // "< 24h", "< 48h", etc.
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
  description: string;
  category: ProjectCategory;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  deadline?: string;
  images: string[];
  client: Client;
  specifications?: string[];
  materials?: string[];
  createdAt: string;
  location: string;
  status: 'open' | 'in_progress' | 'completed';
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
  deliveryTime: string; // "2 semaines", "1 mois", etc.
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Match {
  id: string;
  projectId: string;
  creatorId: string;
  createdAt: string;
  hasQuote: boolean;
}
