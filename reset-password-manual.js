#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'bob.bryden@brentwood.ca';
    const newPassword = 'NewPassword123!'; // Temporary password
    
    console.log('🔐 Resetting password for:', email);
    console.log('═'.repeat(60));
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log('❌ User not found:', email);
      process.exit(1);
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      isPremium: user.isPremium
    });

    // Hash new password
    console.log('\n🔄 Hashing new password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log('✅ Password hashed');

    // Update password in database
    console.log('\n💾 Updating password in database...');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    });

    console.log('✅ Password updated successfully!');
    
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 PASSWORD RESET COMPLETE!');
    console.log('═'.repeat(60));
    console.log('\n📧 Email:', email);
    console.log('🔑 New Password:', newPassword);
    console.log('\n⚠️  IMPORTANT:');
    console.log('   1. Save this password securely');
    console.log('   2. Login to the extension with this password');
    console.log('   3. Consider changing it to something memorable');
    console.log('\n💡 To login:');
    console.log('   Email:', email);
    console.log('   Password:', newPassword);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
