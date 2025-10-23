#!/usr/bin/env node

require('dotenv').config();
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function verifyStripeAccount() {
  console.log('🔍 Verifying Your Stripe Account Connection\n');

  try {
    // Get account information
    const account = await stripe.accounts.retrieve();
    
    console.log('✅ SUCCESSFULLY CONNECTED TO STRIPE ACCOUNT:');
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Email: ${account.email}`);
    console.log(`   Business Name: ${account.business_profile?.name || 'Not set'}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Mode: ${process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE'}`);
    
    console.log('\n📋 CURRENT PRODUCTS IN THIS ACCOUNT:');
    const products = await stripe.products.list({ limit: 20 });
    
    if (products.data.length === 0) {
      console.log('❌ NO PRODUCTS FOUND');
      console.log('\n🎯 THIS IS THE PROBLEM!');
      console.log('You need to create products in THIS specific account:');
      console.log(`   Email: ${account.email}`);
      console.log(`   Account ID: ${account.id}`);
      
      console.log('\n📝 TO FIX THIS:');
      console.log('1. Go to https://dashboard.stripe.com');
      console.log('2. Make sure you\'re logged in with:', account.email);
      console.log('3. Make sure you\'re in TEST mode (toggle in top right)');
      console.log('4. Click "Products" → "+ Add product"');
      console.log('5. Create your monthly and yearly products');
      console.log('6. Copy the Price IDs from the products you just created');
      
    } else {
      console.log(`Found ${products.data.length} products:`);
      products.data.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   Product ID: ${product.id}`);
        console.log(`   Active: ${product.active}`);
        
        // Get prices for this product
        stripe.prices.list({ product: product.id, active: true })
          .then(prices => {
            if (prices.data.length > 0) {
              console.log(`   Price IDs:`);
              prices.data.forEach(price => {
                const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'Variable';
                const interval = price.recurring?.interval || 'one-time';
                console.log(`     ${price.id}: ${amount} ${price.currency.toUpperCase()} / ${interval}`);
              });
            } else {
              console.log(`   No active prices found`);
            }
          });
      });
      
      console.log('\n💡 COPY THESE PRICE IDs TO YOUR .env FILE:');
      const prices = await stripe.prices.list({ active: true, limit: 20 });
      const monthlyPrices = prices.data.filter(p => p.recurring?.interval === 'month');
      const yearlyPrices = prices.data.filter(p => p.recurring?.interval === 'year');
      
      if (monthlyPrices.length > 0) {
        console.log('\nMonthly Prices:');
        monthlyPrices.forEach(price => {
          const amount = `$${(price.unit_amount / 100).toFixed(2)}`;
          console.log(`STRIPE_PREMIUM_MONTHLY_PRICE_ID="${price.id}"  # ${amount} ${price.currency.toUpperCase()}`);
        });
      }
      
      if (yearlyPrices.length > 0) {
        console.log('\nYearly Prices:');
        yearlyPrices.forEach(price => {
          const amount = `$${(price.unit_amount / 100).toFixed(2)}`;
          console.log(`STRIPE_PREMIUM_YEARLY_PRICE_ID="${price.id}"  # ${amount} ${price.currency.toUpperCase()}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ ERROR CONNECTING TO STRIPE:', error.message);
    
    if (error.message.includes('Invalid API Key')) {
      console.log('\n💡 YOUR SECRET KEY IS INVALID');
      console.log('Please check your STRIPE_SECRET_KEY in .env file');
    }
  }
}

verifyStripeAccount().catch(console.error);
