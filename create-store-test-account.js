#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

// Test account credentials for Chrome Web Store reviewers
const TEST_EMAIL = 'store.test@inkwell.ai';
const TEST_PASSWORD = 'StoreTest2025!';
const TEST_NAME = 'Chrome Store Test Account';

async function createTestAccount() {
  try {
    console.log('🔧 Creating Chrome Web Store test account...');
    console.log('═'.repeat(60));

    // Check if test account already exists
    let user = await prisma.user.findUnique({
      where: { email: TEST_EMAIL.toLowerCase() }
    });

    if (user) {
      console.log('⚠️  Test account already exists. Updating...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);
      
      // Update existing account
      user = await prisma.user.update({
        where: { email: TEST_EMAIL.toLowerCase() },
        data: {
          password: hashedPassword,
          name: TEST_NAME,
          isPremium: true, // Give premium access for full feature testing
          dailyUsage: 0,
          monthlyUsage: 0
        }
      });

      console.log('✅ Test account updated successfully!');
    } else {
      console.log('📝 Creating new test account...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);
      
      // Create new user
      user = await prisma.user.create({
        data: {
          email: TEST_EMAIL.toLowerCase(),
          name: TEST_NAME,
          password: hashedPassword,
          isPremium: true, // Premium account for full feature testing
          dailyUsage: 0,
          monthlyUsage: 0
        }
      });

      console.log('✅ Test account created successfully!');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 CHROME WEB STORE TEST ACCOUNT READY!');
    console.log('═'.repeat(60));
    console.log('\n📋 Account Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email (Username):', TEST_EMAIL);
    console.log('🔑 Password:         ', TEST_PASSWORD);
    console.log('👤 Name:            ', TEST_NAME);
    console.log('⭐ Premium Status:  ', user.isPremium ? '✅ YES' : '❌ NO');
    console.log('📊 Daily Usage:     ', user.dailyUsage);
    console.log('📊 Monthly Usage:  ', user.monthlyUsage);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n📝 Instructions for Chrome Web Store:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Go to Chrome Web Store Developer Dashboard');
    console.log('2. Select your extension');
    console.log('3. Go to "Test instructions" tab');
    console.log('4. Enter the following:');
    console.log('   Username:', TEST_EMAIL);
    console.log('   Password:', TEST_PASSWORD);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n✅ Test account is ready for Chrome Web Store reviewers!');
    console.log('   This account has premium access to test all features.\n');

  } catch (error) {
    console.error('❌ Error creating test account:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAccount();
