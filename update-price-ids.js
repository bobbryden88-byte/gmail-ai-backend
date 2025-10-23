#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Stripe Price ID Updater\n');

console.log('Please enter your new Price IDs from Stripe Dashboard:');
console.log('(They should start with "price_")\n');

rl.question('Monthly Price ID: ', (monthlyId) => {
  rl.question('Yearly Price ID: ', (yearlyId) => {
    
    // Validate format
    if (!monthlyId.startsWith('price_') || !yearlyId.startsWith('price_')) {
      console.log('\n❌ Error: Price IDs must start with "price_"');
      rl.close();
      return;
    }

    try {
      // Read current .env file
      const envPath = '.env';
      let envContent = fs.readFileSync(envPath, 'utf8');

      // Update the Price IDs
      envContent = envContent.replace(
        /STRIPE_PREMIUM_MONTHLY_PRICE_ID="[^"]*"/,
        `STRIPE_PREMIUM_MONTHLY_PRICE_ID="${monthlyId}"`
      );
      
      envContent = envContent.replace(
        /STRIPE_PREMIUM_YEARLY_PRICE_ID="[^"]*"/,
        `STRIPE_PREMIUM_YEARLY_PRICE_ID="${yearlyId}"`
      );

      // Write back to file
      fs.writeFileSync(envPath, envContent);

      console.log('\n✅ Price IDs updated successfully!');
      console.log(`Monthly: ${monthlyId}`);
      console.log(`Yearly: ${yearlyId}`);
      
      console.log('\n🧪 Testing the integration...');
      
      // Test the new Price IDs
      require('dotenv').config();
      const Stripe = require('stripe');
      const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

      async function testPrices() {
        try {
          const [monthlyPrice, yearlyPrice] = await Promise.all([
            stripe.prices.retrieve(monthlyId),
            stripe.prices.retrieve(yearlyId)
          ]);

          console.log('\n✅ Price IDs are valid!');
          console.log(`Monthly: $${(monthlyPrice.unit_amount / 100).toFixed(2)} ${monthlyPrice.currency.toUpperCase()}`);
          console.log(`Yearly: $${(yearlyPrice.unit_amount / 100).toFixed(2)} ${yearlyPrice.currency.toUpperCase()}`);
          
          console.log('\n🚀 Your Stripe integration is ready!');
          console.log('Run "npm run dev" to start your backend.');
          
        } catch (error) {
          console.log('\n❌ Error testing Price IDs:', error.message);
        }
      }

      testPrices().finally(() => rl.close());

    } catch (error) {
      console.log('\n❌ Error updating .env file:', error.message);
      rl.close();
    }
  });
});
