import { Project, Creator, Quote, Match } from '../types';

// Données mockées pour le développement

export const MOCK_CREATOR: Creator = {
  id: '1',
  name: 'Sophie Martin',
  email: 'sophie.martin@example.com',
  brandName: 'Atelier Sophie',
  sellerType: 'Couturière professionnelle',
  specialty: 'Couturière',
  bio: 'Passionnée de mode depuis 15 ans, spécialisée dans la création de vêtements sur mesure et la haute couture. J\'adore donner vie aux projets uniques.',
  location: 'Paris, France',
  rating: 4.8,
  completedProjects: 127,
  responseTime: '< 24h',
  stats: {
    projectsLiked: 45,
    quotesSent: 38,
    quotesAccepted: 29,
    acceptanceRate: 76,
  },
  portfolio: [
    {
      id: 'p1',
      imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea1a5a5e?w=400',
      title: 'Robe de soirée',
      description: 'Robe sur mesure en soie',
    },
    {
      id: 'p2',
      imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
      title: 'Costume 3 pièces',
      description: 'Costume sur mesure pour mariage',
    },
  ],
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Robe de mariée bohème',
    productName: 'Robe de mariée bohème chic',
    designType: 'Haute Couture',
    description: 'Je cherche une créatrice pour réaliser ma robe de mariée dans un style bohème chic. Je souhaite de la dentelle et des manches longues, avec une traîne légère.',
    requirements: 'La robe doit être confortable, permettre une liberté de mouvement, et respecter mon style bohème tout en restant élégante. Tissu respirant obligatoire.',
    category: 'Vêtement sur mesure',
    budget: {
      min: 800,
      max: 1500,
      currency: 'EUR',
    },
    basePrice: 1200,
    deadline: '15 juin 2025',
    images: [
      'https://images.unsplash.com/photo-1519657337289-077653f724ed?w=600',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600',
    ],
    customImageUrl: 'https://images.unsplash.com/photo-1519657337289-077653f724ed?w=600',
    client: {
      id: 'c1',
      name: 'Marie Dubois',
      profileImage: 'https://i.pravatar.cc/150?img=1',
    },
    specifications: [
      'Dentelle française',
      'Manches longues',
      'Traîne de 1m',
      'Dos nu',
    ],
    materials: ['Dentelle', 'Soie', 'Tulle'],
    measurements: {
      bust: 88,
      waist: 68,
      hips: 95,
      height: 168,
    },
    createdAt: '2025-01-10',
    location: 'Lyon, France',
    city: 'Lyon',
    status: 'open',
  },
  {
    id: '2',
    title: 'Costume sur mesure homme',
    productName: 'Costume 3 pièces mariage',
    designType: 'Sur mesure classique',
    description: 'Recherche tailleur pour un costume 3 pièces classique pour mon mariage. Tissu de qualité, coupe slim moderne.',
    requirements: 'Coupe slim mais confortable, finitions soignées, style intemporel.',
    category: 'Vêtement sur mesure',
    budget: {
      min: 600,
      max: 1000,
      currency: 'EUR',
    },
    basePrice: 800,
    deadline: '20 mai 2025',
    images: [
      'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=600',
    ],
    customImageUrl: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=600',
    client: {
      id: 'c2',
      name: 'Thomas Laurent',
      profileImage: 'https://i.pravatar.cc/150?img=2',
    },
    specifications: [
      'Veste',
      'Pantalon',
      'Gilet',
      'Coupe slim',
    ],
    materials: ['Laine', 'Doublure soie'],
    measurements: {
      bust: 102,
      waist: 85,
      hips: 98,
      height: 180,
    },
    createdAt: '2025-01-12',
    location: 'Paris, France',
    city: 'Paris',
    status: 'open',
  },
  {
    id: '3',
    title: 'Sac en cuir artisanal',
    description: 'Je recherche un artisan maroquinier pour créer un sac à main en cuir véritable, style vintage avec fermeture à rabat.',
    category: 'Maroquinerie',
    budget: {
      min: 200,
      max: 400,
      currency: '€',
    },
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600',
    ],
    client: {
      id: 'c3',
      name: 'Claire Petit',
      profileImage: 'https://i.pravatar.cc/150?img=3',
    },
    specifications: [
      'Cuir pleine fleur',
      'Fermeture magnétique',
      'Dimensions: 30x25x10cm',
      'Bandoulière ajustable',
    ],
    materials: ['Cuir véritable', 'Laiton'],
    createdAt: '2025-01-14',
    location: 'Bordeaux, France',
    status: 'open',
  },
  {
    id: '4',
    title: 'Retouche pantalon et veste',
    description: 'Besoin de retouches pour un ensemble : raccourcir le pantalon, ajuster la veste au niveau des épaules et de la taille.',
    category: 'Retouche',
    budget: {
      min: 50,
      max: 100,
      currency: '€',
    },
    deadline: '2025-02-01',
    images: [],
    client: {
      id: 'c4',
      name: 'Jean Moreau',
      profileImage: 'https://i.pravatar.cc/150?img=4',
    },
    specifications: [
      'Ourlet pantalon',
      'Ajustement épaules veste',
      'Ajustement taille',
    ],
    createdAt: '2025-01-15',
    location: 'Marseille, France',
    status: 'open',
  },
  {
    id: '5',
    title: 'Création de bijoux personnalisés',
    description: 'Je souhaite faire créer un ensemble collier + boucles d\'oreilles en argent avec pierres semi-précieuses pour un cadeau d\'anniversaire.',
    category: 'Bijou',
    budget: {
      min: 150,
      max: 300,
      currency: '€',
    },
    deadline: '2025-03-01',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
    ],
    client: {
      id: 'c5',
      name: 'Isabelle Rousseau',
      profileImage: 'https://i.pravatar.cc/150?img=5',
    },
    specifications: [
      'Argent 925',
      'Pierres: améthyste et quartz rose',
      'Style minimaliste',
    ],
    materials: ['Argent 925', 'Améthyste', 'Quartz rose'],
    createdAt: '2025-01-16',
    location: 'Lille, France',
    status: 'open',
  },
];

export const MOCK_QUOTES: Quote[] = [];

export const MOCK_MATCHES: Match[] = [];
