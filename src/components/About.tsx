import React, { useState, useEffect } from 'react';
import { optimizeUnsplashUrl } from '@/lib/utils';
import { Heart, Leaf, Sun, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { homeContentService, HomeContentData } from '@/services/database';

const DEFAULT_ABOUT = {
  title: "Our Philosophy",
  description: "We believe yoga is for everyone. Our approach combines ancient wisdom with modern understanding.",
  philosophyTitle: "Mind-Body Harmony",
  philosophyP1: "Through conscious breath and mindful movement, we create space for profound transformation.",
  philosophyP2: "Our inclusive environment supports each student's unique journey toward wellness.",
  button: "Learn More",
  image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  features: [
    { title: "Expert Teachers", description: "Certified instructors with years of experience." },
    { title: "Flexible Schedule", description: "Classes from early morning to late evening." }
  ]
};

const About = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(DEFAULT_ABOUT);

  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      try {
        const data = await homeContentService.getHomeContent();
        if (isMounted && data && data.about && data.about.title) {
          setContent({
            ...DEFAULT_ABOUT,
            ...data.about,
            features: Array.isArray(data.about.features) && data.about.features.length > 0 
              ? data.about.features 
              : DEFAULT_ABOUT.features
          });
        }
      } catch (error) {
        console.error('About: Error loading home content:', error);
      }
    };

    loadContent();

    const handleUpdate = async () => {
      try {
        const data = await homeContentService.getHomeContent();
        if (isMounted && data && data.about && data.about.title) {
          setContent({
            ...DEFAULT_ABOUT,
            ...data.about,
            features: Array.isArray(data.about.features) && data.about.features.length > 0 
              ? data.about.features 
              : DEFAULT_ABOUT.features
          });
        }
      } catch (error) {
        console.error('About: Error handling update:', error);
      }
    };

    window.addEventListener('homeContentUpdated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('homeContentUpdated', handleUpdate);
    };
  }, []);

  const handleReadMore = () => {
    navigate('/about');
  };

  const icons = [Heart, Leaf, Sun, Users];
  const featuresList = Array.isArray(content?.features) ? content.features : DEFAULT_ABOUT.features;
  const featuresWithIcons = featuresList.map((feature: any, index: number) => ({
    ...feature,
    icon: icons[index % icons.length]
  }));

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-yoga-cream to-yoga-sand">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-yoga-forest mb-6">
            {content.title.split(' ').slice(0, -1).join(' ')} <span className="text-yoga-terracotta">{content.title.split(' ').slice(-1)[0]}</span>
          </h2>
          <p className="text-xl text-yoga-forest/80 max-w-3xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-yoga-forest">
                {content.philosophyTitle}
              </h3>
              <p className="text-lg text-yoga-forest/80 leading-relaxed">
                {content.philosophyP1}
              </p>
              <p className="text-lg text-yoga-forest/80 leading-relaxed">
                {content.philosophyP2}
              </p>
              
              {/* Read More Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleReadMore}
                  className="bg-yoga-sage hover:bg-yoga-forest text-white px-8 py-3 rounded-full"
                >
                  {content.button}
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {featuresWithIcons.map((feature, index) => (
                <div 
                  key={index} 
                  className="p-6 bg-white/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-yoga-sage/20 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="text-yoga-sage" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-yoga-forest mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-yoga-forest/70">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative">
              {/* Main Image */}
              <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <img loading="lazy" 
                  src={optimizeUnsplashUrl(content.image, 600, 60)} 
                  alt="Yoga practice and meditation" 
                  width={600}
                  height={500}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://i.postimg.cc/ZnnS7KY3/Whats-App-Image-2025-06-06-at-11-19-59-PM.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-yoga-forest/20 to-transparent"></div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-yoga-terracotta/20 rounded-full"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-yoga-sage/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
