#!/usr/bin/env node

require('dotenv').config();
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function useExistingPrices() {
  console.log('🔍 Finding Existing Prices to Use\n');

  try {
    // Get all active prices
    const prices = await stripe.prices.list({ active: true, limit: 20 });
    
    if (prices.data.length === 0) {
      console.log('❌ No active prices found. Please create products in Stripe Dashboard first.');
      return;
    }

    console.log('📋 Available Prices:');
    prices.data.forEach((price, index) => {
      const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'Variable';
      const interval = price.recurring?.interval || 'one-time';
      console.log(`${index + 1}. ${price.id}: ${amount} ${price.currency.toUpperCase()} / ${interval}`);
    });

    // Try to find a monthly and yearly price
    const monthlyPrice = prices.data.find(p => p.recurring?.interval === 'month');
    const yearlyPrice = prices.data.find(p => p.recurring?.interval === 'year');

    console.log('\n🎯 Recommended Setup:');
    
    if (monthlyPrice) {
      console.log(`Monthly Price ID: ${monthlyPrice.id}`);
      console.log(`   Amount: $${(monthlyPrice.unit_amount / 100).toFixed(2)} ${monthlyPrice.currency.toUpperCase()}`);
    } else {
      console.log('❌ No monthly price found. Create a monthly product.');
    }

    if (yearlyPrice) {
      console.log(`Yearly Price ID: ${yearlyPrice.id}`);
      console.log(`   Amount: $${(yearlyPrice.unit_amount / 100).toFixed(2)} ${yearlyPrice.currency.toUpperCase()}`);
    } else {
      console.log('❌ No yearly price found. Create a yearly product.');
    }

    console.log('\n📝 Update your .env file with these Price IDs:');
    if (monthlyPrice && yearlyPrice) {
      console.log(`STRIPE_PREMIUM_MONTHLY_PRICE_ID="${monthlyPrice.id}"`);
      console.log(`STRIPE_PREMIUM_YEARLY_PRICE_ID="${yearlyPrice.id}"`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

useExistingPrices().catch(console.error);
