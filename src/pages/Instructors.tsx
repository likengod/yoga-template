import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Award, Star, Users, Mail, Phone, Edit, ShoppingCart, Facebook, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';
import ShareMenu from '@/components/ShareMenu';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import BookingDialog from '@/components/BookingDialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useInstructorsData, type InstructorBase } from '@/hooks/useInstructorsData';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { optimizeUnsplashUrl } from '@/lib/utils';
export interface Instructor extends InstructorBase {}

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3h-4V6.5c0-.8.2-1.1 1-1.1h3V2h-4.3C11.5 2 9 3.5 9 7.5V8z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.97 1.2 2.27 2.03 3.71 2.44v3.91c-1.3-.06-2.58-.51-3.66-1.28-1.07-.77-1.9-1.85-2.42-3.08v8.29c.07 2.28-1.1 4.47-3.07 5.64-1.97 1.17-4.48 1.17-6.45 0-1.97-1.17-3.14-3.36-3.07-5.64.07-2.28 1.86-4.14 4.14-4.24v4.01c-.69.03-1.32.41-1.67 1.01-.35.6-.35 1.34 0 1.94.35.6.98.98 1.67 1.01.7.03 1.36-.31 1.76-.89.4-.58.54-1.32.39-2.01V.02z"/>
  </svg>
);

const Instructors = () => {
  useScrollToTop();
  usePageMeta({
    title: 'Meet Our Instructors',
    description: 'Our team of certified and experienced yoga instructors are passionate about guiding you on your wellness journey with wisdom, compassion, and expertise.',
  });
  const navigate = useNavigate();
  const { instructors } = useInstructorsData();
  
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedInstructorName, setSelectedInstructorName] = useState('');
  
  // Sort instructors so that featured ones come first
  const sortedInstructors = [...instructors].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });
  
  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const toggleBio = (id: string) => {
    setExpandedBios(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const handleEditInstructor = () => {
    navigate('/admin');
    setTimeout(() => {
      const event = new CustomEvent('switchToInstructorsTab');
      window.dispatchEvent(event);
    }, 100);
  };

  // Check if user is logged in as admin
  const currentUser = localStorage.getItem('currentUser');
  const isAdmin = currentUser ? JSON.parse(currentUser).role === 'admin' : false;

  const totalPages = Math.ceil(sortedInstructors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInstructors = sortedInstructors.slice(startIndex, endIndex);

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

  return <div className="min-h-screen bg-yoga-cream">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yoga-cream to-yoga-sand text-center pb-6 pt-20 md:pb-12 md:pt-28">
        <div className="container mx-auto px-4 mt-4 mb-2 md:my-8">
          <div className="flex items-center justify-center gap-4 mb-2 md:mb-4">
            <h1 className="text-4xl lg:text-6xl font-bold text-yoga-forest mb-1 md:mb-2">Meet Our <span className="text-yoga-terracotta">Instructors</span></h1>
          </div>
          <p className="text-xs sm:text-lg md:text-xl text-yoga-forest/80 max-w-3xl mx-auto opacity-90 line-clamp-3 sm:line-clamp-none">
            Our team of certified and experienced yoga instructors are passionate about guiding you 
            on your wellness journey with wisdom, compassion, and expertise.
          </p>
        </div>
      </section>

      {/* Instructors Grid */}
      <section className="pt-4 pb-20 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 gap-y-16 pt-4 md:pt-12">
             {currentInstructors.map((instructor, index) => (
              <div 
                key={instructor.id} 
                id={instructor.id}
                className="relative flex flex-col bg-white rounded-md border border-gray-200 scroll-mt-24"
              >
                {/* Share Button Top Right */}
                <div className="absolute top-4 right-4 z-10">
                  <ShareMenu
                    title={instructor.name}
                    description={`${instructor.title} — ${instructor.description?.slice(0, 100)}`}
                    url={`${window.location.origin}/instructors#${instructor.id}`}
                    iconOnly
                    className="bg-white border-white/60 text-yoga-forest hover:bg-white/90 hover:text-yoga-forest shadow-sm h-8 w-8 rounded-full"
                  />
                </div>
                {/* Protruding Circular Image */}
                <div className="absolute -top-10 left-6 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md z-10">
                  <img loading="lazy" 
                    src={optimizeUnsplashUrl(instructor.image, 150, 60)} 
                    alt={instructor.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-6 pt-14 flex-1 flex flex-col">
                  {/* Name and Verified Badge */}
                  <div className="flex items-center space-x-1.5 mb-2">
                    <h3 className="text-lg xl:text-[17px] 2xl:text-[20px] font-serif text-yoga-forest leading-tight whitespace-nowrap tracking-tighter">
                      {instructor.name}
                    </h3>
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.965 17.5l-4.5-4.5 1.414-1.414 3.086 3.086 7.793-7.793 1.414 1.414-9.207 9.207z" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                    </svg>
                  </div>

                  {/* Title / Role */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-yoga-forest/70 text-sm font-medium">
                      {instructor.title}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <p className="text-yoga-forest/70 text-sm leading-relaxed">
                      {expandedBios[instructor.id] 
                        ? instructor.description 
                        : (instructor.description?.length > 75 
                            ? instructor.description.slice(0, 75) + '... ' 
                            : instructor.description)}
                      
                      {(instructor.description || '').length > 75 && (
                        <button 
                          onClick={() => toggleBio(instructor.id)}
                          className="text-yoga-forest font-bold hover:underline inline-flex items-center ml-1"
                        >
                          {expandedBios[instructor.id] ? 'Show less' : 'Read more detail \u2192'}
                        </button>
                      )}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="flex flex-col items-center justify-center p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <Users size={16} className="text-yoga-sage mb-1" />
                      <span className="font-medium text-yoga-forest/70 text-sm leading-tight">{instructor.students}</span>
                      <span className="text-[10px] text-yoga-forest/70">Students</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <Award size={16} className="text-yoga-sage mb-1" />
                      <span className="font-medium text-yoga-forest/70 text-sm leading-tight">{instructor.experience.replace(/years|yrs|year/i, '').trim() || instructor.experience}</span>
                      <span className="text-[10px] text-yoga-forest/70">Years Exp</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <Star size={16} className="text-yoga-sage mb-1" />
                      <span className="font-medium text-yoga-forest/70 text-sm leading-tight">{instructor.rating}</span>
                      <span className="text-[10px] text-yoga-forest/70">Score</span>
                    </div>
                  </div>

                  {/* Specializations (Bullets) */}
                  <ul className="space-y-2 mb-6 border-b border-gray-100 pb-6">
                    {instructor.specialization.split(/(?:,|&| and )/).map((spec, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-3" />
                        {spec.trim()}
                      </li>
                    ))}
                  </ul>



                  {/* Footer / Actions */}
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex flex-1 items-center space-x-3">
                      {instructor.facebook && (
                        <a href={instructor.facebook} target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:opacity-80 transition-opacity" title="Facebook">
                          <FacebookIcon className="w-4 h-4" />
                        </a>
                      )}
                      {instructor.instagram && (
                        <a href={instructor.instagram} target="_blank" rel="noopener noreferrer" className="text-[#E4405F] hover:opacity-80 transition-opacity" title="Instagram">
                          <InstagramIcon className="w-4 h-4" />
                        </a>
                      )}
                      {instructor.linkedin && (
                        <a href={instructor.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:opacity-80 transition-opacity" title="LinkedIn">
                          <LinkedinIcon className="w-4 h-4" />
                        </a>
                      )}
                      {instructor.twitter && (
                        <a href={instructor.twitter} target="_blank" rel="noopener noreferrer" className="text-[#1DA1F2] hover:opacity-80 transition-opacity" title="Twitter">
                          <TwitterIcon className="w-4 h-4" />
                        </a>
                      )}
                      {instructor.tiktok && (
                        <a href={instructor.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#000000] hover:opacity-80 transition-opacity" title="TikTok">
                          <TiktokIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => {
                          setSelectedInstructorName(instructor.name);
                          setIsBookingOpen(true);
                        }}
                        className="flex items-center text-[11px] font-medium text-[#1e4b85] bg-[#f8f9fa] hover:bg-[#f1f3f5] pl-3 pr-4 py-1.5 rounded-l-md shadow-[0_2px_4px_rgba(0,0,0,0.08)] -mr-6 transition-colors border-0"
                      >
                        <svg className="w-[14px] h-[14px] mr-1.5 text-[#111827]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        BOOK NOW
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 mb-8">
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
      </section>

      {/* Join Team CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="bg-gradient-to-r from-yoga-forest to-yoga-sage rounded-2xl p-8 text-white max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Passionate About Teaching Yoga?</h3>
            <p className="text-xl mb-6 opacity-90">
              We're always looking for certified yoga instructors who share our vision of 
              authentic, transformative yoga practice. Join our team!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-yoga-forest hover:bg-yoga-cream">
                View Open Positions
              </Button>
              <Button variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-yoga-forest">
                Submit Application
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <BookingDialog 
        open={isBookingOpen} 
        onOpenChange={setIsBookingOpen} 
        defaultInstructorName={selectedInstructorName} 
      />
      <Footer />
    </div>;
};
export default Instructors;
