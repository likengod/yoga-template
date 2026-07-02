import React from 'react';
import { MapPin, Phone, Mail, Clock, Send, Users, Star, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Contact = () => {
  const settings = useSiteSettings();
  
  const contactInfo = [{
    icon: MapPin,
    title: 'Visit Our Studio',
    details: [
      settings.addressStreet,
      `${settings.addressCity}, ${settings.addressState} ${settings.addressZip}`,
      settings.addressCountry
    ],
    color: 'bg-yoga-sage'
  }, {
    icon: Phone,
    title: 'Call Us',
    details: [settings.contactPhone, settings.whatsappNumber, 'WhatsApp Available'],
    color: 'bg-yoga-terracotta'
  }, {
    icon: Mail,
    title: 'Email Us',
    details: [settings.contactEmail],
    color: 'bg-yoga-forest'
  }, {
    icon: Clock,
    title: 'Studio Hours',
    details: [settings.studioHoursWeekdays, settings.studioHoursSaturday, settings.studioHoursSunday],
    color: 'bg-yoga-sage'
  }];

  const featuredClasses = [{
    id: '1',
    title: 'Morning Hatha Yoga',
    instructor: 'Sushmita Debnath',
    price: '₹1,200',
    duration: '60 minutes',
    schedule: 'Mon, Wed, Fri - 7:00 AM IST',
    level: 'All Levels',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }, {
    id: '2',
    title: 'Vinyasa Flow Evening',
    instructor: 'Sannidhya Krishna Das',
    price: '₹1,500',
    duration: '75 minutes',
    schedule: 'Tue, Thu, Sat - 6:30 PM IST',
    level: 'Intermediate',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }, {
    id: '3',
    title: 'Meditation & Pranayama',
    instructor: 'Shivam Misra',
    price: '₹800',
    duration: '45 minutes',
    schedule: 'Daily - 8:00 PM IST',
    level: 'All Levels',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }];
  const handleWhatsAppJoin = (classTitle: string, price: string) => {
    const phoneNumber = (settings.whatsappNumber || settings.contactPhone || '').replace(/\D/g, '');
    const message = `Hi! I would like to join the "${classTitle}" online class (${price}). Please provide me with joining details and payment information.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };
  return <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-yoga-forest mb-4">Get in Touch</h2>
          <p className="text-xl text-yoga-forest/80 max-w-3xl mx-auto">
            Ready to begin your yoga journey? Connect with us today and discover the path to wellness.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <div className="grid sm:grid-cols-2 gap-6 mb-12">
              {contactInfo.map((info, index) => <Card key={info.title} className="p-6">
                  <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center mb-4`}>
                    <info.icon className="text-white" size={24} />
                  </div>
                  <h4 className="text-lg font-semibold text-yoga-forest mb-3">{info.title}</h4>
                  <div className="space-y-1">
                    {info.details.map((detail, idx) => <p key={idx} className="text-yoga-forest/70 text-sm">{detail}</p>)}
                  </div>
                </Card>)}
            </div>

            {/* Featured Online Classes */}
            
          </div>

          {/* Contact Form */}
          <Card className="p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl text-yoga-forest">Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
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
                  <label className="block text-sm font-medium text-yoga-forest mb-2">Email</label>
                  <Input type="email" placeholder="your.email@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yoga-forest mb-2">Phone</label>
                  <Input type="tel" placeholder="+91 87778 16410" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-yoga-forest mb-2">Message</label>
                  <Textarea placeholder="Tell us about your yoga goals or any questions you have..." rows={4} />
                </div>

                <Button className="w-full bg-yoga-sage hover:bg-yoga-forest text-white flex items-center justify-center space-x-2">
                  <Send size={16} />
                  <span>Send Message</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>;
};
export default Contact;
