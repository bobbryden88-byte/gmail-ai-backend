// Reset usage for a specific user
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const USER_EMAIL = 'bob.bryden@brentwood.ca';

async function resetUsage() {
  try {
    console.log('🔍 Resetting usage for:', USER_EMAIL);
    
    const user = await prisma.user.update({
      where: { email: USER_EMAIL },
      data: {
        dailyUsage: 0,
        monthlyUsage: 0,
        lastUsageDate: new Date(),
        lastResetDate: new Date()
      }
    });

    console.log('✅ Usage reset successfully!');
    console.log('\n📊 Updated Account:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Premium:', user.isPremium ? '✅ YES' : '❌ NO');
    console.log('Daily Usage:', user.dailyUsage, '/', user.isPremium ? '100' : '10');
    console.log('Monthly Usage:', user.monthlyUsage, '/', user.isPremium ? '3000' : '300');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🎉 You can now generate', user.isPremium ? '100' : '10', 'responses today!');
    
  } catch (error) {
    console.error('❌ Error resetting usage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetUsage();

