const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/extension-accelerate');

const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
  console.log('🔍 Recherche des QuoteRequests dans la base de données...\n');
  
  try {
    const quoteRequests = await prisma.quoteRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        offers: true,
      },
      take: 10,
    });

    if (quoteRequests.length === 0) {
      console.log('❌ Aucun QuoteRequest trouvé dans la base de données.');
      console.log('\n💡 La base de données est vide. Vous devez créer des projets depuis l\'application ou un script de seed.');
    } else {
      console.log(`✅ ${quoteRequests.length} QuoteRequest(s) trouvé(s):\n`);
      
      quoteRequests.forEach((qr, index) => {
        console.log(`${index + 1}. ${qr.productName || 'Sans nom'}`);
        console.log(`   ID: ${qr.id}`);
        console.log(`   Description: ${qr.description || 'Aucune'}`);
        console.log(`   Budget: ${qr.basePrice || 'Non spécifié'} ${qr.budgetCurrency || 'XOF'}`);
        console.log(`   Status: ${qr.status}`);
        console.log(`   Client: ${qr.user?.name || 'Inconnu'} (${qr.user?.email || 'N/A'})`);
        console.log(`   Offres reçues: ${qr.offers.length}`);
        console.log(`   Créé le: ${qr.createdAt.toLocaleDateString('fr-FR')}`);
        console.log('');
      });
    }

    // Compter le total
    const total = await prisma.quoteRequest.count();
    console.log(`📊 Total dans la base: ${total} QuoteRequest(s)\n`);

    // Afficher aussi les utilisateurs
    const users = await prisma.user.count();
    const sellers = await prisma.seller.count();
    console.log(`👥 Utilisateurs: ${users}`);
    console.log(`🎨 Créateurs (Sellers): ${sellers}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

