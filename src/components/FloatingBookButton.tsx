
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import BookingDialog from './BookingDialog';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const FloatingBookButton = () => {
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const settings = useSiteSettings();

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
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <Button 
          onClick={handleBookingClick}
          className="bg-yoga-sage hover:bg-yoga-forest text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full p-4"
          size="lg"
        >
          <Calendar size={20} className="mr-2" />
          Book Class
        </Button>
        
        <Button 
          onClick={handleWhatsAppContact}
          variant="outline"
          className="bg-white hover:bg-yoga-cream text-yoga-forest border-yoga-sage shadow-lg hover:shadow-xl transition-all duration-300 rounded-full p-4"
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
