import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Heart, Star, Handshake, Mail, Phone } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import ShareMenu from '@/components/ShareMenu';

const Collaborations = () => {
  const settings = useSiteSettings();
  useScrollToTop();
  usePageMeta({
    title: 'Collaborations',
    description: 'Partner with SHAKTI YOGA THEME. We welcome collaborations with wellness brands, studios, instructors, and health professionals.',
  });

  const collaborationTypes = [
    {
      icon: <Users className="w-8 h-8 text-yoga-sage" />,
      title: "Yoga Teachers",
      description: "Join our community of certified instructors and share your passion for yoga with our students.",
      benefits: ["Flexible scheduling", "Competitive compensation", "Professional development", "Supportive community"]
    },
    {
      icon: <Heart className="w-8 h-8 text-yoga-terracotta" />,
      title: "Wellness Brands",
      description: "Partner with us to promote authentic wellness products that align with our values and mission.",
      benefits: ["Brand exposure", "Targeted audience", "Content collaboration", "Event partnerships"]
    },
    {
      icon: <Star className="w-8 h-8 text-yoga-forest" />,
      title: "Business Partnerships",
      description: "Collaborate with us to create meaningful wellness experiences for your employees or customers.",
      benefits: ["Corporate wellness programs", "Team building sessions", "Custom workshops", "Retreat planning"]
    },
    {
      icon: <Handshake className="w-8 h-8 text-yoga-sage" />,
      title: "Product Collaborations",
      description: "Showcase your yoga and wellness products to our engaged community of practitioners.",
      benefits: ["Product placement", "Review opportunities", "Social media features", "Workshop integration"]
    }
  ];

  const handleWhatsAppContact = (message: string) => {
    const phoneNumber = (settings.collaborationsContact || settings.whatsappNumber || settings.contactPhone || '').replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-yoga-cream">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-4 md:pt-32 md:pb-16 bg-gradient-to-br from-yoga-sage/20 to-yoga-forest/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-yoga-forest mb-3 sm:mb-6">
              Join Our <span className="text-yoga-terracotta">Collaboration</span> Network
            </h1>
            <p className="text-xs sm:text-lg md:text-xl text-yoga-forest/80 mb-0 sm:mb-8 leading-relaxed line-clamp-3 sm:line-clamp-none">
              Whether you're a yoga teacher, wellness brand, or business looking to promote authentic wellness, 
              we invite you to be part of our growing community dedicated to transforming lives through yoga.
            </p>
            <Button 
              onClick={() => handleWhatsAppContact("General collaboration connect query...")}
              className="hidden sm:inline-flex bg-yoga-sage hover:bg-yoga-forest text-white px-6 py-2 sm:px-8 sm:py-3 text-sm sm:text-lg"
            >
              Start Collaborating
            </Button>
          </div>
        </div>
      </section>

      {/* Collaboration Types */}
      <section className="pt-2 pb-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-yoga-forest mb-2 md:mb-4">
              Collaboration <span className="text-yoga-terracotta">Opportunities</span>
            </h2>
            <p className="text-xs sm:text-lg text-yoga-forest/70 max-w-2xl mx-auto line-clamp-2 sm:line-clamp-none">
              Discover how you can join our mission to spread wellness and mindfulness through authentic yoga practices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collaborationTypes.map((type, index) => (
              <Card key={index} className="border-yoga-sage/20 hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    {type.icon}
                    <CardTitle className="text-xl text-yoga-forest">{type.title}</CardTitle>
                  </div>
                  <CardDescription className="text-yoga-forest/70 text-base">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-yoga-forest mb-3">Benefits Include:</h4>
                        <ul className="space-y-2">
                          {type.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-center space-x-2 text-yoga-forest/80">
                              <div className="w-2 h-2 bg-yoga-sage rounded-full"></div>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={() => window.location.href = `mailto:${settings.contactEmail}?subject=${encodeURIComponent(`${type.title} Collaboration Inquiry`)}`}
                          variant="outline"
                          className="flex-1 border-yoga-sage text-yoga-forest hover:bg-yoga-sage hover:text-white text-xs h-9 px-2"
                        >
                          Email Us
                        </Button>
                        <Button 
                          onClick={() => handleWhatsAppContact(`${type.title} connect request`)}
                          className="flex-1 bg-yoga-sage hover:bg-yoga-forest text-white text-xs h-9 px-2"
                        >
                          WhatsApp
                        </Button>
                        <ShareMenu 
                          title={`${type.title} Collaboration`}
                          description={type.description}
                          iconOnly={true}
                          className="bg-white border-white/60 text-yoga-forest hover:bg-white/90 hover:text-yoga-forest shadow-sm h-8 w-8 rounded-full"
                        />
                      </div>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Collaborate Section */}
      <section className="py-16 bg-gradient-to-r from-yoga-sage/10 to-yoga-forest/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-yoga-forest mb-8">
              Why Choose SHAKTI YOGA THEME?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-yoga-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-yoga-sage" />
                </div>
                <h3 className="text-xl font-semibold text-yoga-forest mb-2">Growing Community</h3>
                <p className="text-yoga-forest/70">Join our expanding network of wellness enthusiasts and practitioners.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yoga-terracotta/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-yoga-terracotta" />
                </div>
                <h3 className="text-xl font-semibold text-yoga-forest mb-2">Authentic Values</h3>
                <p className="text-yoga-forest/70">We prioritize genuine wellness and authentic yoga practices above all.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yoga-forest/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-yoga-forest" />
                </div>
                <h3 className="text-xl font-semibold text-yoga-forest mb-2">Quality Focus</h3>
                <p className="text-yoga-forest/70">We maintain high standards in everything we do and every partnership we form.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Collaborations;
