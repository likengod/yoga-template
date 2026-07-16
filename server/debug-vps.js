const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  const logPath = path.join(__dirname, '../public/uploads/db-debug.txt');
  let output = '';
  
  output += `Log time: ${new Date().toISOString()}\n`;
  output += `ADMIN_PASSWORD in process.env: ${process.env.ADMIN_PASSWORD || 'NOT SET'}\n`;
  output += `ADMIN_EMAIL in process.env: ${process.env.ADMIN_EMAIL || 'NOT SET'}\n`;
  output += `SUPERADMIN_PASSWORD in process.env: ${process.env.SUPERADMIN_PASSWORD || 'NOT SET'}\n`;
  
  try {
    const users = await prisma.user.findMany();
    output += `Users count: ${users.length}\n`;
    output += `Users: ${JSON.stringify(users.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role })), null, 2)}\n`;
  } catch (err) {
    output += `Database error: ${err.message}\n${err.stack}\n`;
  }
  
  fs.writeFileSync(logPath, output);
  console.log('VPS Debug info written to:', logPath);
}

main().catch(console.error).finally(() => prisma.$disconnect());
