import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  // MODE: Ne pas supprimer les données existantes
  // Les nouveaux utilisateurs et projets seront ajoutés aux données existantes
  console.log('ℹ️  Mode ajout - conservation des données existantes');

  // Créer des utilisateurs sellers
  const sellers = [
    {
      email: 'sophie.martin@miramatch.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Sophie Martin',
      role: 'CREATOR',
      brandName: 'Atelier Sophie',
      phone: '+33612345678',
      country: 'France',
      employees: '1-5',
      selfProduction: true,
      productionCountry: 'France',
      monthlyProduction: 20,
      sellerType: 'ATELIER' as const,
      profile: {
        description: 'Passionnée de mode depuis 15 ans, spécialisée dans la création de vêtements sur mesure et la haute couture.',
        city: 'Paris',
        country: 'France',
        instagram: '@atelier_sophie',
        phone: '+33612345678',
      },
    },
    {
      email: 'jean.dupont@miramatch.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Jean Dupont',
      role: 'CREATOR',
      brandName: 'Maroquinerie Dupont',
      phone: '+33687654321',
      country: 'France',
      employees: '6-10',
      selfProduction: true,
      productionCountry: 'France',
      monthlyProduction: 15,
      sellerType: 'ACCESSOIRES' as const,
      profile: {
        description: 'Artisan maroquinier depuis 20 ans, création de sacs et accessoires en cuir de qualité.',
        city: 'Lyon',
        country: 'France',
        instagram: '@maroquinerie_dupont',
        phone: '+33687654321',
      },
    },
    {
      email: 'marie.bernard@miramatch.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Marie Bernard',
      role: 'CREATOR',
      brandName: 'Créations Marie',
      phone: '+33698765432',
      country: 'France',
      employees: '1-5',
      selfProduction: true,
      productionCountry: 'France',
      monthlyProduction: 30,
      sellerType: 'ATELIER' as const,
      profile: {
        description: 'Designer de mode passionnée par la création de pièces uniques et personnalisées.',
        city: 'Marseille',
        country: 'France',
        facebook: 'creations.marie',
        phone: '+33698765432',
      },
    },
  ];

  for (const sellerData of sellers) {
    const { email, password, name, role, brandName, phone, country, employees, selfProduction, productionCountry, monthlyProduction, sellerType, profile } = sellerData;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { seller: true },
    });

    if (existingUser) {
      console.log(`⏭️  Utilisateur existant ignoré: ${email}`);
      continue;
    }

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
        role,
        accountStatus: 'CONFIRMED', // Seller vérifié, peut se connecter
      },
    });

    console.log(`✅ Utilisateur créé: ${email}`);

    // Créer le profil seller
    const seller = await prisma.seller.create({
      data: {
        userId: user.id,
        brandName,
        phone,
        country,
        employees,
        selfProduction,
        productionCountry,
        monthlyProduction,
        sellerType,
      },
    });

    console.log(`✅ Seller créé: ${brandName}`);

    // Créer le profil détaillé
    await prisma.sellerProfile.create({
      data: {
        sellerId: seller.id,
        description: profile.description,
        city: profile.city,
        country: profile.country,
        instagram: profile.instagram,
        facebook: profile.facebook,
        phone: profile.phone,
      },
    });

    console.log(`✅ Profil seller créé pour: ${brandName}`);
  }

  // Créer des utilisateurs clients pour tester
  const clients = [
    {
      email: 'client@miramatch.com',
      name: 'Client Test',
    },
    {
      email: 'marie.dubois@example.com',
      name: 'Marie Dubois',
    },
    {
      email: 'thomas.laurent@example.com',
      name: 'Thomas Laurent',
    },
    {
      email: 'claire.petit@example.com',
      name: 'Claire Petit',
    },
  ];

  const createdClients = [];
  for (const clientData of clients) {
    // Vérifier si le client existe déjà
    let client = await prisma.user.findUnique({
      where: { email: clientData.email },
    });

    if (client) {
      console.log(`⏭️  Client existant réutilisé: ${clientData.email}`);
      createdClients.push(client);
      continue;
    }

    // Créer le client
    client = await prisma.user.create({
      data: {
        email: clientData.email,
        password: await bcrypt.hash('password123', 10),
        name: clientData.name,
        role: 'CLIENT',
        accountStatus: 'CONFIRMED',
      },
    });
    createdClients.push(client);
    console.log(`✅ Client créé: ${clientData.email}`);
  }

  // Créer des projets de test (QuoteRequests)
  console.log('\n📋 Création des projets de test...\n');

  const projects = [
    {
      userId: createdClients[1].id, // Marie Dubois
      productName: 'Robe de mariée bohème chic',
      designType: 'Haute Couture',
      description: 'Je cherche une créatrice pour réaliser ma robe de mariée dans un style bohème chic. Je souhaite de la dentelle et des manches longues, avec une traîne légère.',
      requirements: 'La robe doit être confortable, permettre une liberté de mouvement, et respecter mon style bohème tout en restant élégante. Tissu respirant obligatoire.',
      customizationOptions: ['Dentelle française', 'Manches longues', 'Traîne de 1m', 'Dos nu'],
      basePrice: 1200,
      budgetCurrency: 'EUR',
      deadline: new Date('2025-06-15'),
      measurements: {
        bust: 88,
        waist: 68,
        hips: 95,
        height: 168,
      },
      status: 'open',
      scope: 'BROADCAST' as const,
    },
    {
      userId: createdClients[2].id, // Thomas Laurent
      productName: 'Costume 3 pièces mariage',
      designType: 'Sur mesure classique',
      description: 'Recherche tailleur pour un costume 3 pièces classique pour mon mariage. Tissu de qualité, coupe slim moderne.',
      requirements: 'Coupe slim mais confortable, finitions soignées, style intemporel.',
      customizationOptions: ['Veste', 'Pantalon', 'Gilet', 'Coupe slim'],
      basePrice: 800,
      budgetCurrency: 'EUR',
      deadline: new Date('2025-05-20'),
      measurements: {
        bust: 102,
        waist: 85,
        hips: 98,
        height: 180,
      },
      status: 'open',
      scope: 'BROADCAST' as const,
    },
    {
      userId: createdClients[3].id, // Claire Petit
      productName: 'Sac en cuir artisanal',
      designType: 'Maroquinerie vintage',
      description: 'Je recherche un artisan maroquinier pour créer un sac à main en cuir véritable, style vintage avec fermeture à rabat.',
      requirements: 'Cuir pleine fleur, fermeture magnétique, dimensions: 30x25x10cm, bandoulière ajustable.',
      customizationOptions: ['Cuir véritable', 'Fermeture magnétique', 'Bandoulière ajustable'],
      basePrice: 300,
      budgetCurrency: 'EUR',
      deadline: new Date('2025-04-01'),
      status: 'open',
      scope: 'BROADCAST' as const,
    },
    {
      userId: createdClients[1].id, // Marie Dubois
      productName: 'Robe de soirée élégante',
      designType: 'Couture contemporaine',
      description: 'Besoin d\'une robe de soirée élégante pour un événement professionnel. Style moderne et sophistiqué.',
      requirements: 'Tissu noble, longueur midi, couleur sobre (noir, bleu marine ou bordeaux).',
      customizationOptions: ['Longueur midi', 'Manches 3/4', 'Décolleté en V'],
      basePrice: 600,
      budgetCurrency: 'EUR',
      deadline: new Date('2025-03-15'),
      measurements: {
        bust: 88,
        waist: 68,
        hips: 95,
        height: 168,
      },
      status: 'open',
      scope: 'BROADCAST' as const,
    },
    {
      userId: createdClients[2].id, // Thomas Laurent
      productName: 'Veste en cuir sur mesure',
      designType: 'Casual chic',
      description: 'Je souhaite une veste en cuir sur mesure, style motard mais élégant pour un usage quotidien.',
      requirements: 'Cuir souple, doublure confortable, fermeture éclair YKK, poches intérieures.',
      customizationOptions: ['Cuir agneau', 'Doublure satin', '4 poches'],
      basePrice: 900,
      budgetCurrency: 'EUR',
      deadline: new Date('2025-04-30'),
      status: 'open',
      scope: 'BROADCAST' as const,
    },
  ];

  let newProjectsCount = 0;
  for (const projectData of projects) {
    // Vérifier si un projet similaire existe déjà (même titre et même client)
    const existingProject = await prisma.quoteRequest.findFirst({
      where: {
        productName: projectData.productName,
        userId: projectData.userId,
      },
    });

    if (existingProject) {
      console.log(`⏭️  Projet existant ignoré: ${projectData.productName}`);
      continue;
    }

    const project = await prisma.quoteRequest.create({
      data: projectData,
    });
    newProjectsCount++;
    console.log(`✅ Projet créé: ${project.productName}`);
  }

  // Compter le total de projets dans la DB
  const totalProjects = await prisma.quoteRequest.count();

  console.log('');
  console.log('🎉 Seed terminé avec succès !');
  console.log('');
  console.log('📝 Comptes de test :');
  console.log('');
  console.log('SELLERS (peuvent se connecter à l\'app MIRA MATCH) :');
  console.log('  - sophie.martin@miramatch.com / password123 (Atelier Sophie)');
  console.log('  - jean.dupont@miramatch.com / password123 (Maroquinerie Dupont)');
  console.log('  - marie.bernard@miramatch.com / password123 (Créations Marie)');
  console.log('');
  console.log('CLIENTS :');
  console.log('  - client@miramatch.com / password123');
  console.log('  - marie.dubois@example.com / password123');
  console.log('  - thomas.laurent@example.com / password123');
  console.log('  - claire.petit@example.com / password123');
  console.log('');
  console.log(`📋 ${newProjectsCount} nouveaux projets créés`);
  console.log(`📊 Total projets dans la DB: ${totalProjects}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
