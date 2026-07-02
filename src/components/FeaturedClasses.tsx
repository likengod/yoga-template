import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useClassesData } from '@/hooks/useClassesData';

const FeaturedClasses = () => {
  const { classes } = useClassesData();
  const settings = useSiteSettings();

  const featured = classes.filter(c => c.featured);
  const featuredClasses = (featured.length > 0 ? featured : classes).slice(0, 3);

  const handleWhatsAppContact = (className: string) => {
    const phoneNumber = (settings.whatsappNumber || settings.contactPhone || '').replace(/\D/g, '');
    const message = `Hi! I'm interested in joining the ${className} class. Could you please provide more details about the schedule and enrollment?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (featuredClasses.length === 0) return null;

  return (
    <section className="py-20 bg-yoga-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-yoga-forest mb-6">Featured <span className="text-yoga-terracotta">Classes</span></h2>
          <p className="text-xl text-yoga-forest/80 max-w-3xl mx-auto">
            Discover our most popular yoga classes designed to nurture your mind, body, and spirit
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {featuredClasses.map((yogaClass) => (
            <Card key={yogaClass.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="relative h-48 overflow-hidden shrink-0">
                <img loading="lazy" 
                  src={yogaClass.image} 
                  alt={yogaClass.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-yoga-sage text-white px-3 py-1 rounded-full text-sm font-medium">
                  {yogaClass.price}
                </div>
              </div>
              
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-yoga-forest mb-3">{yogaClass.title}</h3>
                <p className="text-yoga-forest/70 mb-4 line-clamp-2 text-sm">{yogaClass.description}</p>
                
                <div className="flex flex-col space-y-2 text-xs text-yoga-forest/60 mb-4 mt-auto">
                  <div className="flex items-center space-x-2">
                    <Clock size={14} />
                    <span>{yogaClass.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users size={14} />
                    <span>{yogaClass.capacity}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={14} />
                    <span>{yogaClass.level}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handleWhatsAppContact(yogaClass.title)}
                  className="w-full bg-yoga-sage hover:bg-yoga-forest text-white flex items-center justify-center space-x-2 mt-auto"
                >
                  <span>Join Class</span>
                  <ArrowRight size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
          
          <Link to="/classes" className="flex">
            <Card className="w-full h-full flex flex-col items-center justify-center p-6 hover:shadow-lg transition-shadow bg-yoga-sage/5 border-yoga-sage/30 border-2 border-dashed cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-yoga-sage/10 flex items-center justify-center mb-4 group-hover:bg-yoga-sage transition-colors duration-300">
                <ArrowRight size={32} className="text-yoga-sage group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-yoga-forest text-center">View All Classes</h3>
              <p className="text-yoga-forest/70 text-center mt-2 text-sm">Explore our complete schedule and find the perfect class for your journey.</p>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedClasses;
