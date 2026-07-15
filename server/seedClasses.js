require('dotenv').config({ override: true });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SEED_CLASSES = [
  {
    title: 'Hatha Yoga',
    instructor: 'Priya Sharma',
    classStarting: 'Every Monday & Wednesday, 7:00 AM',
    description: 'A traditional and foundational practice that focuses on physical postures and breathing techniques. Perfect for aligning and calming your body, mind, and spirit.',
    price: '₹1000/session',
    duration: '60 minutes',
    capacity: '15',
    schedule: 'Mon, Wed 7:00 AM',
    level: 'All Levels',
    rating: 4.8,
    features: JSON.stringify(['Breath control (Pranayama)', 'Posture alignment', 'Relaxation']),
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    joinLink: '',
    maxSeats: 15,
    availableSeats: 5,
    featured: true
  },
  {
    title: 'Ashtanga Yoga',
    instructor: 'Arjun Patel',
    classStarting: 'Every Tuesday & Thursday, 6:30 AM',
    description: 'A vigorous and highly structured practice syncing breath with progressive, continuous postures. Ideal for building internal heat, strength, and flexibility.',
    price: '₹1200/session',
    duration: '75 minutes',
    capacity: '12',
    schedule: 'Tue, Thu 6:30 AM',
    level: 'Intermediate',
    rating: 4.9,
    features: JSON.stringify(['Vinyasa flow', 'Strength building', 'Discipline']),
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    joinLink: '',
    maxSeats: 12,
    availableSeats: 3,
    featured: true
  },
  {
    title: 'Vinyasa Flow',
    instructor: 'Ananya Singh',
    classStarting: 'Every Friday, 6:00 PM',
    description: 'A dynamic, fluid style connecting movement and breath together like a dance. Helps in increasing heart rate and burning calories.',
    price: '₹1100/session',
    duration: '60 minutes',
    capacity: '20',
    schedule: 'Fri 6:00 PM',
    level: 'All Levels',
    rating: 4.7,
    features: JSON.stringify(['Cardio intensive', 'Fluid movements', 'Stress relief']),
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=800',
    joinLink: '',
    maxSeats: 20,
    availableSeats: 8,
    featured: true
  },
  {
    title: 'Meditation Session',
    instructor: 'Dr. Rohan Desai',
    classStarting: 'Every Sunday, 8:00 AM',
    description: 'A guided meditation journey designed to quiet the mind, reduce stress, and cultivate inner peace. Great for mental clarity.',
    price: '₹800/session',
    duration: '45 minutes',
    capacity: '25',
    schedule: 'Sun 8:00 AM',
    level: 'Beginner',
    rating: 4.9,
    features: JSON.stringify(['Mindfulness', 'Stress reduction', 'Guided visualization']),
    image: 'https://images.unsplash.com/photo-1522845015757-50bce044e5da?auto=format&fit=crop&q=80&w=800',
    joinLink: '',
    maxSeats: 25,
    availableSeats: 12,
    featured: false
  },
  {
    title: 'Pranayama Workshop',
    instructor: 'Dr. Lakshmi Menon',
    classStarting: 'Every Saturday, 9:00 AM',
    description: 'Learn ancient yogic breathing techniques to control your life force, improve lung capacity, and energize your entire system.',
    price: '₹900/session',
    duration: '60 minutes',
    capacity: '15',
    schedule: 'Sat 9:00 AM',
    level: 'All Levels',
    rating: 4.8,
    features: JSON.stringify(['Breath mastery', 'Energy balance', 'Respiratory health']),
    image: 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&q=80&w=800',
    joinLink: '',
    maxSeats: 15,
    availableSeats: 5,
    featured: false
  },
  {
    title: 'Beginners Class',
    instructor: 'Meera Reddy',
    classStarting: 'Every Mon & Wed, 5:00 PM',
    description: 'Perfect for absolute beginners. We break down the fundamental poses, alignment, and basic breathing techniques at a gentle pace.',
    price: '₹800/session',
    duration: '60 minutes',
    capacity: '15',
    schedule: 'Mon, Wed 5:00 PM',
    level: 'Beginner',
    rating: 4.9,
    features: JSON.stringify(['Basic postures', 'Gentle pace', 'Foundation building']),
    image: 'https://images.unsplash.com/photo-1574689211272-bc1550ce15f5?auto=format&fit=crop&q=80&w=800',
    joinLink: '',
    maxSeats: 15,
    availableSeats: 10,
    featured: false
  },
  {
    title: 'Advance Practice',
    instructor: 'Vikram Mehta',
    classStarting: 'Every Tue & Thu, 5:30 PM',
    description: 'For experienced yogis looking to deepen their practice with complex postures, inversions, and advanced breathing and meditation techniques.',
    price: '₹1500/session',
    duration: '90 minutes',
    capacity: '10',
    schedule: 'Tue, Thu 5:30 PM',
    level: 'Advanced',
    rating: 4.9,
    features: JSON.stringify(['Inversions', 'Arm balances', 'Deep flexibility']),
    image: 'https://images.unsplash.com/photo-1552288092-7eb5d159dd46?auto=format&fit=crop&q=80&w=800',
    joinLink: '',
    maxSeats: 10,
    availableSeats: 2,
    featured: false
  }
];

async function main() {
  console.log('Seeding classes...');
  for (const cls of SEED_CLASSES) {
    await prisma.onlineClass.create({
      data: cls
    });
  }
  console.log('Classes seeded successfully!');
}

main()
  .then(() => {
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
