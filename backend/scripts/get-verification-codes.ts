import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getVerificationCodes() {
  console.log('🔐 Récupération des codes de vérification...\n');

  const testEmails = [
    'sophie.martin@miramatch.com',
    'jean.dupont@miramatch.com',
    'marie.bernard@miramatch.com',
  ];

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: testEmails,
      },
    },
    select: {
      email: true,
      name: true,
      verificationCode: true,
      verificationExpires: true,
      accountStatus: true,
      seller: {
        select: {
          brandName: true,
        },
      },
    },
  });

  console.log('📝 CODES DE VÉRIFICATION DES SELLERS\n');
  console.log('='.repeat(60));
  console.log('');

  users.forEach((user) => {
    console.log(`👤 ${user.name} (${user.seller?.brandName})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Code de vérification: ${user.verificationCode || 'NON DÉFINI'}`);
    console.log(`   Expire le: ${user.verificationExpires ? user.verificationExpires.toLocaleString() : 'N/A'}`);
    console.log(`   Status du compte: ${user.accountStatus}`);
    console.log('');
  });

  console.log('='.repeat(60));
}

getVerificationCodes()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
