#!/usr/bin/env node

/**
 * Stripe Setup Helper Script
 * 
 * This script helps you configure Stripe for your Gmail AI Assistant
 */

const fs = require('fs');
const path = require('path');

console.log('💳 Gmail AI Assistant - Stripe Setup Helper\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envTemplatePath = path.join(__dirname, 'env.template');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📋 Please create a .env file first. You can copy from env.template:');
  console.log('   cp env.template .env');
  console.log('');
  process.exit(1);
}

console.log('✅ .env file found');

// Read current .env file
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('\n🔧 Stripe Configuration Required:');
console.log('');
console.log('1. Go to https://dashboard.stripe.com/');
console.log('2. Sign up or log in to your Stripe account');
console.log('3. Go to Developers → API Keys');
console.log('4. Copy your keys and add them to your .env file:');
console.log('');

// Check if Stripe keys are already configured
const hasStripeSecret = envContent.includes('STRIPE_SECRET_KEY') && 
                       !envContent.includes('your-stripe-secret-key-here');
const hasStripeWebhook = envContent.includes('STRIPE_WEBHOOK_SECRET') && 
                        !envContent.includes('your-stripe-webhook-secret-here');

if (hasStripeSecret) {
  console.log('✅ STRIPE_SECRET_KEY is configured');
} else {
  console.log('❌ STRIPE_SECRET_KEY needs to be configured');
  console.log('   Add this to your .env file:');
  console.log('   STRIPE_SECRET_KEY="sk_test_your_test_secret_key_here"');
  console.log('');
}

if (hasStripeWebhook) {
  console.log('✅ STRIPE_WEBHOOK_SECRET is configured');
} else {
  console.log('❌ STRIPE_WEBHOOK_SECRET needs to be configured');
  console.log('   Add this to your .env file:');
  console.log('   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"');
  console.log('');
}

console.log('\n📋 Required .env Variables:');
console.log('STRIPE_SECRET_KEY="sk_test_..." (from Stripe Dashboard → API Keys)');
console.log('STRIPE_WEBHOOK_SECRET="whsec_..." (from Stripe Dashboard → Webhooks)');
console.log('STRIPE_PREMIUM_MONTHLY_PRICE_ID="price_..." (create product in Stripe)');
console.log('STRIPE_PREMIUM_YEARLY_PRICE_ID="price_..." (create product in Stripe)');
console.log('');

console.log('🎯 Next Steps:');
console.log('1. Create products in Stripe Dashboard → Products');
console.log('2. Set up webhooks at Stripe Dashboard → Webhooks');
console.log('3. Add your keys to .env file');
console.log('4. Restart your backend server: npm run dev');
console.log('5. Test with Stripe test cards');
console.log('');

console.log('🧪 Test Cards:');
console.log('Success: 4242 4242 4242 4242');
console.log('Decline: 4000 0000 0000 0002');
console.log('3D Secure: 4000 0025 0000 3155');
console.log('');

console.log('📚 Full setup guide: STRIPE_SETUP_GUIDE.md');
console.log('');

// Check if server is running
const { exec } = require('child_process');
exec('curl -s http://localhost:3000/health', (error, stdout, stderr) => {
  if (error) {
    console.log('⚠️  Backend server is not running');
    console.log('   Start it with: npm run dev');
  } else {
    console.log('✅ Backend server is running');
    console.log('🔗 Test Stripe pricing: http://localhost:3000/api/stripe/pricing');
  }
});
