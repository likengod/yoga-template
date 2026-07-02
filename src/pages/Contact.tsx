
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Card } from '@/components/ui/card';
import { defaultSiteSettings, SiteSettingsData } from '@/config/siteSettings';

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

  useEffect(() => {
    const storedContent = localStorage.getItem('contactContent');
    if (storedContent) {
      setContent(JSON.parse(storedContent));
    }
    
    const storedSettings = localStorage.getItem('siteSettings');
    if (storedSettings) {
      try {
        setSiteSettings({ ...defaultSiteSettings, ...JSON.parse(storedSettings) });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Our Studio',
      details: [
        siteSettings.addressStreet,
        `${siteSettings.addressCity}, ${siteSettings.addressState} ${siteSettings.addressZip}`,
        siteSettings.addressCountry
      ].filter(Boolean),
      color: 'bg-yoga-sage'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: [siteSettings.contactPhone, siteSettings.socialWhatsapp ? 'WhatsApp Available' : ''],
      color: 'bg-yoga-terracotta'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: [siteSettings.contactEmail],
      color: 'bg-yoga-forest'
    },
    {
      icon: Clock,
      title: 'Studio Hours',
      details: [
        siteSettings.studioHoursWeekdays,
        siteSettings.studioHoursSaturday,
        siteSettings.studioHoursSunday
      ].filter(Boolean),
      color: 'bg-yoga-sage'
    }
  ];

  return (
    <div className="min-h-screen bg-yoga-cream">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-yoga-cream to-yoga-sand text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl lg:text-6xl font-bold text-yoga-forest mb-6">
            {content.heroTitle.split(' ').slice(0, -1).join(' ')} <span className="text-yoga-terracotta">{content.heroTitle.split(' ').slice(-1)[0]}</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-yoga-forest/80 leading-relaxed">{content.heroSubtitle}</p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info Cards */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-yoga-forest mb-6">Visit SHAKTI YOGA THEME</h3>
                <p className="text-lg text-yoga-forest/80 mb-8 leading-relaxed">
                  Located in the heart of Mumbai, our beautiful studio provides a peaceful sanctuary 
                  for your yoga practice. Experience our welcoming community and transformative classes.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {contactInfo.map((info, index) => (
                  <Card key={info.title} className="p-6">
                    <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center mb-4`}>
                      <info.icon className="text-white" size={24} />
                    </div>
                    <h4 className="text-xl font-semibold text-yoga-forest mb-3">{info.title}</h4>
                    <div className="space-y-1">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-yoga-forest/70">{detail}</p>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Map Placeholder */}
              <Card className="bg-gradient-to-br from-yoga-sage to-yoga-forest rounded-2xl h-64 flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin size={48} className="mx-auto mb-4" />
                  <p className="text-xl font-medium">Interactive Map</p>
                  <p className="opacity-80">Google Maps Integration</p>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="p-8">
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-yoga-forest mb-4">Send Us a Message</h3>
                <p className="text-yoga-forest/80">
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
