import React, { useState, useEffect } from 'react';
import { Heart, Leaf, Sun, Users, Award, Clock, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePageMeta } from '@/hooks/usePageMeta';
import { aboutService } from '@/services/database';

const getIconComponent = (name: string) => {
  switch (name) {
    case 'Heart': return Heart;
    case 'Leaf': return Leaf;
    case 'Sun': return Sun;
    case 'Users': return Users;
    case 'Award': return Award;
    case 'Clock': return Clock;
    case 'MapPin': return MapPin;
    default: return Heart;
  }
};

const defaultContent = {
  heroTitle: "About SHAKTI YOGA THEME",
  heroSubtitle: "Transforming lives through authentic yoga practices for over 15 years",
  storyTitle: "Our Story",
  storyText: "Founded with a vision to bring authentic yoga practices to modern practitioners, SHAKTI YOGA THEME has been a beacon of transformation for over 15 years. Our journey began with a simple belief: yoga is not just a practice—it's a way of life.\n\nWe combine traditional Hatha, Vinyasa, and Ashtanga yoga with modern wellness techniques to create a holistic experience that transforms lives. Every class is designed to honor the sacred tradition of yoga while making it accessible to practitioners of all levels.",
  storyImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
  philosophyTitle: "Our Philosophy",
  philosophySubtitle: "We believe in creating a safe, nurturing environment where you can explore your potential and discover your inner strength.",
  philosophyCards: [
    {
      title: 'Authenticity',
      description: 'We honor traditional yoga practices while making them accessible to modern practitioners.'
    },
    {
      title: 'Transformation',
      description: 'Every practice is designed to create positive change in mind, body, and spirit.'
    },
    {
      title: 'Community',
      description: 'We foster a supportive environment where everyone feels welcome and valued.'
    },
    {
      title: 'Excellence',
      description: 'We maintain the highest standards in teaching, safety, and student care.'
    }
  ],
  featuresTitle: "What Makes Us Special",
  featuresCards: [
    {
      icon: 'Heart',
      title: 'Mindful Practice',
      description: 'Connect with your inner self through mindful yoga practices rooted in ancient traditions.'
    },
    {
      icon: 'Leaf',
      title: 'Natural Healing',
      description: 'Experience holistic healing that nurtures your body and mind naturally.'
    },
    {
      icon: 'Sun',
      title: 'Energy Balance',
      description: 'Restore your energy flow and find perfect balance in all aspects of life.'
    },
    {
      icon: 'Users',
      title: 'Community',
      description: 'Join a supportive community of like-minded individuals on their wellness journey.'
    }
  ],
  impactTitle: "Our Impact",
  impactSubtitle: "Numbers that reflect our commitment to transforming lives through yoga",
  impactCards: [
    { icon: 'Award', number: '15+', label: 'Years of Experience' },
    { icon: 'Users', number: '1000+', label: 'Students Transformed' },
    { icon: 'Clock', number: '5000+', label: 'Classes Conducted' },
    { icon: 'Heart', number: '98%', label: 'Student Satisfaction' }
  ],
  studioTitle: "Visit Our Studio",
  studioSubtitle: "Join us at our peaceful studio space designed for transformation",
  studioCards: [
    {
      icon: 'MapPin',
      title: 'Location',
      line1: '123 Wellness Street',
      line2: 'Mumbai 400001'
    },
    {
      icon: 'Clock',
      title: 'Hours',
      line1: 'Monday - Sunday',
      line2: '6:00 AM - 9:00 PM'
    },
    {
      icon: 'Users',
      title: 'Classes',
      line1: 'All Levels Welcome',
      line2: 'Small Group Sessions'
    }
  ]
};

const AboutPage = () => {
  const [content, setContent] = useState(defaultContent);
  const [isLoading, setIsLoading] = useState(true);

  usePageMeta({
    title: 'About Us',
    description: content.heroSubtitle,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await aboutService.getAboutContent();
        if (data && data.heroTitle) {
          let customContent = {};
          if (data.vision) {
            try {
              const parsed = JSON.parse(data.vision);
              if (parsed && typeof parsed === 'object' && parsed.philosophyCards) {
                customContent = parsed;
              }
            } catch (e) {
              // Ignore legacy non-JSON vision statement data
            }
          }
          
          setContent({
            heroTitle: data.heroTitle || defaultContent.heroTitle,
            heroSubtitle: data.heroSubtitle || defaultContent.heroSubtitle,
            storyTitle: (customContent as any).storyTitle || data.founder?.name || defaultContent.storyTitle,
            storyText: data.story || defaultContent.storyText,
            storyImage: data.sectionImage || defaultContent.storyImage,
            
            philosophyTitle: (customContent as any).philosophyTitle || defaultContent.philosophyTitle,
            philosophySubtitle: (customContent as any).philosophySubtitle || defaultContent.philosophySubtitle,
            featuresTitle: (customContent as any).featuresTitle || data.heroImage || defaultContent.featuresTitle,
            impactTitle: (customContent as any).impactTitle || defaultContent.impactTitle,
            impactSubtitle: (customContent as any).impactSubtitle || defaultContent.impactSubtitle,
            studioTitle: (customContent as any).studioTitle || defaultContent.studioTitle,
            studioSubtitle: (customContent as any).studioSubtitle || defaultContent.studioSubtitle,
            
            philosophyCards: (customContent as any).philosophyCards || defaultContent.philosophyCards,
            featuresCards: (customContent as any).featuresCards || defaultContent.featuresCards,
            impactCards: (customContent as any).impactCards || defaultContent.impactCards,
            studioCards: (customContent as any).studioCards || defaultContent.studioCards
          });
        }
      } catch (e) {
        console.error('Failed to fetch dynamic about content:', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yoga-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yoga-forest"></div>
      </div>
    );
  }

  // Split story into paragraphs
  const paragraphs = content.storyText.split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-yoga-cream to-yoga-sand">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold text-yoga-forest mb-6">
              {content.heroTitle.includes('SHAKTI YOGA THEME') ? (
                <>
                  About <span className="text-yoga-terracotta">SHAKTI YOGA THEME</span>
                </>
              ) : (
                content.heroTitle
              )}
            </h1>
            <p className="text-xl text-yoga-forest/80 max-w-3xl mx-auto leading-relaxed">
              {content.heroSubtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <img loading="lazy" 
                  src={content.storyImage} 
                  alt="Yoga practice and meditation" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-yoga-forest/20 to-transparent"></div>
              </div>
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-yoga-terracotta/20 rounded-full"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-yoga-sage/20 rounded-full"></div>
            </div>

            {/* Story Content */}
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold text-yoga-forest">
                  {content.storyTitle.includes('Story') ? (
                    <>
                      Our <span className="text-yoga-terracotta">Story</span>
                    </>
                  ) : (
                    content.storyTitle
                  )}
                </h2>
                {paragraphs.map((p, index) => (
                  <p key={index} className="text-lg text-yoga-forest/80 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-yoga-forest mb-6">
              {content.philosophyTitle.includes('Philosophy') ? (
                <>
                  Our <span className="text-yoga-terracotta">Philosophy</span>
                </>
              ) : (
                content.philosophyTitle
              )}
            </h2>
            <p className="text-xl text-yoga-forest/80 max-w-3xl mx-auto">
              {content.philosophySubtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {content.philosophyCards.map((value, index) => (
              <div 
                key={value.title + index}
                className="text-center p-6 bg-gradient-to-br from-yoga-cream to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-2xl font-bold text-yoga-forest mb-4">{value.title}</h3>
                <p className="text-yoga-forest/70 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-yoga-cream to-yoga-sand">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-yoga-forest mb-6">
              {content.featuresTitle.includes('Special') ? (
                <>
                  What Makes Us <span className="text-yoga-terracotta">Special</span>
                </>
              ) : (
                content.featuresTitle
              )}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.featuresCards.map((feature, index) => {
              const IconComp = getIconComponent(feature.icon);
              return (
                <div 
                  key={feature.title + index}
                  className="p-6 bg-white/70 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 bg-yoga-sage/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <IconComp className="text-yoga-sage" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-yoga-forest mb-4">{feature.title}</h3>
                  <p className="text-yoga-forest/70">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-yoga-forest mb-6">
              {content.impactTitle.includes('Impact') ? (
                <>
                  Our <span className="text-yoga-terracotta">Impact</span>
                </>
              ) : (
                content.impactTitle
              )}
            </h2>
            <p className="text-xl text-yoga-forest/80 max-w-3xl mx-auto">
              {content.impactSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.impactCards.map((achievement, index) => {
              const IconComp = getIconComponent(achievement.icon);
              return (
                <div 
                  key={achievement.label + index}
                  className="text-center p-8 bg-gradient-to-br from-yoga-sage to-yoga-forest rounded-2xl text-white"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <IconComp size={48} className="mx-auto mb-4 text-yoga-cream" />
                  <div className="text-4xl font-bold mb-2">{achievement.number}</div>
                  <div className="text-lg opacity-90">{achievement.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 bg-gradient-to-br from-yoga-cream to-yoga-sand">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-yoga-forest mb-6">
              {content.studioTitle.includes('Studio') ? (
                <>
                  Visit Our <span className="text-yoga-terracotta">Studio</span>
                </>
              ) : (
                content.studioTitle
              )}
            </h2>
            <p className="text-xl text-yoga-forest/80 max-w-3xl mx-auto">
              {content.studioSubtitle}
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-xl">
            <div className="grid md:grid-cols-3 gap-8">
              {content.studioCards.map((card, index) => {
                const IconComp = getIconComponent(card.icon);
                return (
                  <div key={card.title + index} className="text-center">
                    <div className="w-16 h-16 bg-yoga-sage/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <IconComp className="text-yoga-sage" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-yoga-forest mb-2">{card.title}</h3>
                    <p className="text-yoga-forest/70">{card.line1}<br />{card.line2}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
