const { PrismaClient } = require('@prisma/client');

async function resetDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🗑️  Dropping existing schema...');
    
    // Drop all tables
    await prisma.$executeRawUnsafe('DROP SCHEMA public CASCADE;');
    await prisma.$executeRawUnsafe('CREATE SCHEMA public;');
    
    console.log('✅ Schema reset successfully!');
    console.log('Now run: npx prisma migrate deploy');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();

