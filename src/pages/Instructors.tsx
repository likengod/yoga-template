import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Award, Star, Users, Mail, Phone, Edit, ShoppingCart, Facebook, Instagram, Youtube } from 'lucide-react';
import ShareMenu from '@/components/ShareMenu';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
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
export interface Instructor extends InstructorBase {}
const Instructors = () => {
  useScrollToTop();
  usePageMeta({
    title: 'Meet Our Instructors',
    description: 'Our team of certified and experienced yoga instructors are passionate about guiding you on your wellness journey with wisdom, compassion, and expertise.',
  });
  const navigate = useNavigate();
  const { instructors } = useInstructorsData();
  
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
      <section className="bg-gradient-to-br from-yoga-cream to-yoga-sand text-center pb-12 pt-28">
        <div className="container mx-auto px-4 my-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl lg:text-6xl font-bold text-yoga-forest mb-2">Meet Our <span className="text-yoga-terracotta">Instructors</span></h1>
          </div>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Our team of certified and experienced yoga instructors are passionate about guiding you 
            on your wellness journey with wisdom, compassion, and expertise.
          </p>
        </div>
      </section>

      {/* Instructors Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 gap-y-16 pt-12">
            {currentInstructors.map((instructor, index) => (
              <div 
                key={instructor.id} 
                className="relative flex flex-col bg-white rounded-md border border-gray-200"
              >
                {/* Share Button Top Right */}
                <div className="absolute top-4 right-4 z-10">
                  <ShareMenu
                    title={instructor.name}
                    description={`${instructor.title} — ${instructor.description?.slice(0, 100)}`}
                    url={`${window.location.origin}/instructors`}
                    iconOnly
                  />
                </div>
                {/* Protruding Circular Image */}
                <div className="absolute -top-10 left-6 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md z-10">
                  <img loading="lazy" 
                    src={instructor.image} 
                    alt={instructor.name}
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
                      <a href="#" className="text-[#1877F2] hover:opacity-80 transition-opacity">
                        <Facebook className="w-4 h-4" />
                      </a>
                      <a href="#" className="text-[#E4405F] hover:opacity-80 transition-opacity">
                        <Instagram className="w-4 h-4" />
                      </a>
                      <a href="#" className="text-[#FF0000] hover:opacity-80 transition-opacity">
                        <Youtube className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-[11px] font-medium text-[#1e4b85] bg-[#f8f9fa] hover:bg-[#f1f3f5] pl-3 pr-4 py-1.5 rounded-l-md shadow-[0_2px_4px_rgba(0,0,0,0.08)] -mr-6 transition-colors border-0">
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
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-yoga-forest">
                Submit Application
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Instructors;
