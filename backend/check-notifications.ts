import prisma from './src/config/database';

async function checkNotifications() {
  console.log('🔍 Checking recent notifications...\n');

  // Récupérer les dernières notifications UserNotification
  const userNotifications = await prisma.userNotification.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  console.log('📬 Recent UserNotifications:');
  console.log('='.repeat(80));

  if (userNotifications.length === 0) {
    console.log('❌ No notifications found\n');
  } else {
    userNotifications.forEach((notif, index) => {
      console.log(`\n${index + 1}. ${notif.title}`);
      console.log(`   Type: ${notif.type}`);
      console.log(`   User: ${notif.user.name || notif.user.email}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Read: ${notif.isRead ? '✅' : '❌'}`);
      console.log(`   Created: ${notif.createdAt.toLocaleString('fr-FR')}`);
      if (notif.data) {
        console.log(`   Data:`, JSON.stringify(notif.data, null, 2));
      }
    });
  }

  console.log('\n' + '='.repeat(80));

  // Compter par type
  const notifByType = await prisma.userNotification.groupBy({
    by: ['type'],
    _count: {
      id: true,
    },
  });

  console.log('\n📊 Notifications by type:');
  notifByType.forEach((item) => {
    console.log(`   ${item.type}: ${item._count.id}`);
  });

  await prisma.$disconnect();
}

checkNotifications().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
