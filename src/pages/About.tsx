
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';

import { aboutService } from '@/services/database';

interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  mission: string;
  vision: string;
  values: string[];
  story: string;
  founder: {
    name: string;
    title: string;
    bio: string;
    image: string;
  };
}

const About = () => {
  const [content, setContent] = useState<AboutContent>({
    heroTitle: "About SHAKTI YOGA THEME",
    heroSubtitle: "Transforming lives through authentic yoga practices and spiritual guidance",
    heroImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    mission: "To provide authentic, transformative yoga experiences that nurture the mind, body, and spirit, helping individuals discover their inner strength and achieve holistic wellness.",
    vision: "To create a global community of conscious individuals who embrace yoga as a way of life, spreading peace, healing, and spiritual awakening.",
    values: [
      "Authenticity in traditional yoga practices",
      "Compassionate guidance for all levels",
      "Holistic approach to wellness",
      "Community and connection",
      "Continuous learning and growth"
    ],
    story: "SHAKTI YOGA THEME was born from a deep passion for sharing the transformative power of yoga. Founded with the vision of creating a sacred space where ancient wisdom meets modern life, we have been guiding students on their journey of self-discovery for over a decade.",
    founder: {
      name: "Sushmita Debnath",
      title: "Founder & Lead Instructor",
      bio: "With over 15 years of dedicated practice and teaching, Sushmita brings authentic yoga wisdom to modern practitioners. Her gentle yet powerful approach has transformed hundreds of lives.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await aboutService.getAboutContent();
        if (data && data.heroTitle) {
          setContent(data);
          return;
        }
      } catch (e) {
        console.error('Failed to fetch dynamic about content:', e);
      }

      const storedContent = localStorage.getItem('aboutContent');
      if (storedContent) {
        setContent(JSON.parse(storedContent));
      }
    };
    
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-yoga-cream">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-yoga-forest to-yoga-sage overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-blend-overlay"
          style={{ backgroundImage: `url(${content.heroImage})` }}
        />
        <div className="absolute inset-0 bg-yoga-forest/60" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">{content.heroTitle}</h1>
            <p className="text-xl opacity-90">{content.heroSubtitle}</p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <h3 className="text-2xl font-bold text-yoga-forest mb-4">Our Mission</h3>
              <p className="text-yoga-forest/80 leading-relaxed">{content.mission}</p>
            </Card>
            
            <Card className="p-8 text-center">
              <h3 className="text-2xl font-bold text-yoga-forest mb-4">Our Vision</h3>
              <p className="text-yoga-forest/80 leading-relaxed">{content.vision}</p>
            </Card>
            
            <Card className="p-8 text-center">
              <h3 className="text-2xl font-bold text-yoga-forest mb-4">Our Values</h3>
              <ul className="text-yoga-forest/80 space-y-2">
                {content.values.map((value, index) => (
                  <li key={index} className="text-sm">• {value}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Story & Founder */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-yoga-forest mb-6">Our Story</h2>
              <p className="text-yoga-forest/80 leading-relaxed mb-8">{content.story}</p>
              
              <div className="border-l-4 border-yoga-sage pl-6">
                <h3 className="text-2xl font-bold text-yoga-forest mb-2">{content.founder.name}</h3>
                <p className="text-yoga-sage font-medium mb-4">{content.founder.title}</p>
                <p className="text-yoga-forest/80 leading-relaxed">{content.founder.bio}</p>
              </div>
            </div>
            
            <div className="text-center">
              <img loading="lazy" 
                src={content.founder.image} 
                alt={content.founder.name}
                className="w-80 h-80 object-cover rounded-2xl mx-auto shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
