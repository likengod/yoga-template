import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Star, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { homeContentService, HomeContentData } from '@/services/database';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Hero = () => {
  const settings = useSiteSettings();

  const content = {
    titleTop: "Find Your Inner",
    titleBottom: "Peace & Strength",
    subtitle: "Join our sanctuary of wellness and discover the transformative power of authentic yoga practice in a supportive community.",
    stats: {
      students: "1,000+",
      classes: "50+",
      years: "15+"
    },
    buttonPrimary: "Start Your Journey",
    buttonSecondary: "Watch Video",
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  };

  const handleWhatsAppContact = (message: string) => {
    const phoneNumber = (settings.whatsappNumber || settings.contactPhone || '').replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-yoga-cream via-yoga-sand to-yoga-sage/30"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-yoga-forest animate-float"></div>
        <div className="absolute bottom-40 right-32 w-24 h-24 rounded-full bg-yoga-terracotta animate-float" style={{
          animationDelay: '1s'
        }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-yoga-sage animate-float" style={{
          animationDelay: '2s'
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-2 text-yoga-terracotta">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <span className="text-sm font-medium">Trusted by {content.stats.students} Students</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-yoga-forest leading-tight">
              {content.titleTop}
              <span className="block text-yoga-terracotta">{content.titleBottom}</span>
            </h1>

            <p className="text-xl text-yoga-forest/80 leading-relaxed max-w-2xl">
              {content.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => handleWhatsAppContact("Hi! I'm interested in starting my yoga journey with SHAKTI YOGA THEME. Could you please provide more information about your classes and programs?")} 
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg rounded-full"
              >
                {content.buttonPrimary}
              </Button>
              <Button 
                variant="outline" 
                className="border-yoga-forest text-yoga-forest hover:bg-yoga-forest hover:text-white px-8 py-4 text-lg rounded-full flex items-center space-x-2"
              >
                <Play size={20} />
                <span>{content.buttonSecondary}</span>
              </Button>
            </div>

            {/* Social Media Buttons */}
            <div className="flex items-center space-x-4 pt-4">
              <span className="text-yoga-forest/70 font-medium">Follow us:</span>
              <div className="flex items-center space-x-3">
                <a href="https://www.facebook.com/raaikotha/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-yoga-sage/20 hover:bg-yoga-sage text-yoga-forest hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Facebook size={18} />
                </a>
                <a href="https://www.instagram.com/raaikotha/?hl=en" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-yoga-terracotta/20 hover:bg-yoga-terracotta text-yoga-forest hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Instagram size={18} />
                </a>
                <a href="https://twitter.com/raaikotha" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-yoga-forest/20 hover:bg-yoga-forest text-yoga-forest hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Twitter size={18} />
                </a>
                <a href="https://www.youtube.com/c/RaaiKotha" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-yoga-sage/20 hover:bg-yoga-sage text-yoga-forest hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Youtube size={18} />
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-yoga-sage/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-yoga-terracotta">{content.stats.years}</div>
                <div className="text-sm text-yoga-forest/70">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yoga-terracotta">{content.stats.students}</div>
                <div className="text-sm text-yoga-forest/70">Happy Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yoga-terracotta">{content.stats.classes}</div>
                <div className="text-sm text-yoga-forest/70">Class Types</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in" style={{
            animationDelay: '0.3s'
          }}>
              <div className="relative flex justify-center items-center">
                {/* Main Image with Yoga Background */}
                <div className="w-[90%] max-w-[450px] lg:max-w-[500px] aspect-square rounded-full shadow-2xl overflow-hidden">
                  <img 
                    src={content.image} 
                    alt="Yoga meditation practice" 
                    className="w-full h-full object-cover rounded-full"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://i.postimg.cc/ZnnS7KY3/Whats-App-Image-2025-06-06-at-11-19-59-PM.jpg';
                    }}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-yoga-forest/30 to-transparent"></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-2 right-16 lg:right-20 flex items-center justify-center animate-float drop-shadow-xl z-10">
                  <span className="text-yoga-forest text-[80px] lg:text-[120px] leading-none">☯</span>
                </div>
                <div className="absolute bottom-12 left-4 lg:left-8 w-20 h-20 bg-yoga-cream border-4 border-yoga-sage rounded-full flex items-center justify-center shadow-lg animate-float" style={{
                  animationDelay: '1.5s'
                }}>
                  <span className="text-yoga-forest text-4xl">ॐ</span>
                </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
