const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const generateContent = (topic, focus) => {
  let content = `The practice of Indian Yoga is a profound journey into self-discovery, physical well-being, and spiritual awakening. When we delve into ${topic}, we are not just exploring a physical routine, but rather an ancient philosophy designed to align the body, mind, and spirit. Origins tracing back thousands of years in the Indian subcontinent reveal that yoga was never merely about flexibility; it was, and remains, a holistic system for human flourishing. 

In the context of ${focus}, practitioners find a pathway that transcends the superficial layers of existence. The ancient sages (rishis) of India understood that the human experience is deeply interconnected. Physical ailments often have root causes in mental or emotional imbalances. By engaging with ${topic}, individuals can systematically peel back the layers of stress, conditioning, and trauma that accumulate over a lifetime. This process of unburdening is essential for realizing one's true nature, which in yogic philosophy is characterized by Sat-Chit-Ananda (Truth-Consciousness-Bliss).

Furthermore, the modern application of these ancient principles is more relevant today than ever before. In our fast-paced, technology-driven world, the nervous system is constantly bombarded with stimuli. ${topic} offers an antidote—a sanctuary of stillness and focused awareness. Through dedicated practice, we cultivate a heightened sense of interoception, the ability to feel and understand the internal landscape of our bodies. This awareness naturally leads to better decision-making, improved relationships, and a more profound sense of peace.

The beauty of Indian Yoga lies in its accessibility. Regardless of age, physical condition, or background, the teachings of ${focus} can be adapted to serve the individual. The physical postures (asanas), breath control (pranayama), and meditation techniques are merely tools. The true goal is self-realization. As you integrate these practices into your daily life, you'll likely notice subtle but profound shifts. Your breathing will become deeper and more rhythmic, your mind will settle with greater ease, and your physical body will reflect the resilience and suppleness of your inner state. Ultimately, exploring ${topic} is an invitation to return home to yourself, grounded in the timeless wisdom of India's spiritual heritage.

By committing to this path, we honor the ancient lineage of teachers who preserved these practices through the millennia. We become links in a living chain of wisdom, carrying the light of yoga forward into the future. It is a lifelong journey of learning, unlearning, and profound transformation.`;

  content += `\n\nDeepening our understanding requires patience and tapas (disciplined effort). The philosophical texts of India, such as the Upanishads and the Yoga Sutras of Patanjali, remind us that the obstacles we face on the mat are mirrors of the obstacles we face in life. How we breathe through a challenging posture is exactly how we can learn to breathe through a challenging conversation or a stressful day at work. Thus, the practice of ${topic} becomes a laboratory for life. Every session is an opportunity to practice non-attachment (vairagya) and constant practice (abhyasa). As we refine our approach to ${focus}, we simultaneously refine our approach to living a meaningful and balanced life.`;
  
  return content;
};

const SEED_ARTICLES = [
  {
    title: "The Roots of Ashtanga Yoga in Mysore, India",
    excerpt: "Discover the dynamic and physically demanding style of Ashtanga Yoga, originating from the teachings of Sri K. Pattabhi Jois in Mysore, India.",
    author: "Arjun Patel",
    category: "History",
    image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("Ashtanga Yoga in Mysore", "the dynamic synchronization of breath and movement")
  },
  {
    title: "Hatha Yoga: The Foundation of Physical Practice",
    excerpt: "Explore Hatha Yoga, the foundational practice that balances the solar and lunar energies within the body through asanas and pranayama.",
    author: "Priya Sharma",
    category: "Practice",
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("Hatha Yoga", "balancing the sun (ha) and moon (tha) energies")
  },
  {
    title: "Pranayama: The Ancient Indian Science of Breath",
    excerpt: "Learn how the ancient yogis of India utilized Pranayama to control the life force (Prana), calm the mind, and heal the physical body.",
    author: "Dr. Rohan Desai",
    category: "Wellness",
    image_url: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("Pranayama", "the expansion and regulation of the vital life force")
  },
  {
    title: "The Philosophy of the Bhagavad Gita in Yoga",
    excerpt: "Delve into the Bhagavad Gita, the ancient Indian text that outlines the paths of Karma, Bhakti, and Jnana Yoga for spiritual liberation.",
    author: "Ananya Singh",
    category: "Philosophy",
    image_url: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("the Bhagavad Gita", "understanding duty, devotion, and knowledge")
  },
  {
    title: "Kundalini Yoga: Awakening the Inner Energy",
    excerpt: "An introduction to Kundalini Yoga, a powerful practice designed to awaken the dormant spiritual energy located at the base of the spine.",
    author: "Vikram Mehta",
    category: "Practice",
    image_url: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("Kundalini Yoga", "awakening the dormant serpent energy")
  },
  {
    title: "The Yamas and Niyamas: Ethical Guidelines of Patanjali",
    excerpt: "Understand the foundational moral and ethical codes of classical Indian Yoga that guide a practitioner's behavior towards themselves and society.",
    author: "Meera Reddy",
    category: "Philosophy",
    image_url: "https://images.unsplash.com/photo-1552288092-7eb5d159dd46?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("Yamas and Niyamas", "the ethical foundation of a yogic lifestyle")
  },
  {
    title: "Rishikesh: The Yoga Capital of the World",
    excerpt: "Take a journey to Rishikesh, India, situated on the banks of the sacred Ganges River, where thousands seek spiritual enlightenment.",
    author: "Siddharth Rao",
    category: "Lifestyle",
    image_url: "https://images.unsplash.com/photo-1593810451137-5dc5bb44bf8f?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("Rishikesh", "the spiritual atmosphere of the Ganges and the Himalayas")
  },
  {
    title: "Vinyasa Krama: The Art of Sequencing",
    excerpt: "Learn about Vinyasa Krama, the ancient Indian method of intelligently sequencing yoga postures to achieve a specific physical and mental goal.",
    author: "Kavita Iyer",
    category: "Asana",
    image_url: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("Vinyasa Krama", "the step-by-step progression towards a specific goal")
  },
  {
    title: "The Healing Power of Ayurveda and Yoga",
    excerpt: "Discover the sister sciences of Ayurveda and Yoga, and how they work together harmoniously to promote holistic health and longevity.",
    author: "Dr. Lakshmi Menon",
    category: "Wellness",
    image_url: "https://images.unsplash.com/photo-1574689211272-bc1550ce15f5?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("Ayurveda and Yoga", "the integration of lifestyle, diet, and physical practice")
  },
  {
    title: "Sivananda Yoga: A Holistic Approach to Wellness",
    excerpt: "Explore the five points of yoga established by Swami Sivananda: proper exercise, breathing, relaxation, diet, and positive thinking.",
    author: "Rahul Verma",
    category: "Practice",
    image_url: "https://images.unsplash.com/photo-1555505019-8c3f1c4aba5f?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("Sivananda Yoga", "a synthesis of the paths of yoga for total health")
  },
  {
    title: "The Role of Mantras in Indian Spiritual Practices",
    excerpt: "Understand the profound impact of chanting ancient Sanskrit mantras to focus the mind and elevate the spirit in traditional Indian Yoga.",
    author: "Aarti Desai",
    category: "Meditation",
    image_url: "https://images.unsplash.com/photo-1522845015757-50bce044e5da?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("Mantras", "the transformative power of sound vibration")
  },
  {
    title: "Iyengar Yoga: Precision, Alignment, and Props",
    excerpt: "Discover how B.K.S. Iyengar revolutionized modern yoga through his meticulous focus on alignment and the innovative use of props.",
    author: "Sanjay Gupta",
    category: "Practice",
    image_url: "https://images.unsplash.com/photo-1566501206188-5dd0cf160a0e?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("Iyengar Yoga", "the pursuit of precision and therapeutic alignment")
  },
  {
    title: "Yoga Nidra: The Conscious Yogic Sleep",
    excerpt: "Experience the profound restorative benefits of Yoga Nidra, an ancient Indian practice that guides you into a state of deep conscious relaxation.",
    author: "Neha Kapoor",
    category: "Meditation",
    image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("Yoga Nidra", "the healing state between wakefulness and sleep")
  },
  {
    title: "The Eight Limbs of Yoga (Ashtanga) by Sage Patanjali",
    excerpt: "A comprehensive guide to the Eight Limbs of Yoga as outlined in Patanjali's Yoga Sutras, offering a roadmap to spiritual liberation.",
    author: "Dr. Anil Kumar",
    category: "Philosophy",
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("The Eight Limbs of Yoga", "the systematic approach to controlling the mind")
  },
  {
    title: "Integrating Indian Yogic Philosophy into Modern Life",
    excerpt: "Practical ways to take the ancient teachings of Indian Yoga off the mat and apply them to the challenges of the modern world.",
    author: "Divya Nambiar",
    category: "Lifestyle",
    image_url: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&q=80&w=800",
    published: true,
    content: generateContent("Modern Yogic Philosophy", "bridging ancient wisdom with contemporary challenges")
  }
];

async function main() {
  const fs = require('fs');
  fs.writeFileSync('articlesFallback.json', JSON.stringify(SEED_ARTICLES, null, 2));
  console.log('Successfully wrote articlesFallback.json');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
