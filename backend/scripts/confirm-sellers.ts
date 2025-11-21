import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function confirmSellers() {
  console.log('✅ Confirmation des sellers de test...\n');

  const testEmails = [
    'sophie.martin@miramatch.com',
    'jean.dupont@miramatch.com',
    'marie.bernard@miramatch.com',
  ];

  // Mettre à jour le statut de tous les sellers de test
  const result = await prisma.user.updateMany({
    where: {
      email: {
        in: testEmails,
      },
    },
    data: {
      accountStatus: 'CONFIRMED',
    },
  });

  console.log(`📊 ${result.count} comptes mis à jour\n`);

  // Vérifier les mises à jour
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: testEmails,
      },
    },
    select: {
      email: true,
      name: true,
      accountStatus: true,
      seller: {
        select: {
          brandName: true,
        },
      },
    },
  });

  console.log('📝 STATUT DES SELLERS APRÈS MISE À JOUR\n');
  console.log('='.repeat(60));
  console.log('');

  users.forEach((user) => {
    console.log(`👤 ${user.name} (${user.seller?.brandName})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Statut: ${user.accountStatus} ✓`);
    console.log('');
  });

  console.log('='.repeat(60));
  console.log('\n✅ Tous les sellers de test sont maintenant CONFIRMÉS!\n');
}

confirmSellers()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
