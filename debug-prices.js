#!/usr/bin/env node

require('dotenv').config();
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function debugPrices() {
  console.log('🔍 Debugging Stripe Price IDs\n');

  const monthlyPriceId = process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID;
  const yearlyPriceId = process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID;

  console.log('Testing Monthly Price ID:', monthlyPriceId);
  try {
    const monthlyPrice = await stripe.prices.retrieve(monthlyPriceId);
    console.log('✅ Monthly Price Found:');
    console.log(`   Amount: $${(monthlyPrice.unit_amount / 100).toFixed(2)} ${monthlyPrice.currency.toUpperCase()}`);
    console.log(`   Interval: ${monthlyPrice.recurring.interval}`);
    console.log(`   Product: ${monthlyPrice.product}`);
  } catch (error) {
    console.log('❌ Monthly Price Error:', error.message);
  }

  console.log('\nTesting Yearly Price ID:', yearlyPriceId);
  try {
    const yearlyPrice = await stripe.prices.retrieve(yearlyPriceId);
    console.log('✅ Yearly Price Found:');
    console.log(`   Amount: $${(yearlyPrice.unit_amount / 100).toFixed(2)} ${yearlyPrice.currency.toUpperCase()}`);
    console.log(`   Interval: ${yearlyPrice.recurring.interval}`);
    console.log(`   Product: ${yearlyPrice.product}`);
  } catch (error) {
    console.log('❌ Yearly Price Error:', error.message);
  }

  console.log('\n📋 All Active Prices in Your Account:');
  try {
    const prices = await stripe.prices.list({ active: true, limit: 10 });
    console.log('Active Prices:');
    prices.data.forEach(price => {
      console.log(`   ${price.id}: $${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()} / ${price.recurring?.interval || 'one-time'}`);
    });
  } catch (error) {
    console.log('❌ Error listing prices:', error.message);
  }
}

debugPrices().catch(console.error);
