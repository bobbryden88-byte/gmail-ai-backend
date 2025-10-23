#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function activatePremium() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node activate-premium-manually.js <email>');
      console.log('Example: node activate-premium-manually.js test@example.com');
      process.exit(1);
    }

    console.log(`🔍 Looking for user: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`\n📊 Current status:`);
    console.log(`User ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Is Premium: ${user.isPremium}`);
    console.log(`Subscription ID: ${user.subscriptionId || 'None'}`);

    if (user.isPremium) {
      console.log(`\n✅ User is already premium!`);
      process.exit(0);
    }

    console.log(`\n🔄 Activating premium...`);
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isPremium: true,
        subscriptionId: 'manual_activation_' + Date.now()
      }
    });

    console.log(`\n✅ Premium activated successfully!`);
    console.log(`\n📊 Updated status:`);
    console.log(`User ID: ${updatedUser.id}`);
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Is Premium: ${updatedUser.isPremium}`);
    console.log(`Subscription ID: ${updatedUser.subscriptionId}`);
    
    console.log(`\n🎉 Done! User can now refresh their extension popup to see premium status.`);
    
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

activatePremium();
