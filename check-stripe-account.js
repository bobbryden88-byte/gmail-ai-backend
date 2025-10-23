#!/usr/bin/env node

require('dotenv').config();
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function checkStripeAccount() {
  console.log('🔍 Checking Your Stripe Account\n');

  try {
    // Check if we can connect to Stripe
    console.log('Testing Stripe connection...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Connected to Stripe successfully!');
    console.log(`Account ID: ${account.id}`);
    console.log(`Country: ${account.country}`);
    console.log(`Type: ${account.type}`);
    
    // Check if we're in test mode
    const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
    console.log(`Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
    
    if (!isTestMode) {
      console.log('⚠️  WARNING: You are using LIVE keys! Make sure this is intentional.');
    }
    
    console.log('\n📋 All Products in Your Account:');
    const products = await stripe.products.list({ limit: 20 });
    
    if (products.data.length === 0) {
      console.log('❌ No products found. You need to create products first.');
      console.log('\n📝 How to create products:');
      console.log('1. Go to https://dashboard.stripe.com');
      console.log('2. Click "Products" in the sidebar');
      console.log('3. Click "+ Add product"');
      console.log('4. Create your monthly and yearly products');
      console.log('5. Copy the Price IDs from each product');
    } else {
      console.log(`Found ${products.data.length} products:`);
      products.data.forEach((product, index) => {
        console.log(`\n${index + 1}. Product: ${product.name}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Active: ${product.active ? 'Yes' : 'No'}`);
        
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
    
    console.log('\n📋 All Active Prices:');
    const prices = await stripe.prices.list({ active: true, limit: 20 });
    
    if (prices.data.length === 0) {
      console.log('❌ No active prices found.');
    } else {
      console.log(`Found ${prices.data.length} active prices:`);
      prices.data.forEach((price, index) => {
        const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'Variable';
        const interval = price.recurring?.interval || 'one-time';
        console.log(`${index + 1}. ${price.id}: ${amount} ${price.currency.toUpperCase()} / ${interval}`);
      });
      
      console.log('\n💡 Copy any of these Price IDs to use in your .env file:');
      const monthlyPrices = prices.data.filter(p => p.recurring?.interval === 'month');
      const yearlyPrices = prices.data.filter(p => p.recurring?.interval === 'year');
      
      if (monthlyPrices.length > 0) {
        console.log('\nMonthly Prices:');
        monthlyPrices.forEach(price => {
          const amount = `$${(price.unit_amount / 100).toFixed(2)}`;
          console.log(`  STRIPE_PREMIUM_MONTHLY_PRICE_ID="${price.id}"  # ${amount} ${price.currency.toUpperCase()}`);
        });
      }
      
      if (yearlyPrices.length > 0) {
        console.log('\nYearly Prices:');
        yearlyPrices.forEach(price => {
          const amount = `$${(price.unit_amount / 100).toFixed(2)}`;
          console.log(`  STRIPE_PREMIUM_YEARLY_PRICE_ID="${price.id}"  # ${amount} ${price.currency.toUpperCase()}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error connecting to Stripe:', error.message);
    
    if (error.message.includes('Invalid API Key')) {
      console.log('\n💡 Solution: Check your STRIPE_SECRET_KEY in .env file');
      console.log('Make sure it starts with sk_test_ (for test mode) or sk_live_ (for live mode)');
    } else if (error.message.includes('No such price')) {
      console.log('\n💡 Solution: The Price IDs you copied might be from a different account or mode');
    }
  }
}

checkStripeAccount().catch(console.error);
