const { Client } = require('pg');
require('dotenv').config();

async function resetDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('🔌 Connected to Neon database');
    
    console.log('🗑️  Dropping all tables...');
    
    // Drop the _prisma_migrations table
    await client.query('DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;');
    
    // Drop the users table if it exists
    await client.query('DROP TABLE IF EXISTS "users" CASCADE;');
    
    console.log('✅ All tables dropped successfully!');
    console.log('✨ Database is now clean and ready for fresh migrations');
    console.log('\nNext steps:');
    console.log('1. Commit and push your changes');
    console.log('2. Vercel will run the migrations');
    console.log('3. Registration will work!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

resetDatabase();

