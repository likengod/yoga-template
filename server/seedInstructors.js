require('dotenv').config({ override: true });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SEED_INSTRUCTORS = [
  {
    name: 'Priya Sharma',
    title: 'Lead Hatha Yoga Instructor',
    specialization: 'Hatha Yoga & Alignment',
    experience: '12 Years',
    certifications: JSON.stringify(['E-RYT 500', 'YACEP', 'Ayurvedic Wellness Coach']),
    rating: 4.9,
    students: '500+',
    description: 'Priya has been practicing Hatha Yoga for over a decade. Her classes focus on mindful movement, breath awareness, and finding balance. She brings a calm, nurturing energy to all sessions.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    email: 'priya@shaktiyoga.com',
    phone: '+91 9876543210',
    featured: true
  },
  {
    name: 'Arjun Patel',
    title: 'Ashtanga Specialist',
    specialization: 'Ashtanga Vinyasa & Power Yoga',
    experience: '10 Years',
    certifications: JSON.stringify(['RYT 500', 'Ashtanga Authorized Level 1']),
    rating: 4.8,
    students: '400+',
    description: 'Arjun trained extensively in Mysore, the birthplace of Ashtanga. He brings discipline, strength building, and deep philosophical knowledge to his rigorous morning classes.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    email: 'arjun@shaktiyoga.com',
    phone: '+91 9876543211',
    featured: true
  },
  {
    name: 'Ananya Singh',
    title: 'Vinyasa Flow Teacher',
    specialization: 'Dynamic Vinyasa & Mobility',
    experience: '8 Years',
    certifications: JSON.stringify(['RYT 200', 'Movement Therapy Certification']),
    rating: 4.7,
    students: '300+',
    description: 'Ananya blends her background in classical dance with modern Vinyasa flow. Her classes are creative, heart-pumping, and designed to help you discover the joy of movement.',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=800',
    email: 'ananya@shaktiyoga.com',
    phone: '+91 9876543212',
    featured: true
  },
  {
    name: 'Dr. Rohan Desai',
    title: 'Meditation Guide',
    specialization: 'Mindfulness & Yoga Nidra',
    experience: '15 Years',
    certifications: JSON.stringify(['PhD in Psychology', 'Certified Mindfulness Instructor']),
    rating: 4.9,
    students: '1000+',
    description: 'Dr. Rohan combines clinical psychology with ancient yogic meditation techniques. His sessions are a sanctuary for those looking to relieve stress, anxiety, and mental fatigue.',
    image: 'https://images.unsplash.com/photo-1522845015757-50bce044e5da?auto=format&fit=crop&q=80&w=800',
    email: 'rohan@shaktiyoga.com',
    phone: '+91 9876543213',
    featured: false
  },
  {
    name: 'Dr. Lakshmi Menon',
    title: 'Pranayama Expert',
    specialization: 'Breathwork & Therapy',
    experience: '20 Years',
    certifications: JSON.stringify(['BAMS (Ayurveda)', 'Advanced Breathwork Coach']),
    rating: 4.8,
    students: '800+',
    description: 'Dr. Lakshmi uses breath as a tool for physical healing and emotional release. Her Pranayama workshops are deeply transformative and accessible to all ages.',
    image: 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&q=80&w=800',
    email: 'lakshmi@shaktiyoga.com',
    phone: '+91 9876543214',
    featured: false
  },
  {
    name: 'Meera Reddy',
    title: 'Beginners Yoga Instructor',
    specialization: 'Foundations & Restorative',
    experience: '6 Years',
    certifications: JSON.stringify(['RYT 200', 'Trauma-Informed Yoga']),
    rating: 4.9,
    students: '200+',
    description: 'Meera specializes in making yoga approachable for complete beginners. With her gentle guidance, new students can build confidence and a strong physical foundation.',
    image: 'https://images.unsplash.com/photo-1574689211272-bc1550ce15f5?auto=format&fit=crop&q=80&w=800',
    email: 'meera@shaktiyoga.com',
    phone: '+91 9876543215',
    featured: false
  },
  {
    name: 'Vikram Mehta',
    title: 'Advanced Practice Coach',
    specialization: 'Inversions & Arm Balances',
    experience: '14 Years',
    certifications: JSON.stringify(['E-RYT 500', 'Gymnastics Bodies Certified']),
    rating: 4.9,
    students: '600+',
    description: 'For those looking to defy gravity, Vikram breaks down complex inversions and arm balances with incredible precision, safety, and a touch of humor.',
    image: 'https://images.unsplash.com/photo-1552288092-7eb5d159dd46?auto=format&fit=crop&q=80&w=800',
    email: 'vikram@shaktiyoga.com',
    phone: '+91 9876543216',
    featured: false
  },
  {
    name: 'Aisha Khan',
    title: 'Prenatal & Postnatal Expert',
    specialization: 'Women’s Health & Prenatal Yoga',
    experience: '9 Years',
    certifications: JSON.stringify(['RPYT', 'Doula Certified']),
    rating: 5.0,
    students: '250+',
    description: 'Aisha provides a safe and supportive space for expecting and new mothers. Her classes focus on preparing the body for birth and aiding postpartum recovery.',
    image: 'https://images.unsplash.com/photo-1593810451137-5dc5bb44bf8f?auto=format&fit=crop&q=80&w=800',
    email: 'aisha@shaktiyoga.com',
    phone: '+91 9876543217',
    featured: false
  },
  {
    name: 'Siddharth Rao',
    title: 'Iyengar Yoga Teacher',
    specialization: 'Alignment & Props Therapy',
    experience: '11 Years',
    certifications: JSON.stringify(['Certified Iyengar Yoga Teacher (CIYT)']),
    rating: 4.8,
    students: '350+',
    description: 'Siddharth uses props like blocks, straps, and chairs to help students of all ages achieve perfect alignment and therapeutic benefits from their practice.',
    image: 'https://images.unsplash.com/photo-1566501206188-5dd0cf160a0e?auto=format&fit=crop&q=80&w=800',
    email: 'siddharth@shaktiyoga.com',
    phone: '+91 9876543218',
    featured: false
  },
  {
    name: 'Kavita Iyer',
    title: 'Sound Healing Therapist',
    specialization: 'Nada Yoga & Sound Baths',
    experience: '7 Years',
    certifications: JSON.stringify(['Certified Sound Healer', 'RYT 200']),
    rating: 4.9,
    students: '450+',
    description: 'Kavita uses Tibetan singing bowls, gongs, and vocal toning to create deeply immersive sound baths that recalibrate the nervous system and clear energy blocks.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800',
    email: 'kavita@shaktiyoga.com',
    phone: '+91 9876543219',
    featured: false
  }
];

async function main() {
  console.log('Seeding instructors...');
  for (const instructor of SEED_INSTRUCTORS) {
    const handle = instructor.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    await prisma.instructor.create({
      data: {
        ...instructor,
        instagram: `https://instagram.com/${handle}`,
        facebook: `https://facebook.com/${handle}`,
        linkedin: `https://linkedin.com/in/${handle}`,
        twitter: `https://twitter.com/${handle}`,
        tiktok: `https://tiktok.com/@${handle}`
      }
    });
  }
  console.log('10 Instructors seeded successfully!');
}

main()
  .then(() => {
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
