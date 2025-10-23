#!/usr/bin/env node

require('dotenv').config();

console.log('🔍 DIAGNOSING EMAIL CONFIGURATION\n');
console.log('═'.repeat(60));

console.log('\n📋 ENVIRONMENT VARIABLES CHECK:');
console.log('─'.repeat(60));

const emailVars = {
  'SMTP_HOST': process.env.SMTP_HOST,
  'SMTP_PORT': process.env.SMTP_PORT,
  'SMTP_USER': process.env.SMTP_USER,
  'SMTP_PASS': process.env.SMTP_PASS ? '***SET***' : undefined,
  'FRONTEND_URL': process.env.FRONTEND_URL,
};

Object.entries(emailVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const displayValue = value || 'NOT SET';
  console.log(`${status} ${key}: ${displayValue}`);
});

console.log('\n📊 EMAIL SERVICE STATUS:');
console.log('─'.repeat(60));

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.log('⚠️  EMAIL SERVICE: DEVELOPMENT MODE');
  console.log('');
  console.log('In development mode:');
  console.log('  - Emails are NOT actually sent');
  console.log('  - Reset URLs are logged to console instead');
  console.log('  - This is NORMAL and EXPECTED for testing');
  console.log('');
  console.log('The "Failed to send reset email" error in the extension is');
  console.log('misleading - the system is actually working correctly!');
  console.log('');
  console.log('To test password reset:');
  console.log('  1. Watch backend console when requesting reset');
  console.log('  2. Look for: "Reset URL (dev mode): http://..."');
  console.log('  3. Copy that URL and open in browser');
  console.log('  4. Reset your password there');
  console.log('');
} else {
  console.log('✅ EMAIL SERVICE: PRODUCTION MODE');
  console.log('SMTP credentials are configured');
  console.log('Emails will be sent via:', process.env.SMTP_HOST);
}

console.log('\n🔧 TO ENABLE REAL EMAIL SENDING:');
console.log('─'.repeat(60));
console.log('1. Get Gmail App Password:');
console.log('   a. Go to: https://myaccount.google.com/apppasswords');
console.log('   b. Enable 2-Factor Authentication if not already enabled');
console.log('   c. Create App Password for "Mail"');
console.log('   d. Copy the 16-character password');
console.log('');
console.log('2. Add to .env file:');
console.log('   SMTP_HOST=smtp.gmail.com');
console.log('   SMTP_PORT=587');
console.log('   SMTP_USER=your-email@gmail.com');
console.log('   SMTP_PASS=your-16-char-app-password');
console.log('   FRONTEND_URL=http://localhost:3000');
console.log('');
console.log('3. Restart backend: npm run dev');
console.log('');

console.log('\n🧪 TESTING EMAIL SERVICE:');
console.log('─'.repeat(60));

async function testEmailService() {
  try {
    const emailService = require('./src/services/email');
    
    console.log('Attempting to send test email...');
    const result = await emailService.sendPasswordResetEmail(
      'bob.bryden@brentwood.ca',
      'Bob Bryden',
      'test-token-12345'
    );
    
    if (result.success) {
      if (result.resetUrl) {
        console.log('\n✅ TEST SUCCESSFUL (Development Mode)');
        console.log('Reset URL would be:', result.resetUrl);
      } else {
        console.log('\n✅ TEST SUCCESSFUL (Production Mode)');
        console.log('Email sent with message ID:', result.messageId);
      }
    } else {
      console.log('\n❌ TEST FAILED');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.log('\n❌ TEST FAILED WITH EXCEPTION');
    console.error('Error:', error.message);
  }
}

testEmailService().then(() => {
  console.log('\n═'.repeat(60));
  console.log('🎯 DIAGNOSIS COMPLETE');
  console.log('═'.repeat(60));
});
