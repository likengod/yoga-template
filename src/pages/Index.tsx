
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import FeaturedClasses from '@/components/FeaturedClasses';
import Instructors from '@/components/Instructors';
import Footer from '@/components/Footer';
import TimedPopup from '@/components/TimedPopup';
import { usePageMeta } from '@/hooks/usePageMeta';

const Index = () => {
  usePageMeta({
    title: 'Find Your Inner Peace',
    description: 'Discover inner peace and wellness at SHAKTI YOGA THEME. Professional yoga classes, meditation, and holistic wellness programs for all levels.',
  });
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <FeaturedClasses />
      <Instructors />
      <Footer />
      <TimedPopup />
    </div>
  );
};

export default Index;
