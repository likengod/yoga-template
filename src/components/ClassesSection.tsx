
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Calendar, Star, Video, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ShareMenu from '@/components/ShareMenu';
import BookingDialog from '@/components/BookingDialog';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useClassesData } from '@/hooks/useClassesData';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface OnlineClass {
  id: string;
  title: string;
  instructor: string;
  description: string;
  price: string;
  duration: string;
  capacity: string;
  schedule: string;
  level: string;
  rating: number;
  features: string[];
  image: string;
  joinLink?: string;
  maxSeats?: number;
  availableSeats?: number;
  featured?: boolean;
}

const ClassesSection = () => {
  const { toast } = useToast();
  const settings = useSiteSettings();
  const { classes, isLoading } = useClassesData();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedClassTitle, setSelectedClassTitle] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleWhatsAppJoin = (classTitle: string, price: string) => {
    const phoneNumber = (settings.whatsappNumber || settings.contactPhone || '').replace(/\D/g, '');
    const message = `Hi! I would like to join the "${classTitle}" online class (${price}). Please provide me with joining details and payment information.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const sortedClasses = [...classes].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  const totalPages = Math.ceil(sortedClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClasses = sortedClasses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          items.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => handlePageChange(i)}
                isActive={currentPage === i}
                className="cursor-pointer"
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  return (
    <section className="py-16 bg-yoga-cream">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold text-yoga-forest mb-6">
            Online <span className="text-yoga-terracotta">Yoga</span> Classes
          </h1>
          <p className="text-lg text-yoga-forest/80 max-w-3xl mx-auto">
            Join our live online yoga sessions from the comfort of your home. Expert instruction, 
            personal attention, and a supportive community await you.
          </p>
          {classes.length > 0 && (
            <p className="text-sm text-yoga-sage mt-2">
              {classes.length} classes available
            </p>
          )}
        </div>

        {/* Features Banner */}
        <div className="bg-white rounded-xl p-6 mb-12 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Video className="w-8 h-8 text-yoga-sage mb-2" />
              <h3 className="font-semibold text-yoga-forest">Live HD Classes</h3>
              <p className="text-sm text-yoga-forest/70">Crystal clear video quality</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-yoga-sage mb-2" />
              <h3 className="font-semibold text-yoga-forest">Small Groups</h3>
              <p className="text-sm text-yoga-forest/70">Personal attention guaranteed</p>
            </div>
            <div className="flex flex-col items-center">
              <Wifi className="w-8 h-8 text-yoga-sage mb-2" />
              <h3 className="font-semibold text-yoga-forest">Easy Access</h3>
              <p className="text-sm text-yoga-forest/70">Join from any device</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 text-yoga-sage mb-2" />
              <h3 className="font-semibold text-yoga-forest">Expert Teachers</h3>
              <p className="text-sm text-yoga-forest/70">Certified professionals</p>
            </div>
          </div>
        </div>

        {/* Classes List */}
        {classes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Video className="w-16 h-16 mx-auto text-yoga-sage mb-4" />
            <h3 className="text-xl font-bold text-yoga-forest mb-2">No Classes Available</h3>
            <p className="text-yoga-forest/70">
              Check back later for new online sessions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentClasses.map((yogaClass) => (
              <div 
                key={yogaClass.id} 
                className="relative flex flex-col bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Rectangular Image with Price Badge & Share */}
                <div className="relative w-full h-48 overflow-hidden rounded-t-md group">
                  <img loading="lazy" 
                    src={yogaClass.image} 
                    alt={yogaClass.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-[#9eab91] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {yogaClass.price.match(/[₹$]\s*[\d,]+/) ? yogaClass.price.match(/[₹$]\s*[\d,]+/)?.[0] : yogaClass.price}
                  </div>
                  
                  {/* Share Button */}
                  <div className="absolute bottom-3 right-3">
                    <ShareMenu
                      title={yogaClass.title}
                      description={`${yogaClass.instructor} • ${yogaClass.price} • ${yogaClass.schedule}`}
                      url={`${window.location.origin}/classes`}
                      iconOnly
                      className="bg-white/90 backdrop-blur-sm border-white/50 hover:bg-white"
                    />
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* Title and Description */}
                  <div className="mb-4">
                    <h3 className="text-xl font-serif text-yoga-forest mb-2 leading-tight">
                      {yogaClass.title}
                    </h3>
                    <div className="text-yoga-forest/70 text-sm">
                      <p className={expandedCards[yogaClass.id] ? "" : "line-clamp-3"}>
                        {yogaClass.description}
                      </p>
                      {yogaClass.description.length > 100 && (
                        <button 
                          onClick={() => toggleExpand(yogaClass.id)}
                          className="text-yoga-forest hover:underline font-bold mt-1 inline-block"
                        >
                          {expandedCards[yogaClass.id] ? 'Show less' : 'Read more...'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex justify-between items-center mb-3 text-xs text-yoga-sage font-medium">
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {yogaClass.duration.replace('minutes', 'min')}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1" />
                      {yogaClass.capacity.replace('students', '+').replace(' ', '')}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      {yogaClass.level}
                    </div>
                  </div>

                  {/* Price Row */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-slate-700 text-white text-[10px] font-bold px-3 py-1 rounded-r-md uppercase tracking-wider -ml-6 shadow-sm">
                      Starting At
                    </span>
                    <span className="text-lg font-bold text-slate-800">
                      {yogaClass.price.match(/[₹$]\s*[\d,]+/) ? yogaClass.price.match(/[₹$]\s*[\d,]+/)?.[0] : yogaClass.price}
                    </span>
                  </div>


                  {/* Features */}
                  <ul className="space-y-1.5 mb-4 flex-1">
                    {yogaClass.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start text-xs font-medium text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Book Now (Moved to Bottom Right) */}
                  <div className="flex justify-end items-center mt-4">
                    <button 
                      onClick={() => {
                        setSelectedClassTitle(yogaClass.title);
                        setIsBookingOpen(true);
                      }}
                      className="flex items-center text-xs font-semibold text-white bg-yoga-sage hover:bg-yoga-sage/90 pl-4 pr-5 py-2 rounded-l-md shadow-[0_2px_4px_rgba(0,0,0,0.08)] -mr-6 transition-colors"
                      disabled={(yogaClass.availableSeats || 0) === 0}
                    >
                      <svg className="w-[14px] h-[14px] mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      {(yogaClass.availableSeats || 0) === 0 ? 'FULL' : 'BOOK NOW'}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 mb-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16 bg-white rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-yoga-forest mb-4">
            Ready to Start Your Online Yoga Journey?
          </h2>
          <p className="text-yoga-forest/80 mb-6 max-w-2xl mx-auto">
            Join thousands of students who have transformed their lives through our online yoga classes. 
            Experience the convenience of practicing from home with expert guidance.
          </p>
          <Button 
            onClick={() => {
              setSelectedClassTitle(undefined);
              setIsBookingOpen(true);
            }}
            size="lg" 
            className="bg-yoga-sage hover:bg-yoga-forest px-8"
          >
            Get Started Today
          </Button>
        </div>
      </div>
      <BookingDialog open={isBookingOpen} onOpenChange={setIsBookingOpen} defaultClassType={selectedClassTitle} />
    </section>
  );
};

export default ClassesSection;
