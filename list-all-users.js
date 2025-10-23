#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAllUsers() {
  try {
    console.log('📋 Fetching all users...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
        subscriptionId: true,
        stripeCustomerId: true,
        dailyUsage: true,
        monthlyUsage: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('No users found.');
      return;
    }

    console.log(`Found ${users.length} user(s):\n`);
    console.log('═'.repeat(80));

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Status: ${user.isPremium ? '✅ PREMIUM' : '❌ FREE'}`);
      console.log(`   User ID: ${user.id}`);
      console.log(`   Subscription ID: ${user.subscriptionId || 'None'}`);
      console.log(`   Stripe Customer: ${user.stripeCustomerId || 'None'}`);
      console.log(`   Daily Usage: ${user.dailyUsage}`);
      console.log(`   Monthly Usage: ${user.monthlyUsage}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
      
      if (!user.isPremium && (user.subscriptionId || user.stripeCustomerId)) {
        console.log(`   ⚠️  WARNING: Has Stripe data but not marked as premium!`);
        console.log(`   💡 Run: node activate-premium-manually.js ${user.email}`);
      }
    });

    console.log('\n' + '═'.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Premium Users: ${users.filter(u => u.isPremium).length}`);
    console.log(`   Free Users: ${users.filter(u => !u.isPremium).length}`);
    
    const needsActivation = users.filter(u => !u.isPremium && (u.subscriptionId || u.stripeCustomerId));
    if (needsActivation.length > 0) {
      console.log(`\n⚠️  ${needsActivation.length} user(s) may need manual premium activation:`);
      needsActivation.forEach(u => {
        console.log(`   - ${u.email}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers();
