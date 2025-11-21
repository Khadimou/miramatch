import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.quoteRequest.findMany({
    select: {
      id: true,
      productName: true,
      status: true,
      scope: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`\n📊 Total projets dans la DB: ${projects.length}\n`);

  projects.forEach((project, index) => {
    console.log(`${index + 1}. ${project.productName || 'Sans nom'}`);
    console.log(`   ID: ${project.id}`);
    console.log(`   Statut: ${project.status}, Scope: ${project.scope}`);
    console.log(`   Client: ${project.user.name} (${project.user.email})`);
    console.log(`   Créé: ${project.createdAt.toISOString()}\n`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
