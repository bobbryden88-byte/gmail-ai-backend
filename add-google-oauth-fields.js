const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function addGoogleOAuthFields() {
  try {
    console.log('🔄 Adding Google OAuth fields to users table...');
    
    // Check if using SQLite or PostgreSQL
    const dbUrl = process.env.DATABASE_URL || '';
    const isSQLite = dbUrl.startsWith('file:');
    
    if (isSQLite) {
      console.log('📦 Detected SQLite database');
      
      // SQLite syntax
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN googleId TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN authProvider TEXT;
      `;
      
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS users_googleId_unique ON users(googleId);
      `;
      
    } else {
      console.log('📦 Detected PostgreSQL database');
      
      // PostgreSQL syntax
      await prisma.$executeRaw`
        ALTER TABLE "users" 
        ADD COLUMN IF NOT EXISTS "googleId" TEXT,
        ADD COLUMN IF NOT EXISTS "authProvider" TEXT;
      `;
      
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "users_googleId_idx" ON "users"("googleId");
      `;
    }
    
    console.log('✅ Successfully added googleId and authProvider fields!');
    console.log('✅ Created unique index on googleId');
    
  } catch (error) {
    if (error.message.includes('duplicate column') || 
        error.message.includes('already exists')) {
      console.log('⚠️  Columns already exist. Skipping...');
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

addGoogleOAuthFields()
  .then(() => {
    console.log('\n✅ Database update complete!');
    console.log('📝 Next: Run "npx prisma generate" to update Prisma client');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
