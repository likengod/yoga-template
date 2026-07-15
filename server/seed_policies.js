require('dotenv').config({ override: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const policies = [
    { type: 'privacy', title: 'Privacy Policy', content: '<h2>Information We Collect</h2><p>Your privacy is important to us. This policy explains how we collect and use data...</p>' },
    { type: 'terms', title: 'Terms & Conditions', content: '<h2>Terms of Service</h2><p>Please read these terms carefully before using our services...</p>' },
    { type: 'refund', title: 'Refund Policy', content: '<h2>Our Refund Policy</h2><p>Clear and fair refund guidelines for our students...</p>' },
    { type: 'cookies', title: 'Cookies Policy', content: '<h2>How We Use Cookies</h2><p>We use cookies to improve your experience...</p>' }
  ];
  for (const p of policies) {
    await prisma.policyPage.upsert({
      where: { type: p.type },
      update: {},
      create: p
    });
    console.log('Seeded ' + p.type);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
