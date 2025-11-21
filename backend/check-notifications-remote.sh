#!/bin/bash

# Script pour vérifier les notifications sur le serveur distant
# Usage: ./check-notifications-remote.sh

echo "🔍 Checking notifications on remote server..."
echo ""

ssh thiolkia@159.69.221.252 << 'ENDSSH'
cd ~/MIRA_MATCH/backend

echo "📊 Running notification check..."
npx tsx << 'EOF'
import prisma from './src/config/database.js';

async function checkNotifications() {
  console.log('🔍 Checking recent notifications on server...\n');

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
    });
  }

  console.log('\n' + '='.repeat(80));

  const notifByType = await prisma.userNotification.groupBy({
    by: ['type'],
    _count: { id: true },
  });

  console.log('\n📊 Notifications by type:');
  notifByType.forEach((item) => {
    console.log(`   ${item.type}: ${item._count.id}`);
  });

  await prisma.$disconnect();
}

checkNotifications().catch(console.error);
EOF

ENDSSH

echo ""
echo "✅ Check completed"
