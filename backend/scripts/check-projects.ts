import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProjects() {
  console.log('📋 Vérification des projets (QuoteRequests) dans la base de données...\n');

  const projects = await prisma.quoteRequest.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      offers: true,
    },
  });

  console.log(`📊 Nombre total de projets: ${projects.length}\n`);

  if (projects.length > 0) {
    console.log('--- PROJETS ---');
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.productName || project.id}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Client: ${project.user.name || project.user.email}`);
      console.log(`   Status: ${project.status}`);
      console.log(`   Scope: ${project.scope}`);
      console.log(`   Créé le: ${project.createdAt.toLocaleDateString()}`);
      console.log(`   Nombre d'offres: ${project.offers.length}`);
      console.log('');
    });
  } else {
    console.log('ℹ️  Aucun projet trouvé dans la base de données\n');
    console.log('💡 Il faut créer des projets de test pour que l\'app fonctionne correctement.\n');
  }
}

checkProjects()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
