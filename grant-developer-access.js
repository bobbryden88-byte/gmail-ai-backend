// Grant developer/premium access to a specific user
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const DEVELOPER_EMAIL = 'bob.bryden@brentwood.ca';

async function grantDeveloperAccess() {
  try {
    console.log('🔍 Looking for user:', DEVELOPER_EMAIL);
    
    // Find the user
    let user = await prisma.user.findUnique({
      where: { email: DEVELOPER_EMAIL }
    });

    if (!user) {
      console.log('❌ User not found. Creating developer account...');
      
      // Create the user if they don't exist
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('developer123', 12);
      
      user = await prisma.user.create({
        data: {
          email: DEVELOPER_EMAIL,
          name: 'Bob Bryden (Developer)',
          password: hashedPassword,
          isPremium: true,
          dailyUsage: 0,
          monthlyUsage: 0
        }
      });
      
      console.log('✅ Developer account created!');
      console.log('📧 Email:', user.email);
      console.log('🔑 Password: developer123');
      console.log('⚠️  Please change this password after first login!');
      
    } else {
      console.log('✅ User found:', user.email);
      
      // Update to premium with unlimited usage
      user = await prisma.user.update({
        where: { email: DEVELOPER_EMAIL },
        data: {
          isPremium: true
        }
      });
      
      console.log('✅ User upgraded to premium!');
    }

    // Display user info
    console.log('\n📊 Developer Account Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Premium:', user.isPremium ? '✅ YES' : '❌ NO');
    console.log('Daily Limit:', user.isPremium ? '100' : '10');
    console.log('Monthly Limit:', user.isPremium ? '3000' : '300');
    console.log('Current Daily Usage:', user.dailyUsage);
    console.log('Current Monthly Usage:', user.monthlyUsage);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🎉 Developer access granted successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Login to extension with:', DEVELOPER_EMAIL);
    console.log('2. Enjoy 100 AI responses per day!');
    console.log('3. Track your usage in the popup');
    
  } catch (error) {
    console.error('❌ Error granting developer access:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
grantDeveloperAccess();

