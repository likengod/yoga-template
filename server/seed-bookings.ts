import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const classTypes = [
  'Hatha Yoga',
  'Ashtanga Yoga',
  'Vinyasa Flow',
  'Meditation Session',
  'Pranayama Workshop',
  'Beginners Class',
  'Advanced Practice'
];

const names = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Williams', 'Charlie Brown', 'Diana Prince', 'Eve Adams', 'Frank Castle', 'Grace Hopper', 'Hank Pym'];

function randomDateInLast30Days() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date;
}

async function seed() {
  console.log('Seeding 25 dummy bookings...');
  
  for (let i = 0; i < 25; i++) {
    const bookingDate = randomDateInLast30Days();
    // Preferred date as a string YYYY-MM-DD
    const preferredDate = bookingDate.toISOString().split('T')[0];
    
    await prisma.booking.create({
      data: {
        name: names[Math.floor(Math.random() * names.length)],
        email: `dummy${i}@example.com`,
        phone: `+1555010${i.toString().padStart(2, '0')}`,
        class_type: classTypes[Math.floor(Math.random() * classTypes.length)],
        experience: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        preferred_date: preferredDate,
        preferred_time: '10:00 AM - 11:00 AM',
        special_requests: i % 3 === 0 ? 'I have a lower back injury.' : '',
        status: ['pending', 'confirmed', 'cancelled'][Math.floor(Math.random() * 3)],
        created_at: bookingDate // Mock created_at to also span the last 30 days
      }
    });
  }
  
  console.log('Successfully seeded 25 bookings.');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
