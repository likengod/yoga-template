
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Card } from '@/components/ui/card';
import { defaultSiteSettings, SiteSettingsData, LocationData } from '@/config/siteSettings';

interface ContactContent {
  heroTitle: string;
  heroSubtitle: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  phone: {
    primary: string;
    secondary: string;
    whatsapp: string;
  };
  email: {
    info: string;
    classes: string;
    support: string;
  };
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

const Contact = () => {
  usePageMeta({
    title: 'Contact Us',
    description: 'Get in touch with SHAKTI YOGA THEME. Ready to begin your yoga journey? We are here to support you every step of the way.',
  });
  const [content, setContent] = useState<ContactContent>({
    heroTitle: "Get In Touch",
    heroSubtitle: "Ready to begin your yoga journey? We're here to support you every step of the way.",
    address: {
      street: "123 Wellness Street",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400001",
      country: "India"
    },
    phone: {
      primary: "+91 87778 16410",
      secondary: "+91 87778 16410",
      whatsapp: "WhatsApp Available"
    },
    email: {
      info: "info@shaktiyogaraai.com",
      classes: "classes@shaktiyogaraai.com",
      support: "support@shaktiyogaraai.com"
    },
    hours: {
      weekdays: "Monday - Friday: 6:00 AM - 9:00 PM",
      saturday: "Saturday: 7:00 AM - 8:00 PM",
      sunday: "Sunday: 8:00 AM - 6:00 PM"
    }
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>(defaultSiteSettings);
  const [activeLocId, setActiveLocId] = useState<string>('default');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const storedContent = localStorage.getItem('contactContent');
    if (storedContent) {
      setContent(JSON.parse(storedContent));
    }
    
    const storedSettings = localStorage.getItem('siteSettings');
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setSiteSettings({ ...defaultSiteSettings, ...parsed });
        if (parsed.locations && parsed.locations.length > 0) {
          setActiveLocId(parsed.locations[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const locationsList: LocationData[] = siteSettings.locations && siteSettings.locations.length > 0
    ? siteSettings.locations
    : [
        {
          id: 'default',
          name: siteSettings.siteName || 'Mumbai Studio',
          phone: siteSettings.contactPhone || '',
          email: siteSettings.contactEmail || '',
          addressStreet: siteSettings.addressStreet || '',
          addressCity: siteSettings.addressCity || '',
          addressState: siteSettings.addressState || '',
          addressZip: siteSettings.addressZip || '',
          addressCountry: siteSettings.addressCountry || '',
          studioHoursWeekdays: siteSettings.studioHoursWeekdays || '',
          studioHoursSaturday: siteSettings.studioHoursSaturday || '',
          studioHoursSunday: siteSettings.studioHoursSunday || '',
          mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.062402127265!2d72.8274719!3d18.9840289!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce84fd099517%3A0xe9f70d55e0be30!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
        }
      ];

  const activeLocation = locationsList.find(loc => loc.id === activeLocId) || locationsList[0];

  const tabLocations = locationsList.slice(0, 3);
  const dropdownLocations = locationsList.slice(3);
  const isDropdownActive = locationsList.findIndex(loc => loc.id === activeLocId) >= 3;

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Our Studio',
      details: [
        activeLocation.addressStreet,
        `${activeLocation.addressCity}, ${activeLocation.addressState} ${activeLocation.addressZip}`,
        activeLocation.addressCountry
      ].filter(Boolean),
      color: 'bg-yoga-sage'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: [activeLocation.phone, siteSettings.socialFacebook ? 'WhatsApp Available' : ''].filter(Boolean),
      color: 'bg-yoga-terracotta'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: [activeLocation.email].filter(Boolean),
      color: 'bg-yoga-forest'
    },
    {
      icon: Clock,
      title: 'Studio Hours',
      details: [
        activeLocation.studioHoursWeekdays,
        activeLocation.studioHoursSaturday,
        activeLocation.studioHoursSunday
      ].filter(Boolean),
      color: 'bg-yoga-sage'
    }
  ];

  return (
    <div className="min-h-screen bg-yoga-cream">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-8 md:pt-32 md:pb-20 bg-gradient-to-br from-yoga-cream to-yoga-sand text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl lg:text-6xl font-bold text-yoga-forest mb-4 md:mb-6">
            {content.heroTitle.split(' ').slice(0, -1).join(' ')} <span className="text-yoga-terracotta">{content.heroTitle.split(' ').slice(-1)[0]}</span>
          </h1>
          <p className="text-xs sm:text-lg md:text-xl max-w-3xl mx-auto text-yoga-forest/80 leading-relaxed line-clamp-2 sm:line-clamp-none">{content.heroSubtitle}</p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="pt-4 pb-20 md:py-20">
        <div className="container mx-auto px-4">
          {/* Location Selector Tabs & Dropdown */}
          {locationsList.length > 1 && (
            <div className="relative flex flex-wrap gap-1.5 md:gap-2 justify-center mb-6 md:mb-10 bg-yoga-sage/10 p-1.5 md:p-2 rounded-xl max-w-3xl mx-auto border border-yoga-sage/20">
              {/* First 3 locations as tabs */}
              {tabLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => {
                    setActiveLocId(loc.id);
                    setDropdownOpen(false);
                  }}
                  className={`px-3 py-1.5 md:px-6 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                    activeLocation.id === loc.id && !isDropdownActive
                      ? 'bg-yoga-sage text-white shadow-sm'
                      : 'text-yoga-forest hover:bg-yoga-sage/15'
                  }`}
                >
                  {loc.name}
                </button>
              ))}

              {/* Dropdown for remaining locations (4th, 5th, etc.) */}
              {dropdownLocations.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`px-3 py-1.5 md:px-6 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                      isDropdownActive
                        ? 'bg-yoga-sage text-white shadow-sm'
                        : 'text-yoga-forest hover:bg-yoga-sage/15 border border-transparent'
                    }`}
                  >
                    <span>{isDropdownActive ? activeLocation.name : 'More'}</span>
                    <span className="text-[10px] md:text-xs">▼</span>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <>
                      {/* Backdrop to close */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setDropdownOpen(false)}
                      ></div>
                      
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {dropdownLocations.map((loc) => (
                          <button
                            key={loc.id}
                            onClick={() => {
                              setActiveLocId(loc.id);
                              setDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs md:text-sm transition-colors ${
                              activeLocation.id === loc.id
                                ? 'bg-yoga-sage/10 text-yoga-forest font-bold'
                                : 'text-yoga-forest/80 hover:bg-gray-100'
                            }`}
                          >
                            {loc.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info Cards */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl sm:text-3xl font-bold text-yoga-forest mb-2 sm:mb-6">Visit SHAKTI YOGA THEME</h3>
                <p className="text-xs sm:text-lg text-yoga-forest/80 mb-4 sm:mb-8 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  Located in the heart of {activeLocation.addressCity || 'Mumbai'}, our beautiful studio provides a peaceful sanctuary 
                  for your yoga practice. Experience our welcoming community and transformative classes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                {contactInfo.map((info, index) => (
                  <Card key={info.title} className="p-3 sm:p-6">
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 ${info.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4`}>
                      <info.icon className="text-white w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                    <h4 className="text-xs sm:text-xl font-semibold text-yoga-forest mb-1 sm:mb-3">{info.title}</h4>
                    <div className="space-y-0.5 sm:space-y-1">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-[10px] sm:text-sm text-yoga-forest/70 leading-tight">{detail}</p>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Map Container */}
              <Card className="overflow-hidden rounded-2xl h-64 border shadow-sm relative">
                {activeLocation.mapUrl ? (
                  <iframe
                    title={`${activeLocation.name} Google Map`}
                    src={activeLocation.mapUrl}
                    className="w-full h-full border-0"
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-yoga-sage to-yoga-forest flex items-center justify-center text-white text-center">
                    <div>
                      <MapPin size={48} className="mx-auto mb-4" />
                      <p className="text-xl font-medium">Interactive Map</p>
                      <p className="opacity-80">Google Map URL not configured</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="p-4 sm:p-8">
              <div className="mb-4 sm:mb-8">
                <h3 className="text-xl sm:text-3xl font-bold text-yoga-forest mb-2 sm:mb-4">Send Us a Message</h3>
                <p className="text-xs sm:text-base text-yoga-forest/80 line-clamp-3 sm:line-clamp-none">
                  Have questions about our classes or want to book a session? Fill out the form below 
                  and we'll get back to you within 24 hours.
                </p>
              </div>

              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-yoga-forest mb-2">First Name</label>
                    <Input type="text" placeholder="Your first name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yoga-forest mb-2">Last Name</label>
                    <Input type="text" placeholder="Your last name" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-yoga-forest mb-2">Email Address</label>
                  <Input type="email" placeholder="your.email@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yoga-forest mb-2">Phone Number</label>
                  <Input type="tel" placeholder="+91 87778 16410" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yoga-forest mb-2">Subject</label>
                  <Input type="text" placeholder="What would you like to discuss?" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yoga-forest mb-2">Message</label>
                  <Textarea 
                    placeholder="Tell us more about your yoga goals or any questions you have..."
                    rows={5}
                  />
                </div>

                <Button className="w-full bg-yoga-sage hover:bg-yoga-forest text-white py-3 text-lg flex items-center justify-center space-x-2">
                  <Send size={20} />
                  <span>Send Message</span>
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
