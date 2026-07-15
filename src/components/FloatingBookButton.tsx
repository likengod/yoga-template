
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import BookingDialog from './BookingDialog';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const FloatingBookButton = () => {
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const settings = useSiteSettings();
  const location = useLocation();

  // Hide on admin panel — admins/instructors don't need the public booking button
  if (location.pathname.startsWith('/admin')) return null;

  const handleWhatsAppContact = () => {
    const phoneNumber = (settings.whatsappNumber || settings.contactPhone || '').replace(/\D/g, '');
    const message = "Hi! I would like to book a class at SHAKTI YOGA THEME. Could you please provide information about available classes and schedules?";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBookingClick = () => {
    setShowBookingDialog(true);
  };

  return (
    <>
      <div className="fixed bottom-24 right-6 md:bottom-6 z-50 flex flex-col gap-3 print:hidden">
        <Button 
          onClick={handleBookingClick}
          className="bg-yoga-sage hover:bg-yoga-forest text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full px-4 md:px-6 h-10 md:h-12 flex items-center justify-center font-medium text-xs md:text-base"
          size="lg"
        >
          <Calendar className="w-4 h-4 md:w-[18px] md:h-[18px] mr-1.5 md:mr-2" />
          Book Class
        </Button>
        
        <Button 
          onClick={handleWhatsAppContact}
          variant="outline"
          className="bg-white hover:bg-yoga-cream text-yoga-forest border-yoga-sage/50 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full px-4 md:px-6 h-10 md:h-12 flex items-center justify-center font-medium text-xs md:text-base"
          size="lg"
        >
          WhatsApp
        </Button>
      </div>
      
      <BookingDialog 
        open={showBookingDialog} 
        onOpenChange={setShowBookingDialog}
      />
    </>
  );
};

export default FloatingBookButton;
