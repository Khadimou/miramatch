import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSellers() {
  console.log('📊 Vérification des sellers dans la base de données...\n');

  // Récupérer tous les sellers avec leurs informations utilisateur
  const sellers = await prisma.seller.findMany({
    include: {
      User: {
        select: {
          email: true,
          name: true,
          createdAt: true,
        },
      },
      profile: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  console.log(`📈 Nombre total de sellers: ${sellers.length}\n`);

  // Emails des sellers de test que nous avons créés
  const testEmails = [
    'sophie.martin@miramatch.com',
    'jean.dupont@miramatch.com',
    'marie.bernard@miramatch.com',
  ];

  const testSellers = sellers.filter((seller) =>
    testEmails.includes(seller.User.email || '')
  );
  const realSellers = sellers.filter(
    (seller) => !testEmails.includes(seller.User.email || '')
  );

  console.log(`🧪 Sellers de test: ${testSellers.length}`);
  console.log(`👥 Sellers réels (hors test): ${realSellers.length}\n`);

  if (testSellers.length > 0) {
    console.log('--- SELLERS DE TEST ---');
    testSellers.forEach((seller, index) => {
      console.log(`${index + 1}. ${seller.brandName}`);
      console.log(`   Email: ${seller.User.email}`);
      console.log(`   Type: ${seller.sellerType}`);
      console.log(`   Créé le: ${seller.User.createdAt.toLocaleDateString()}`);
      console.log('');
    });
  }

  if (realSellers.length > 0) {
    console.log('--- SELLERS RÉELS ---');
    realSellers.forEach((seller, index) => {
      console.log(`${index + 1}. ${seller.brandName}`);
      console.log(`   Email: ${seller.User.email}`);
      console.log(`   Type: ${seller.sellerType}`);
      console.log(`   Ville: ${seller.profile?.city || 'Non renseignée'}`);
      console.log(`   Créé le: ${seller.User.createdAt.toLocaleDateString()}`);
      console.log('');
    });
  } else {
    console.log('ℹ️  Aucun seller réel trouvé (seulement des sellers de test)\n');
  }

  // Statistiques supplémentaires
  console.log('--- STATISTIQUES ---');
  const byType = sellers.reduce((acc, seller) => {
    acc[seller.sellerType] = (acc[seller.sellerType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Répartition par type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });
}

checkSellers()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
