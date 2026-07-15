// Course data service - uses localStorage as fallback when backend unavailable

export interface CourseVideo {
  id: string;
  title: string;
  description: string;
  source: string; // URL (Google Drive embed, server URL, YouTube embed, etc.)
  duration: string; // e.g. "45 mins"
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  price: number;         // INR price
  priceUSD?: number;     // USD price (for international users)
  thumbnail: string;
  instructor: string;
  duration: string; // e.g. "6 hours"
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  videos: CourseVideo[];
  category: string;
  published: boolean;
  featured?: boolean;    // featured courses show first in listing
  createdAt: string;
  enrolledCount: number;
  rating: number;
  includes: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export const dummyCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Yoga for Beginners – Complete Foundation',
    description: 'Start your yoga journey from scratch with expert guidance on postures, breathing and mindfulness.',
    longDescription: 'This comprehensive beginner course takes you from zero experience to a solid yoga foundation. You will learn the 20 most essential yoga postures, pranayama breathing techniques, meditation basics, and how to build a sustainable daily practice. Each video builds on the last — watch in order to get the full benefit.',
    price: 1499,
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    instructor: 'Sushmita Debnath',
    duration: '4.5 hours',
    level: 'Beginner',
    category: 'Foundation',
    published: true,
    createdAt: '2024-01-15',
    enrolledCount: 248,
    rating: 4.8,
    includes: ['7 HD video lessons', 'Lifetime access', 'Beginner-friendly', 'Certificate on completion'],
    videos: [
      { id: 'v1-1', title: 'Part 1 – Welcome & Yoga Basics', description: 'Introduction to yoga philosophy, what to expect and setting up your space.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '18 mins', order: 1 },
      { id: 'v1-2', title: 'Part 2 – Breathing & Pranayama', description: 'Master the foundational breathing techniques that power every yoga practice.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '22 mins', order: 2 },
      { id: 'v1-3', title: 'Part 3 – Standing Postures', description: 'Learn Mountain Pose, Warrior I & II, Triangle, and more.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '35 mins', order: 3 },
      { id: 'v1-4', title: 'Part 4 – Seated & Floor Postures', description: 'Explore seated forward bends, twists, and relaxation poses.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '30 mins', order: 4 },
      { id: 'v1-5', title: 'Part 5 – Core & Balance', description: 'Build core strength and balance with targeted flows.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '28 mins', order: 5 },
      { id: 'v1-6', title: 'Part 6 – Meditation & Mindfulness', description: 'Guided meditation to close your practice and cultivate inner peace.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '20 mins', order: 6 },
      { id: 'v1-7', title: 'Part 7 – Building Your Daily Practice', description: 'How to create a sustainable home yoga routine that lasts.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '15 mins', order: 7 },
    ]
  },
  {
    id: 'course-2',
    title: 'Power Vinyasa Flow – Intermediate Series',
    description: 'Dynamic flowing sequences to build strength, flexibility and stamina. Take your practice to the next level.',
    longDescription: 'This intermediate Vinyasa series is designed for practitioners with at least 3 months of yoga experience. You will move through dynamic sun salutations, arm balances, backbends, and inversions. The sequential structure ensures you progressively build the strength and flexibility required for advanced poses safely.',
    price: 2499,
    thumbnail: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=600&q=80',
    instructor: 'Sushmita Debnath',
    duration: '6 hours',
    level: 'Intermediate',
    category: 'Vinyasa',
    published: true,
    createdAt: '2024-02-10',
    enrolledCount: 134,
    rating: 4.9,
    includes: ['10 HD video lessons', 'Lifetime access', 'PDF pose guide', 'Certificate on completion'],
    videos: [
      { id: 'v2-1', title: 'Part 1 – Warm-Up & Sun Salutations', description: 'Dynamic warm-up flows and classical Surya Namaskar A & B.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '40 mins', order: 1 },
      { id: 'v2-2', title: 'Part 2 – Standing Power Sequence', description: 'Warrior flows, lunges, and balance challenges.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '45 mins', order: 2 },
      { id: 'v2-3', title: 'Part 3 – Core Power', description: 'Intense core work including Boat Pose, Plank variations, and more.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '38 mins', order: 3 },
      { id: 'v2-4', title: 'Part 4 – Arm Balances', description: 'Learn Crow Pose, Side Crow, and preparation for handstands.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '50 mins', order: 4 },
      { id: 'v2-5', title: 'Part 5 – Backbends & Heart Openers', description: 'Camel, Wheel, and deep backbend progressions.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '42 mins', order: 5 },
    ]
  },
  {
    id: 'course-3',
    title: 'Meditation & Mindfulness Mastery',
    description: '30-day guided meditation program to reduce stress, improve focus and find lasting inner peace.',
    longDescription: 'This 30-day program is designed to transform your relationship with your mind. Starting with just 5 minutes a day and gradually building to 30-minute sessions, you will explore breath meditation, body scan, loving-kindness, visualization, and silent sitting practices. Perfect for both beginners and those looking to deepen their meditation.',
    price: 999,
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    instructor: 'Sushmita Debnath',
    duration: '3 hours',
    level: 'All Levels',
    category: 'Meditation',
    published: true,
    createdAt: '2024-03-05',
    enrolledCount: 312,
    rating: 4.7,
    includes: ['6 guided meditations', 'Daily practice journal PDF', 'Lifetime access', 'All levels welcome'],
    videos: [
      { id: 'v3-1', title: 'Part 1 – Introduction to Meditation', description: 'What meditation is, what it is not, and how to begin.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '25 mins', order: 1 },
      { id: 'v3-2', title: 'Part 2 – Breath Awareness Practice', description: 'The most fundamental meditation: anchor your mind with the breath.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '30 mins', order: 2 },
      { id: 'v3-3', title: 'Part 3 – Body Scan & Deep Relaxation', description: 'Release tension from every part of your body with this guided scan.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '35 mins', order: 3 },
      { id: 'v3-4', title: 'Part 4 – Loving-Kindness (Metta)', description: 'Cultivate compassion and love for yourself and others.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '28 mins', order: 4 },
      { id: 'v3-5', title: 'Part 5 – Visualization Meditation', description: 'Use guided imagery to achieve your goals and calm your mind.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '32 mins', order: 5 },
      { id: 'v3-6', title: 'Part 6 – Silent Sitting & Integration', description: 'Advanced silent practice and how to maintain your meditation journey.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '40 mins', order: 6 },
    ]
  },
  {
    id: 'course-4',
    title: 'Yin Yoga & Deep Relaxation',
    description: 'Slow down, release deep physical tension, and soothe your nervous system with passive postures.',
    longDescription: 'Yin Yoga targets the deep connective tissues—fascia, ligaments, joints, and bones. This slow, meditative practice involves holding postures for 3 to 5 minutes, allowing you to turn inward and access deeper layers of body and mind. Recommended for anyone looking to reduce stiffness and balance active lifestyles.',
    price: 1299,
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    instructor: 'Sushmita Debnath',
    duration: '5 hours',
    level: 'Beginner',
    category: 'Yin Yoga',
    published: true,
    createdAt: '2024-03-20',
    enrolledCount: 189,
    rating: 4.8,
    includes: ['6 passive lessons', 'Joint health guides', 'Relaxation techniques', 'Lifetime access'],
    videos: [
      { id: 'v4-1', title: 'Part 1 – Introduction to Yin Principles', description: 'Understanding the target areas and safe limits of stretching.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '30 mins', order: 1 },
      { id: 'v4-2', title: 'Part 2 – Hip Openers and Spine Release', description: 'Targeting lower back stiffness and tight glute muscles.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '45 mins', order: 2 },
      { id: 'v4-3', title: 'Part 3 – Upper Body Yin Sequence', description: 'Releasing shoulder tension, neck fatigue, and opening the chest.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '40 mins', order: 3 },
    ]
  },
  {
    id: 'course-5',
    title: 'Kundalini Yoga & Chakra Awakening',
    description: 'Activate your life force energy with dynamic postures, breath keys, mantras, and meditations.',
    longDescription: 'Explore the technology of Kundalini Yoga. This course guides you through specific Kriyas (posture sequences), pranayama techniques, and sacred chants designed to balance your energy channels (nadis) and align the seven major chakra centers. Perfect for expanding your consciousness and vitality.',
    price: 1999,
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    instructor: 'Sushmita Debnath',
    duration: '8 hours',
    level: 'Intermediate',
    category: 'Kundalini',
    published: true,
    createdAt: '2024-04-01',
    enrolledCount: 145,
    rating: 4.9,
    includes: ['8 powerful kriyas', 'Chakra mapping handbook', 'Mantra audio guides', 'Lifetime access'],
    videos: [
      { id: 'v5-1', title: 'Part 1 – Intro to Kundalini Energy', description: 'Setting intentions, Adi Mantra tuning in, and basic breathing patterns.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '35 mins', order: 1 },
      { id: 'v5-2', title: 'Part 2 – Lower Triangle Activation', description: 'Kriya for balancing the Root, Sacral, and Solar Plexus chakras.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '55 mins', order: 2 },
      { id: 'v5-3', title: 'Part 3 – Opening the Heart Center', description: 'Pranayama and movement to invoke love, compassion, and healing.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '45 mins', order: 3 },
    ]
  },
  {
    id: 'course-6',
    title: 'Yoga Anatomy & Alignment Mastery',
    description: 'Master the biomechanics of yoga asanas to prevent injuries and optimize alignment.',
    longDescription: 'Deepen your anatomical awareness with this masterclass. Designed for serious practitioners and aspiring teachers, you will study core muscular engagement, joint stabilization, skeletal variations, and optimal adjustments for standard poses to maximize benefits and avoid strain.',
    price: 2999,
    thumbnail: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=600&q=80',
    instructor: 'Sushmita Debnath',
    duration: '10 hours',
    level: 'Advanced',
    category: 'Anatomy',
    published: true,
    createdAt: '2024-04-15',
    enrolledCount: 92,
    rating: 4.9,
    includes: ['12 anatomical modules', 'Alignment PDFs', 'Injury avoidance guides', 'Certificate on completion'],
    videos: [
      { id: 'v6-1', title: 'Part 1 – Biomechanical Foundations', description: 'Basic terms, planes of movement, and skeletal differences.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '45 mins', order: 1 },
      { id: 'v6-2', title: 'Part 2 – Spine Dynamics & Core Integration', description: 'Understanding safe twists, extensions, and core locks (Bandhas).', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '60 mins', order: 2 },
    ]
  },
  {
    id: 'course-7',
    title: 'Pranayama & Breathwork Fundamentals',
    description: 'Harness the power of breath to master mental focus, soothe stress, and regulate vitality.',
    longDescription: 'Pranayama is the fourth limb of yoga: control of life force. This course teaches traditional yogic breathing techniques (Nadi Shodhana, Kapalabhati, Bhastrika, Ujjayi) and modern science-backed protocols to rapidly calm or energize the autonomic nervous system.',
    price: 899,
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    instructor: 'Sushmita Debnath',
    duration: '4 hours',
    level: 'Beginner',
    category: 'Pranayama',
    published: true,
    createdAt: '2024-05-02',
    enrolledCount: 275,
    rating: 4.7,
    includes: ['5 breath practices', 'Daily routines log sheet', 'Autonomic nervous guide', 'Lifetime access'],
    videos: [
      { id: 'v7-1', title: 'Part 1 – The Anatomy of Breath', description: 'How the diaphragm functions and establishing natural belly breathing.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '30 mins', order: 1 },
      { id: 'v7-2', title: 'Part 2 – Calming Pranayama Practices', description: 'Nadi Shodhana (Alternate Nostril) and Sheetali (Cooling Breath) guides.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '40 mins', order: 2 },
    ]
  },
  {
    id: 'course-8',
    title: 'Advanced Postures & Arm Balances',
    description: 'Step-by-step masterclass to safely tackle advanced arm balances, core holds, and inversions.',
    longDescription: 'Unlock your physical potential. This advanced syllabus provides structured drills and progressions for Crow variations, Handstands, Forearm balances, and deep splits. Learn core integration, wrist alignment, and mindset keys to conquer challenging postures.',
    price: 3499,
    thumbnail: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=600&q=80',
    instructor: 'Sushmita Debnath',
    duration: '7.5 hours',
    level: 'Advanced',
    category: 'Advanced Asana',
    published: true,
    createdAt: '2024-05-18',
    enrolledCount: 68,
    rating: 5.0,
    includes: ['9 step-by-step videos', 'Wrist safety warmups', 'Prop usage strategies', 'Trainer certificate'],
    videos: [
      { id: 'v8-1', title: 'Part 1 – Shoulder Stability & Prep', description: 'Drills to strengthen shoulders and wrists for weight-bearing poses.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '40 mins', order: 1 },
      { id: 'v8-2', title: 'Part 2 – Arm Balances Progression', description: 'Tackling Crow, Side Crow, and Eka Pada Koundinyasana step-by-step.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '55 mins', order: 2 },
    ]
  },
  {
    id: 'course-9',
    title: 'Restorative Yoga for Stress Relief',
    description: 'Nurture your body and clear your mind using supportive props and gentle relaxation flows.',
    longDescription: 'Restorative yoga is the practice of deep, conscious rest. Using bolsters, blocks, and blankets, you will experience complete physical support to allow tension to dissolve effortlessly. Ideal for recovery, burnout, anxiety, and improving sleep quality.',
    price: 1599,
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    instructor: 'Sushmita Debnath',
    duration: '5.5 hours',
    level: 'All Levels',
    category: 'Restorative',
    published: true,
    createdAt: '2024-06-01',
    enrolledCount: 215,
    rating: 4.8,
    includes: ['6 restorative layouts', 'Sleep optimization tips', 'Daily stress checks', 'Lifetime access'],
    videos: [
      { id: 'v9-1', title: 'Part 1 – The Art of Props Support', description: 'How to position blankets, blocks, and bolsters for maximum comfort.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '35 mins', order: 1 },
      { id: 'v9-2', title: 'Part 2 – Full Body Restorative Flow', description: 'Supported child pose, reclined bound angle, and chest openers.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '50 mins', order: 2 },
    ]
  },
  {
    id: 'course-10',
    title: 'Ashtanga Vinyasa Primary Series',
    description: 'Learn the traditional Sanskrit counted primary series (Chikitsa) with modifications.',
    longDescription: 'Explore the traditional structure of Ashtanga Yoga. This sequence focuses on detoxifying the body, alignment, and internal heat. You will study Sun Salutations, standing poses, seated twists, backbends, and closing postures in their classical order.',
    price: 2799,
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    instructor: 'Sushmita Debnath',
    duration: '9 hours',
    level: 'Intermediate',
    category: 'Ashtanga',
    published: true,
    createdAt: '2024-06-15',
    enrolledCount: 110,
    rating: 4.9,
    includes: ['10 video modules', 'Sanskrit count guide PDF', 'Opening/Closing chants', 'Completion badge'],
    videos: [
      { id: 'v10-1', title: 'Part 1 – Opening Chants & Sun Salutations', description: 'Traditional Ashtanga opening prayer and counted Surya Namaskar A & B.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '40 mins', order: 1 },
      { id: 'v10-2', title: 'Part 2 – Standing Sequence Masterclass', description: 'Proper alignment, dristi (gaze), and ujjayi breath for standing postures.', source: 'https://www.youtube.com/embed/v7AYKMP6rOE', duration: '50 mins', order: 2 },
    ]
  }
];

const COURSES_KEY = 'shakti_courses';
const PURCHASES_KEY = 'shakti_purchases';
const PROGRESS_KEY = 'shakti_progress';

let _coursesCache: Course[] | null = null;

export const coursesService = {
  // Get all courses
  getCourses: (): Course[] => {
    if (_coursesCache) {
      return _coursesCache;
    }
    const stored = localStorage.getItem(COURSES_KEY);
    if (stored !== null) {
      try {
        const parsed = JSON.parse(stored);
        _coursesCache = parsed;
        return parsed;
      } catch { /* fall through */ }
    }
    // Seed dummy courses on first load
    localStorage.setItem(COURSES_KEY, JSON.stringify(dummyCourses));
    _coursesCache = dummyCourses;
    return dummyCourses;
  },

  // Get single course
  getCourse: (id: string): Course | null => {
    const courses = coursesService.getCourses();
    return courses.find(c => c.id === id) || null;
  },

  // Save all courses (admin)
  saveCourses: (courses: Course[]) => {
    _coursesCache = courses;
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  },

  // Save single course (admin upsert)
  saveCourse: (course: Course) => {
    const courses = coursesService.getCourses();
    const idx = courses.findIndex(c => c.id === course.id);
    if (idx >= 0) courses[idx] = course;
    else courses.push(course);
    coursesService.saveCourses(courses);
  },

  // Delete course (admin)
  deleteCourse: (id: string) => {
    const courses = coursesService.getCourses().filter(c => c.id !== id);
    coursesService.saveCourses(courses);
  },

  // Get purchased course IDs for a user
  getPurchases: (userId: string): string[] => {
    const stored = localStorage.getItem(PURCHASES_KEY);
    if (!stored) return [];
    try {
      const all = JSON.parse(stored);
      return all[userId] || [];
    } catch { return []; }
  },

  // Mark a course as purchased
  purchaseCourse: (userId: string, courseId: string) => {
    const stored = localStorage.getItem(PURCHASES_KEY);
    let all: Record<string, string[]> = {};
    try { if (stored) all = JSON.parse(stored); } catch { /* empty */ }
    if (!all[userId]) all[userId] = [];
    if (!all[userId].includes(courseId)) all[userId].push(courseId);
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(all));
  },

  // Check if user owns a course
  hasPurchased: (userId: string, courseId: string): boolean => {
    return coursesService.getPurchases(userId).includes(courseId);
  },

  // Get video progress for a user in a course
  getProgress: (userId: string, courseId: string): string[] => {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (!stored) return [];
    try {
      const all = JSON.parse(stored);
      return all[`${userId}_${courseId}`] || [];
    } catch { return []; }
  },

  // Mark a video as completed
  markVideoComplete: (userId: string, courseId: string, videoId: string) => {
    const stored = localStorage.getItem(PROGRESS_KEY);
    let all: Record<string, string[]> = {};
    try { if (stored) all = JSON.parse(stored); } catch { /* empty */ }
    const key = `${userId}_${courseId}`;
    if (!all[key]) all[key] = [];
    if (!all[key].includes(videoId)) all[key].push(videoId);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  },

  // Check if a video is unlocked (previous video must be complete, or it's first)
  isVideoUnlocked: (userId: string, courseId: string, video: CourseVideo, allVideos: CourseVideo[]): boolean => {
    if (video.order === 1) return true;
    const sortedVideos = [...allVideos].sort((a, b) => a.order - b.order);
    const prev = sortedVideos.find(v => v.order === video.order - 1);
    if (!prev) return true;
    const completed = coursesService.getProgress(userId, courseId);
    return completed.includes(prev.id);
  }
};
