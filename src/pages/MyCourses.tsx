import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { coursesService, Course } from '@/services/coursesService';
import { BookOpen, PlayCircle, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MyCourses = () => {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; role: string } | null>(null);

  useEffect(() => {
    document.title = 'Your Courses – SHAKTI YOGA';

    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/courses');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      const purchaseIds = coursesService.getPurchases(user.id);
      const allCourses = coursesService.getCourses();
      const enrolled = allCourses.filter(c => purchaseIds.includes(c.id));
      setEnrolledCourses(enrolled);
    } catch {
      navigate('/courses');
    }
  }, [navigate]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yoga-cream to-yoga-sand flex flex-col">
      <Header />

      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-yoga-forest">Your Learning Library</h1>
              <p className="text-yoga-forest/60 text-sm mt-1">Manage and watch all your enrolled Shakti Yoga courses.</p>
            </div>

            {enrolledCourses.length === 0 ? (
              /* Empty Library State */
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto space-y-6 mt-8">
                <div className="w-20 h-20 bg-yoga-sage/10 rounded-full flex items-center justify-center mx-auto text-yoga-sage">
                  <BookOpen size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-yoga-forest">No Enrolled Courses</h3>
                  <p className="text-yoga-forest/70 text-sm max-w-xs mx-auto">
                    You haven't purchased or enrolled in any courses yet. Start your journey today!
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/courses')}
                  className="bg-yoga-terracotta hover:bg-yoga-forest text-white rounded-full px-8 py-3"
                >
                  Browse Available Courses
                </Button>
              </div>
            ) : (
              /* Enrolled Courses Grid */
              <div className="grid md:grid-cols-2 gap-8">
                {enrolledCourses.map(course => {
                  const completed = coursesService.getProgress(currentUser.id, course.id);
                  const totalVideos = course.videos.length;
                  const progressPct = totalVideos > 0 ? Math.round((completed.length / totalVideos) * 100) : 0;
                  const isFinished = progressPct === 100;

                  return (
                    <div 
                      key={course.id} 
                      className="bg-white rounded-3xl overflow-hidden shadow-md flex flex-col border border-yoga-sage/10"
                    >
                      <div className="h-48 relative">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        
                        {isFinished && (
                          <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                            <Award size={12} /> Completed
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                        <div className="space-y-2">
                          <span className="text-xs text-yoga-sage font-bold uppercase tracking-wider">{course.category}</span>
                          <h3 className="text-xl font-bold text-yoga-forest leading-tight">{course.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-yoga-forest/50">
                            <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                            <span className="flex items-center gap-1"><PlayCircle size={12} /> {totalVideos} lessons</span>
                          </div>
                        </div>

                        {/* Progress Tracker */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold text-yoga-forest/70">
                            <span>Progress</span>
                            <span>{progressPct}% ({completed.length}/{totalVideos} parts)</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yoga-sage rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        <Button 
                          onClick={() => navigate(`/courses/${course.id}/watch`)}
                          className={`w-full py-5 rounded-full font-semibold shadow-sm transition-all ${
                            isFinished 
                              ? 'bg-yoga-forest hover:bg-yoga-sage text-white' 
                              : 'bg-yoga-sage hover:bg-yoga-forest text-white'
                          }`}
                        >
                          <PlayCircle size={16} className="mr-2" />
                          {isFinished ? 'Review Lessons' : 'Continue Learning'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyCourses;
