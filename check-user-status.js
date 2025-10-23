#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserStatus() {
  try {
    const email = 'bob.bryden88@gmail.com';
    
    console.log('🔍 CHECKING USER STATUS IN DATABASE');
    console.log('═'.repeat(80));
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log('\n📊 RAW DATABASE RECORD:');
    console.log(JSON.stringify(user, null, 2));
    
    console.log('\n📋 FORMATTED USER DATA:');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Is Premium: ${user.isPremium} ${user.isPremium ? '✅' : '❌'}`);
    console.log(`Stripe Customer ID: ${user.stripeCustomerId || 'None'}`);
    console.log(`Subscription ID: ${user.subscriptionId || 'None'}`);
    console.log(`Daily Usage: ${user.dailyUsage}`);
    console.log(`Monthly Usage: ${user.monthlyUsage}`);
    console.log(`Created: ${user.createdAt}`);
    console.log(`Updated: ${user.updatedAt}`);
    
    console.log('\n🎯 EXPECTED BEHAVIOR:');
    if (user.isPremium) {
      console.log('✅ Extension should show: PREMIUM badge, no upgrade options, unlimited usage');
    } else {
      console.log('❌ Extension will show: FREE badge, upgrade options, usage limits');
    }
    
    console.log('\n═'.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStatus();
