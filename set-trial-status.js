// Script to manually set a user's trial status for testing
// Usage: node set-trial-status.js <email>

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setTrialStatus(email) {
  if (!email) {
    console.log('Usage: node set-trial-status.js <email>');
    console.log('Example: node set-trial-status.js bob.bryden88@gmail.com');
    process.exit(1);
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log('❌ User not found:', email);
      process.exit(1);
    }

    console.log('Found user:', user.email, '(ID:', user.id, ')');
    console.log('Current status:', user.subscriptionStatus);

    // Set trial status
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 30); // 30 days from now

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        isPremium: true,
        subscriptionStatus: 'trialing',
        trialStartDate: trialStart,
        trialEndDate: trialEnd,
        trialActive: true
      }
    });

    console.log('\n✅ Trial status set successfully!');
    console.log('─────────────────────────────');
    console.log('Email:', updated.email);
    console.log('isPremium:', updated.isPremium);
    console.log('subscriptionStatus:', updated.subscriptionStatus);
    console.log('trialStartDate:', updated.trialStartDate);
    console.log('trialEndDate:', updated.trialEndDate);
    console.log('trialActive:', updated.trialActive);
    console.log('─────────────────────────────');
    console.log('\nNow refresh Gmail and the sidebar should show "Pro Trial (30 days)"');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2] || 'bob.bryden88@gmail.com';
setTrialStatus(email);
