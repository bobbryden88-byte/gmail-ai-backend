// Grant premium / developer access to one or more specific users
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

// Usage:
//   node grant-developer-access.js                     -> updates default emails
//   node grant-developer-access.js user@example.com    -> updates specific email(s)
const targetEmails = process.argv.slice(2);

if (targetEmails.length === 0) {
  targetEmails.push(
    'bob.bryden@brentwood.ca',
    'reededdy@gmail.com'
  );
}

async function grantDeveloperAccess(email) {
  console.log('\n🔍 Processing user:', email);

  // Look for existing user
  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log('❌ User not found. Creating premium tester account...');

    const hashedPassword = await bcrypt.hash('developer123', 12);

    user = await prisma.user.create({
      data: {
        email,
        name: email,
        password: hashedPassword,
        isPremium: true,
        dailyUsage: 0,
        monthlyUsage: 0
      }
    });

    console.log('✅ Account created with temporary password: developer123');
    console.log('⚠️  Ask the tester to change this password after first login.');

  } else {
    console.log('✅ User found. Upgrading to premium tester...');

    user = await prisma.user.update({
      where: { email },
      data: {
        isPremium: true,
        dailyUsage: 0,
        monthlyUsage: 0
      }
    });
  }

  console.log('\n📊 Tester Account Details:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ID:', user.id);
  console.log('Email:', user.email);
  console.log('Name:', user.name || '(not set)');
  console.log('Premium:', user.isPremium ? '✅ YES' : '❌ NO');
  console.log('Current Daily Usage:', user.dailyUsage);
  console.log('Current Monthly Usage:', user.monthlyUsage);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🎉 Premium tester access granted successfully!');
}

async function main() {
  try {
    for (const email of targetEmails) {
      await grantDeveloperAccess(email);
    }
    console.log('\n✅ Completed premium access update for all target users.\n');
  } catch (error) {
    console.error('❌ Error granting developer access:', error);
    console.error('Error details:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();