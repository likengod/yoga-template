require('dotenv').config({ override: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SEED_IMAGES = [
  {
    title: 'Morning Hatha Practice',
    description: 'Students centering their minds and aligning their breath during the early morning Hatha session.',
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    date: new Date().toISOString(),
    views: 12
  },
  {
    title: 'Outdoor Meditation Circle',
    description: 'Finding inner peace and stillness amidst the calmness of nature.',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    date: new Date().toISOString(),
    views: 24
  },
  {
    title: 'Pranayama Breathwork',
    description: 'Mastering the life force energy through ancient breathing techniques.',
    url: 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&q=80&w=800',
    date: new Date().toISOString(),
    views: 8
  },
  {
    title: 'Advanced Asana Workshop',
    description: 'Deepening our physical practice with alignment, precision, and dedication.',
    url: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=800',
    date: new Date().toISOString(),
    views: 19
  },
  {
    title: 'Kundalini Energy Flow',
    description: 'Awakening the inner energy centers through movement, breath, and sound.',
    url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=800',
    date: new Date().toISOString(),
    views: 15
  },
  {
    title: 'Restorative Alignment',
    description: 'Gentle posture alignments to promote restoration, healing, and recovery.',
    url: 'https://images.unsplash.com/photo-1552288092-7eb5d159dd46?auto=format&fit=crop&q=80&w=800',
    date: new Date().toISOString(),
    views: 31
  },
  {
    title: 'Community Gathering at Ganges',
    description: 'Our yoga family uniting by the banks of the holy river Ganges.',
    url: 'https://images.unsplash.com/photo-1593810451137-5dc5bb44bf8f?auto=format&fit=crop&q=80&w=800',
    date: new Date().toISOString(),
    views: 42
  },
  {
    title: 'Vinyasa Flow Harmony',
    description: 'Graceful transitions and dynamic synchronization of movement and breath.',
    url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=800',
    date: new Date().toISOString(),
    views: 20
  }
];

async function main() {
  console.log('Seeding gallery images...');
  for (const img of SEED_IMAGES) {
    await prisma.galleryImage.create({
      data: img
    });
  }
  console.log('Gallery images seeded successfully!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
