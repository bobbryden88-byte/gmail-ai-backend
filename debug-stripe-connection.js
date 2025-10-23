#!/usr/bin/env node

require('dotenv').config();
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function debugStripeConnection() {
  console.log('🔍 Debugging Stripe Connection\n');

  try {
    // Get account information
    const account = await stripe.accounts.retrieve();
    console.log('✅ Connected to Stripe Account:');
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Type: ${account.type}`);
    console.log(`   Business Name: ${account.business_profile?.name || 'Not set'}`);
    console.log(`   Email: ${account.email || 'Not set'}`);
    
    // Check if we're in test mode
    const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
    console.log(`   Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
    
    console.log('\n🔑 Secret Key Info:');
    console.log(`   Key starts with: ${process.env.STRIPE_SECRET_KEY.substring(0, 10)}...`);
    console.log(`   Key type: ${isTestMode ? 'Test Key' : 'Live Key'}`);
    
    console.log('\n📋 All Products in This Account:');
    const products = await stripe.products.list({ limit: 20 });
    
    if (products.data.length === 0) {
      console.log('❌ No products found in this account.');
      console.log('\n💡 This means:');
      console.log('1. You might be connected to a different Stripe account than where you created the products');
      console.log('2. Or the products were created in a different mode (test vs live)');
      console.log('3. Or the products were deleted');
      
      console.log('\n🔧 Solutions:');
      console.log('1. Double-check you\'re using the correct secret key');
      console.log('2. Make sure you created products in the same mode (test/live)');
      console.log('3. Verify you\'re logged into the correct Stripe account');
      
    } else {
      console.log(`Found ${products.data.length} products:`);
      products.data.forEach((product, index) => {
        console.log(`\n${index + 1}. Product: ${product.name}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Active: ${product.active}`);
        console.log(`   Created: ${new Date(product.created * 1000).toISOString()}`);
        
        // Get prices for this product
        stripe.prices.list({ product: product.id, active: true })
          .then(prices => {
            if (prices.data.length > 0) {
              console.log(`   Prices:`);
              prices.data.forEach(price => {
                const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'Variable';
                const interval = price.recurring?.interval || 'one-time';
                console.log(`     - ${price.id}: ${amount} ${price.currency.toUpperCase()} / ${interval}`);
              });
            } else {
              console.log(`   No active prices found`);
            }
          });
      });
    }
    
    console.log('\n📋 All Active Prices in This Account:');
    const prices = await stripe.prices.list({ active: true, limit: 50 });
    
    if (prices.data.length === 0) {
      console.log('❌ No active prices found in this account.');
    } else {
      console.log(`Found ${prices.data.length} active prices:`);
      prices.data.forEach((price, index) => {
        const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'Variable';
        const interval = price.recurring?.interval || 'one-time';
        console.log(`${index + 1}. ${price.id}: ${amount} ${price.currency.toUpperCase()} / ${interval}`);
      });
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Verify you\'re using the secret key from the same account where you created the products');
    console.log('2. Make sure you created products in TEST mode (not live mode)');
    console.log('3. Check that your products are actually active in Stripe Dashboard');
    console.log('4. If needed, create new products or copy the correct secret key');
    
  } catch (error) {
    console.error('❌ Error connecting to Stripe:', error.message);
    
    if (error.message.includes('Invalid API Key')) {
      console.log('\n💡 Your secret key is invalid. Please check:');
      console.log('1. The key starts with sk_test_ (for test mode) or sk_live_ (for live mode)');
      console.log('2. The key is complete and not truncated');
      console.log('3. The key is from the correct Stripe account');
    }
  }
}

debugStripeConnection().catch(console.error);
