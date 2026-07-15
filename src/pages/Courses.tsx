import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareMenu from '@/components/ShareMenu';
import { coursesService, Course } from '@/services/coursesService';
import { BookOpen, Clock, Users, Star, PlayCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePageMeta } from '@/hooks/usePageMeta';
import { detectIsIndianUser } from '@/utils/currency';

// ─── Level badge colours ─────────────────────────────────────────────────────
const levelColors: Record<string, string> = {
  'Beginner': 'bg-green-100 text-green-700',
  'Intermediate': 'bg-yellow-100 text-yellow-700',
  'Advanced': 'bg-red-100 text-red-700',
  'All Levels': 'bg-blue-100 text-blue-700',
};

const ITEMS_PER_PAGE = 8; // 4 cols × 2 rows

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; role: string } | null>(null);
  const [purchases, setPurchases] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const isIndian = useMemo(() => detectIsIndianUser(), []);

  const coursesSchema = useMemo(() => {
    if (courses.length === 0) return undefined;
    return [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Yoga & Meditation Courses - Shakti Yoga",
        "description": "Transform your practice with expert-led video courses. Watch anytime, anywhere. Sequential learning with video lessons.",
        "url": window.location.href,
        "itemListElement": courses.map((course, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Course",
            "@id": `${window.location.origin}/courses/${course.id}#course`,
            "name": course.title,
            "description": course.description,
            "provider": {
              "@type": "Organization",
              "name": "Shakti Yoga Raai",
              "sameAs": window.location.origin
            },
            "image": course.thumbnail,
            "offers": {
              "@type": "Offer",
              "price": course.price,
              "priceCurrency": "INR"
            }
          }
        }))
      }
    ];
  }, [courses]);

  usePageMeta({
    title: 'Yoga & Meditation Courses',
    description: 'Transform your practice with expert-led video courses. Watch anytime, anywhere. Sequential learning with video lessons.',
    schemas: coursesSchema,
  });

  useEffect(() => {
    // Featured first, then sorted by enrolledCount desc
    const all = coursesService.getCourses()
      .filter(c => c.published)
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.enrolledCount - a.enrolledCount;
      });
    setCourses(all);

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        setPurchases(coursesService.getPurchases(user.id));
      } catch { /* no-op */ }
    }
  }, []);

  const handleEnroll = (course: Course) => {
    if (!currentUser) {
      alert('Please log in to purchase a course.');
      return;
    }
    navigate(`/courses/${course.id}`);
  };

  const handleWatch = (course: Course) => {
    navigate(`/courses/${course.id}/watch`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = useMemo(() => Math.ceil(courses.length / ITEMS_PER_PAGE), [courses]);
  const startIndex = useMemo(() => (currentPage - 1) * ITEMS_PER_PAGE, [currentPage]);
  const currentCourses = useMemo(() => courses.slice(startIndex, startIndex + ITEMS_PER_PAGE), [courses, startIndex]);

  const formatPrice = (course: Course) => {
    if (isIndian) {
      return `₹${course.price.toLocaleString('en-IN')}`;
    }
    const usd = course.priceUSD ?? Math.round(course.price / 83);
    return `$${usd.toFixed(0)}`;
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i} className="cursor-pointer">{i}</PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => handlePageChange(1)} isActive={currentPage === 1} className="cursor-pointer">1</PaginationLink>
        </PaginationItem>
      );
      if (currentPage > 3) items.push(<PaginationItem key="es"><PaginationEllipsis /></PaginationItem>);
      const sp = Math.max(2, currentPage - 1);
      const ep = Math.min(totalPages - 1, currentPage + 1);
      for (let i = sp; i <= ep; i++) {
        if (i !== 1 && i !== totalPages) {
          items.push(
            <PaginationItem key={i}>
              <PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i} className="cursor-pointer">{i}</PaginationLink>
            </PaginationItem>
          );
        }
      }
      if (currentPage < totalPages - 2) items.push(<PaginationItem key="ee"><PaginationEllipsis /></PaginationItem>);
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => handlePageChange(totalPages)} isActive={currentPage === totalPages} className="cursor-pointer">{totalPages}</PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  return (
    <div className="min-h-screen bg-yoga-cream flex flex-col justify-between">
      <div>
        <Header />

        {/* Hero */}
        <section className="pt-28 pb-8 bg-yoga-cream">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-yoga-forest mb-4 md:mb-6">
              Yoga &amp; Meditation <span className="text-yoga-terracotta">Courses</span>
            </h1>
            <p className="text-xs sm:text-base md:text-lg text-yoga-forest/80 max-w-3xl mx-auto leading-relaxed">
              Transform your practice with expert-led video courses. Watch anytime, anywhere. Sequential learning with video lessons.
            </p>
            {courses.length > 0 && (
              <p className="text-sm text-yoga-sage mt-2">
                {courses.length} courses available &nbsp;•&nbsp; Prices shown in {isIndian ? 'Indian Rupees (₹)' : 'US Dollars ($)'}
              </p>
            )}
          </div>
        </section>

        {/* Grid */}
        <section className="pb-20 bg-yoga-cream">
          <div className="container mx-auto px-4">
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-24 h-24 bg-yoga-sage/10 rounded-full flex items-center justify-center mb-6">
                  <BookOpen size={40} className="text-yoga-sage" />
                </div>
                <h2 className="text-3xl font-bold text-yoga-forest mb-4">Courses Coming Soon</h2>
                <p className="text-yoga-forest/60 text-lg max-w-md">
                  We are working hard to bring you amazing yoga courses. <br />
                  <span className="font-semibold text-yoga-terracotta">Update soon — stay tuned! 🧘‍♀️</span>
                </p>
              </div>
            ) : (
              <>
                {/* 4-column grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {currentCourses.map(course => {
                    const owned = currentUser ? purchases.includes(course.id) : false;
                    const shareUrl = `${window.location.origin}/courses/${course.id}`;
                    return (
                      <div
                        key={course.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col group"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            width={400}
                            height={176}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                          {/* Badges top-left */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {course.featured && (
                              <span className="flex items-center gap-1 bg-yoga-terracotta text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                <Sparkles size={10} /> Featured
                              </span>
                            )}
                            {owned && (
                              <span className="flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                <PlayCircle size={10} /> Purchased
                              </span>
                            )}
                          </div>

                          {/* Level badge bottom-left */}
                          <div className="absolute bottom-2 left-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${levelColors[course.level]}`}>
                              {course.level}
                            </span>
                          </div>

                          {/* Share icon top-right — always visible */}
                          <div className="absolute top-2 right-2">
                            <ShareMenu
                              title={course.title}
                              description={course.description}
                              url={shareUrl}
                              iconOnly
                              className="bg-white border-white/60 text-yoga-forest hover:bg-white/90 hover:text-yoga-forest shadow-sm h-7 w-7 rounded-full [&>svg]:text-yoga-forest"
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-1">
                          <span className="text-[10px] text-yoga-sage font-semibold uppercase tracking-wider">{course.category}</span>
                          <h3
                            className="text-sm font-bold text-yoga-forest mt-1 mb-1 leading-snug cursor-pointer hover:text-yoga-terracotta transition-colors line-clamp-2"
                            onClick={() => navigate(`/courses/${course.id}`)}
                          >
                            {course.title}
                          </h3>
                          <p className="text-yoga-forest/60 text-xs mb-3 leading-relaxed line-clamp-2 flex-1">
                            {course.description}
                          </p>

                          {/* Meta row */}
                          <div className="flex items-center gap-2 text-[10px] text-yoga-forest/50 mb-2">
                            <span className="flex items-center gap-0.5"><Clock size={10} />{course.duration}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><PlayCircle size={10} />{course.videos.length} videos</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><Users size={10} />{course.enrolledCount}</span>
                          </div>

                          {/* Stars */}
                          <div className="flex items-center gap-0.5 mb-3">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={10} className={s <= Math.round(course.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                            ))}
                            <span className="text-[10px] text-yoga-forest/50 ml-1">{course.rating}</span>
                          </div>

                          {/* Price + CTA — matching /classes design */}
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                            <div className="min-w-0">
                              <div className="text-base font-extrabold text-yoga-forest">{formatPrice(course)}</div>
                              <div className="text-[9px] text-yoga-forest/40 leading-tight">one-time</div>
                            </div>
                            {owned ? (
                              <Button
                                onClick={() => handleWatch(course)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full text-xs px-3 py-1 h-auto shrink-0"
                              >
                                <PlayCircle size={12} className="mr-1" /> Watch
                              </Button>
                            ) : (
                              <button
                                onClick={() => handleEnroll(course)}
                                className="flex items-center text-xs font-semibold text-white bg-yoga-sage hover:bg-yoga-sage/90 pl-4 pr-5 py-2 rounded-l-md shadow-[0_2px_4px_rgba(0,0,0,0.08)] -mr-6 transition-colors"
                              >
                                <svg className="w-[14px] h-[14px] mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                ENROLL NOW
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12">
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
              </>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Courses;
