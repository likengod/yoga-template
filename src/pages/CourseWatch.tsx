import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { coursesService, Course, CourseVideo } from '@/services/coursesService';
import { PlayCircle, Lock, CheckCircle, ArrowLeft, ShieldAlert, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CourseWatch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; role: string; email?: string } | null>(null);
  const [activeVideo, setActiveVideo] = useState<CourseVideo | null>(null);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  // Load course and user purchase state
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Please log in to watch this course."
      });
      navigate('/courses');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      if (id) {
        const found = coursesService.getCourse(id);
        if (!found) {
          navigate('/courses');
          return;
        }

        const owns = coursesService.hasPurchased(user.id, found.id);
        if (!owns) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You must enroll in this course to watch it."
          });
          navigate(`/courses/${found.id}`);
          return;
        }

        setCourse(found);
        document.title = `Watching: ${found.title} – SHAKTI YOGA`;

        // Load progress & set active video
        const progress = coursesService.getProgress(user.id, found.id);
        setCompletedVideos(progress);

        // Sort videos and set the first video as default
        const sorted = [...found.videos].sort((a, b) => a.order - b.order);
        setActiveVideo(sorted[0]);
      }
    } catch (e) {
      navigate('/courses');
    }
  }, [id, navigate, toast]);

  // Anti-Theft / Screen Capture / Developer Tools Prevention Listeners
  useEffect(() => {
    // 1. Disable Right Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: "Security Shield Active",
        description: "Right-click context menu is disabled for video protection.",
        duration: 2000
      });
    };

    // 2. Disable Keyboard Shortcuts (DevTools, PrintScreen, Print)
    const handleKeyDown = (e: KeyboardEvent) => {
      const keysToBlock = ['F12', 'PrintScreen'];
      const ctrlKeys = ['i', 'j', 'c', 'u', 'p', 's'];
      
      if (keysToBlock.includes(e.key)) {
        e.preventDefault();
        setShowSecurityWarning(true);
        setTimeout(() => setShowSecurityWarning(false), 3000);
      }

      if (e.ctrlKey && (ctrlKeys.includes(e.key.toLowerCase()) || e.shiftKey && ctrlKeys.includes(e.key.toLowerCase()))) {
        e.preventDefault();
        setShowSecurityWarning(true);
        setTimeout(() => setShowSecurityWarning(false), 3000);
      }
    };

    // 3. Clear Clipboard if screenshot button was clicked
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        toast({
          variant: "destructive",
          title: "Capture Blocked",
          description: "Screenshots are restricted. Video contents are protected."
        });
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [toast]);

  if (!course || !currentUser || !activeVideo) return null;

  const sortedVideos = [...course.videos].sort((a, b) => a.order - b.order);

  const handleMarkComplete = () => {
    if (!currentUser || !course || !activeVideo) return;

    coursesService.markVideoComplete(currentUser.id, course.id, activeVideo.id);
    const newProgress = [...completedVideos];
    if (!newProgress.includes(activeVideo.id)) {
      newProgress.push(activeVideo.id);
      setCompletedVideos(newProgress);
    }

    toast({
      title: "Lesson Completed! 🧘‍♀️",
      description: `Great job completing "${activeVideo.title}".`
    });

    // Auto-unlock next lesson if exists
    const nextVideo = sortedVideos.find(v => v.order === activeVideo.order + 1);
    if (nextVideo) {
      setActiveVideo(nextVideo);
      toast({
        title: "Next Lesson Unlocked",
        description: `Now playing: "${nextVideo.title}"`
      });
    } else {
      toast({
        title: "Course Finished! 🎓",
        description: "You have completed all lessons in this course! Excellent dedication.",
        duration: 5000
      });
    }
  };

  const handleVideoSelect = (video: CourseVideo) => {
    const isUnlocked = coursesService.isVideoUnlocked(currentUser.id, course.id, video, course.videos);
    if (!isUnlocked) {
      toast({
        variant: "destructive",
        title: "Lesson Locked",
        description: "Please complete all previous parts to unlock this lesson."
      });
      return;
    }
    setActiveVideo(video);
  };

  return (
    <div className="min-h-screen bg-yoga-cream/40 flex flex-col select-none">
      <Header />

      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4">
          
          {/* Breadcrumb Header */}
          <div className="mb-6 flex items-center justify-between">
            <Link to={`/courses/${course.id}`} className="inline-flex items-center text-sm font-semibold text-yoga-sage hover:text-yoga-forest transition-colors">
              <ArrowLeft size={16} className="mr-1.5" /> Back to Course details
            </Link>
            <div className="text-xs font-semibold text-yoga-forest/50">
              Logged in as: <span className="text-yoga-sage">{currentUser.username}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Video Player & Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Protected Video Container */}
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-yoga-sage/20">
                
                {/* Anti-Theft Watermark Overlay */}
                <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center">
                  <div className="text-white/10 font-bold text-lg md:text-2xl uppercase tracking-widest text-center select-none rotate-12">
                    {currentUser.username} ({currentUser.email || 'student@example.com'})<br />
                    Protected by Shakti Yoga Shield
                  </div>
                </div>

                {/* Security warning popup alert */}
                {showSecurityWarning && (
                  <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-40 p-6 animate-pulse">
                    <ShieldAlert size={48} className="text-red-500 mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold">Screenshot & Capture Restrained</h3>
                    <p className="text-sm text-gray-400 mt-2 text-center max-w-sm">
                      Copying, recording, and developer panel tools are strictly restricted on this video player.
                    </p>
                  </div>
                )}

                {/* Playback Frame */}
                <iframe
                  src={activeVideo.source}
                  title={activeVideo.title}
                  className="absolute inset-0 w-full h-full border-none select-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Lesson Description & Actions */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-yoga-sage font-bold uppercase tracking-wider">Playing Part {activeVideo.order}</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-yoga-forest mt-1">{activeVideo.title}</h2>
                  </div>

                  {completedVideos.includes(activeVideo.id) ? (
                    <Button disabled className="bg-green-100 text-green-700 hover:bg-green-100 rounded-full px-6 py-6 font-semibold flex items-center gap-2">
                      <CheckCircle size={18} /> Completed
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleMarkComplete} 
                      className="bg-yoga-sage hover:bg-yoga-forest text-white rounded-full px-6 py-6 font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      <CheckCircle size={18} className="mr-2" /> Mark Lesson Complete
                    </Button>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-semibold text-yoga-forest text-lg mb-2">Lesson Description</h3>
                  <p className="text-yoga-forest/70 leading-relaxed text-sm">{activeVideo.description}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Playlist Checklist */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold text-xl text-yoga-forest">Course Curriculum</h3>
                  <p className="text-xs text-yoga-forest/50 mt-1">Sequential learning: complete lessons to unlock parts.</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-yoga-forest/60">
                    <span>Your Progress</span>
                    <span>{Math.round((completedVideos.length / sortedVideos.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yoga-sage rounded-full transition-all duration-500"
                      style={{ width: `${(completedVideos.length / sortedVideos.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Video list */}
                <div className="space-y-3">
                  {sortedVideos.map((vid, idx) => {
                    const isUnlocked = coursesService.isVideoUnlocked(currentUser.id, course.id, vid, course.videos);
                    const isActive = activeVideo.id === vid.id;
                    const isCompleted = completedVideos.includes(vid.id);

                    return (
                      <button
                        key={vid.id}
                        onClick={() => handleVideoSelect(vid)}
                        disabled={!isUnlocked}
                        className={`w-full text-left p-3.5 border rounded-2xl transition-all flex items-start justify-between gap-3 ${
                          isActive 
                            ? 'bg-yoga-sage/10 border-yoga-sage text-yoga-forest font-semibold'
                            : isUnlocked 
                              ? 'bg-white hover:bg-yoga-cream/20 border-yoga-sage/20 text-yoga-forest/80' 
                              : 'bg-gray-50/50 border-gray-100 text-gray-400 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle size={18} className="text-green-600 fill-green-50" />
                            ) : (
                              <PlayCircle size={18} className={isActive ? 'text-yoga-sage' : 'text-gray-400'} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold leading-tight">Part {vid.order}: {vid.title}</p>
                            <p className="text-xs opacity-75 mt-1 truncate max-w-[170px]">{vid.duration}</p>
                          </div>
                        </div>

                        {!isUnlocked && (
                          <Lock size={14} className="text-gray-400 mt-1 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Safe Practices Certificate Info */}
              <div className="bg-gradient-to-br from-yoga-sage to-yoga-forest text-white p-6 rounded-3xl shadow-sm text-center space-y-4">
                <Award size={36} className="mx-auto text-yoga-cream" />
                <h4 className="font-bold text-lg leading-snug">Certificate of Completion</h4>
                <p className="text-xs opacity-90 leading-relaxed">
                  Finish watching all videos in order to earn a certified Shakti Yoga qualification signed by Lead Instructor Sushmita Debnath.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseWatch;
