
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventsSection from '@/components/EventsSection';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Events = () => {
  useScrollToTop();
  
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        <EventsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Events;
