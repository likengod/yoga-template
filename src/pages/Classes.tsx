
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClassesSection from '@/components/ClassesSection';
import { usePageMeta } from '@/hooks/usePageMeta';

const Classes = () => {
  usePageMeta({
    title: 'Online Yoga Classes',
    description: 'Join our live online yoga sessions from the comfort of your home. Expert instruction, personal attention, and a supportive community await you.',
  });
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32">
        <ClassesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Classes;
