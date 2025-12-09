const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
  try {
    // Try to query with googleId
    const users = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('googleId', 'authProvider')
      ORDER BY column_name;
    `;
    console.log('Database columns found:', users);
    
    // Try a simple query
    const count = await prisma.user.count();
    console.log('Total users:', count);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
