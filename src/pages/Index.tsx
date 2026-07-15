import React, { useMemo } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import FeaturedClasses from '@/components/FeaturedClasses';
import Instructors from '@/components/Instructors';
import Footer from '@/components/Footer';
import TimedPopup from '@/components/TimedPopup';
import { usePageMeta } from '@/hooks/usePageMeta';

const Index = () => {
  // Memoize schemas to prevent re-creation and infinite loops in usePageMeta useEffect
  const schemas = useMemo(() => [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://shaktiyogaraai.com/#organization",
      "name": "Shakti Yoga Raai",
      "url": "https://shaktiyogaraai.com",
      "logo": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-9876543210",
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["en", "hi"]
      },
      "sameAs": [
        "https://www.facebook.com/shaktiyogaraai",
        "https://www.instagram.com/shaktiyogaraai",
        "https://twitter.com/shaktiyogaraai",
        "https://www.youtube.com/shaktiyogaraai"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://shaktiyogaraai.com/#website",
      "url": "https://shaktiyogaraai.com",
      "name": "Shakti Yoga Raai",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://shaktiyogaraai.com/store?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ], []);

  usePageMeta({
    title: 'Find Your Inner Peace',
    description: 'Discover inner peace and wellness at SHAKTI YOGA THEME. Professional yoga classes, meditation, and holistic wellness programs for all levels.',
    schemas: schemas
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
