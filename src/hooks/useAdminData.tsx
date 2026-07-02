
import { useState, useEffect } from 'react';

export const useAdminData = () => {
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80');
  const [programs, setPrograms] = useState([
    { id: 'A', name: '12 Days Online Group Session', price: '₹8,500' },
    { id: 'B', name: '3-Month Personal Yoga Journey', price: '₹45,000' },
    { id: 'C', name: '21 Days of Living Yoga', price: '₹75,000' },
    { id: 'D', name: 'Stretch-Fit Yoga Trousers', price: '₹2,500' }
  ]);
  const [instructors, setInstructors] = useState([
    {
      name: 'Sushmita Debnath',
      title: 'Lead Instructor & Founder',
      experience: '15 years',
      description: 'Sushmita founded SHAKTI YOGA THEME with a vision to bring authentic yoga practices to modern practitioners. Her gentle yet powerful teaching style has transformed hundreds of lives.'
    },
    {
      name: 'SANNIDHYA KRISHNA DAS',
      title: 'Senior Vinyasa Instructor',
      experience: '10 years',
      description: 'Sannidhya brings dynamic energy to his classes, combining traditional sequences with innovative flows. His expertise in anatomy ensures safe and effective practice.'
    },
    {
      name: 'SHIVAM MISRA',
      title: 'Therapeutic Yoga Specialist',
      experience: '12 years',
      description: 'With a background in physiotherapy, Shivam specializes in therapeutic applications of yoga, helping students heal and restore their bodies naturally.'
    }
  ]);

  useEffect(() => {
    // Load hero image
    const storedHeroImage = localStorage.getItem('heroImage');
    if (storedHeroImage) {
      setHeroImage(storedHeroImage);
    }

    // Load programs
    const storedPrograms = localStorage.getItem('programs');
    if (storedPrograms) {
      setPrograms(JSON.parse(storedPrograms));
    }

    // Load instructors
    const storedInstructors = localStorage.getItem('instructors');
    if (storedInstructors) {
      setInstructors(JSON.parse(storedInstructors));
    }
  }, []);

  return {
    heroImage,
    programs,
    instructors
  };
};
