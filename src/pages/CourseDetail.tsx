import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { coursesService, Course } from '@/services/coursesService';
import { BookOpen, Clock, Users, Star, Lock, PlayCircle, ShieldCheck, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePageMeta } from '@/hooks/usePageMeta';
import ShareMenu from '@/components/ShareMenu';
import { detectIsIndianUser } from '@/utils/currency';

const levelColors: Record<string, string> = {
  'Beginner': 'bg-green-100 text-green-700',
  'Intermediate': 'bg-yellow-100 text-yellow-700',
  'Advanced': 'bg-red-100 text-red-700',
  'All Levels': 'bg-blue-100 text-blue-700',
};

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; role: string } | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isIndian = useMemo(() => detectIsIndianUser(), []);

  const formatPrice = (amount: number, usd?: number) => {
    if (isIndian) return `₹${amount.toLocaleString('en-IN')}`;
    const d = usd ?? Math.round(amount / 83);
    return `$${d.toFixed(0)}`;
  };

  // Form State
  const [cardData, setCardData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });

  const courseSchemas = useMemo(() => {
    if (!course) return undefined;
    return [
      {
        "@context": "https://schema.org",
        "@type": "Course",
        "@id": `https://shaktiyogaraai.com/courses/${course.id}#course`,
        "name": course.title,
        "description": course.description,
        "provider": {
          "@type": "Organization",
          "name": "Shakti Yoga Raai",
          "sameAs": "https://shaktiyogaraai.com"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `https://shaktiyogaraai.com/courses/${course.id}#product`,
        "name": course.title,
        "image": course.thumbnail,
        "description": course.description,
        "brand": {
          "@type": "Brand",
          "name": "Shakti Yoga"
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": course.price,
          "availability": "https://schema.org/InStock",
          "url": `https://shaktiyogaraai.com/courses/${course.id}`
        }
      }
    ];
  }, [course]);

  usePageMeta({
    title: course ? (course.seoTitle || course.title) : 'Course Details',
    description: course ? (course.seoDescription || course.description) : 'Detailed overview of Shakti Yoga Course.',
    image: course?.thumbnail,
    type: 'product',
    schemas: courseSchemas
  });

  useEffect(() => {
    if (id) {
      const found = coursesService.getCourse(id);
      if (found) {
        setCourse(found);
        document.title = `${found.title} – SHAKTI YOGA`;
      } else {
        navigate('/courses');
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored && course) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        setHasPurchased(coursesService.hasPurchased(user.id, course.id));
      } catch { /* empty */ }
    }
  }, [course]);

  if (!course) return null;

  const handleEnrollClick = () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to purchase this course."
      });
      return;
    }
    setShowCheckout(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      coursesService.purchaseCourse(currentUser.id, course.id);
      setHasPurchased(true);
      setIsProcessing(false);
      setShowCheckout(false);
      toast({
        title: "Enrollment Successful! 🎉",
        description: `Welcome to ${course.title}. Let's begin!`
      });
      navigate(`/courses/${course.id}/watch`);
    }, 2000);
  };

  const introVideo = course.videos.find(v => v.order === 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yoga-cream to-yoga-sand">
      <Header />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Main Details */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${levelColors[course.level]}`}>
                  {course.level}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-yoga-forest mt-4 mb-4 leading-tight">{course.title}</h1>
                <p className="text-lg text-yoga-forest/70 mb-6">{course.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-yoga-forest/60">
                  <div className="flex items-center gap-1.5"><Clock size={16} />{course.duration} duration</div>
                  <div className="flex items-center gap-1.5"><PlayCircle size={16} />{course.videos.length} video lessons</div>
                  <div className="flex items-center gap-1.5"><Users size={16} />{course.enrolledCount} enrolled</div>
                  <div className="flex items-center gap-1.5"><Star size={16} className="text-yellow-500 fill-yellow-500" />{course.rating} Rating</div>
                </div>
              </div>

              {/* Long description / details */}
              <div className="bg-white p-8 rounded-3xl shadow-sm space-y-6">
                <h2 className="text-2xl font-bold text-yoga-forest">Course Description</h2>
                <p className="text-yoga-forest/80 leading-relaxed whitespace-pre-line">{course.longDescription}</p>
              </div>

              {/* What is Included */}
              <div className="bg-white p-8 rounded-3xl shadow-sm space-y-6">
                <h2 className="text-2xl font-bold text-yoga-forest">What's Included</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.includes.map((inc, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="text-yoga-sage shrink-0 mt-0.5" size={18} />
                      <span className="text-yoga-forest/80">{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Curriculum & Preview Options */}
              <div className="bg-white p-8 rounded-3xl shadow-sm space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <h2 className="text-2xl font-bold text-yoga-forest">Course Curriculum</h2>
                  {introVideo && !hasPurchased && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowIntroModal(true)}
                      className="border-yoga-sage text-yoga-sage hover:bg-yoga-sage/10 rounded-full"
                    >
                      <PlayCircle size={16} className="mr-2" /> Watch Intro (Free Preview)
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {course.videos.map((vid, idx) => {
                    const isFirst = vid.order === 1;
                    const canPlay = isFirst || hasPurchased;
                    
                    return (
                      <div 
                        key={vid.id} 
                        className={`flex items-start justify-between p-4 border rounded-2xl transition-all ${
                          canPlay ? 'bg-yoga-cream/20 hover:bg-yoga-cream/40 border-yoga-sage/20' : 'bg-gray-50/50 border-gray-100 opacity-75'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            canPlay ? 'bg-yoga-sage/20 text-yoga-sage' : 'bg-gray-200 text-gray-400'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-yoga-forest">{vid.title}</h4>
                            <p className="text-xs text-yoga-forest/60 mt-0.5">{vid.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-yoga-forest/50 font-medium">{vid.duration}</span>
                          {canPlay ? (
                            isFirst && !hasPurchased ? (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => setShowIntroModal(true)}
                                className="text-yoga-sage hover:text-yoga-forest hover:bg-transparent p-0"
                              >
                                <PlayCircle size={18} />
                              </Button>
                            ) : (
                              <PlayCircle size={18} className="text-yoga-sage" />
                            )
                          ) : (
                            <Lock size={16} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Info Card */}
            <div>
              <Card className="rounded-3xl shadow-lg border-none sticky top-28 bg-white overflow-hidden">
                <div className="h-44 relative">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    width={400}
                    height={176}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {!hasPurchased && (
                    <div className="absolute bottom-4 left-4 text-white flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full text-xs">
                      <Sparkles size={12} className="text-yellow-400" /> Free Preview Available
                    </div>
                  )}
                </div>

                <CardContent className="p-6 space-y-6">
                  <div className="space-y-1">
                    <span className="text-xs text-yoga-sage font-semibold uppercase tracking-wider">One-Time Payment</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-yoga-forest">
                        {formatPrice(course.price, course.priceUSD)}
                      </span>
                      <span className="text-sm text-yoga-forest/50 line-through">
                        {formatPrice(Math.round(course.price * 1.5), course.priceUSD ? Math.round(course.priceUSD * 1.5) : undefined)}
                      </span>
                    </div>
                    <p className="text-[10px] text-yoga-forest/40">
                      {isIndian ? 'Price in Indian Rupees (₹)' : 'Price in US Dollars ($)'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {hasPurchased ? (
                        <Button 
                          onClick={() => navigate(`/courses/${course.id}/watch`)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full py-6 text-base"
                        >
                          <PlayCircle className="mr-2" size={18} /> Go to Watch
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleEnrollClick}
                          className="flex-1 bg-yoga-terracotta hover:bg-yoga-forest text-white rounded-full py-6 text-base shadow-md hover:shadow-lg transition-all"
                        >
                          Enroll Now
                        </Button>
                      )}
                      
                      <ShareMenu 
                        title={course.title}
                        description={course.description}
                        className="bg-white border-white/60 text-yoga-forest hover:bg-white/90 hover:text-yoga-forest shadow-sm h-8 w-8 rounded-full"
                        iconOnly
                      />
                    </div>
                    
                    <p className="text-center text-xs text-yoga-forest/50">
                      🛡️ Secure simulated 256-bit payment gateway.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <h4 className="font-semibold text-sm text-yoga-forest">Course details:</h4>
                    <ul className="text-xs text-yoga-forest/70 space-y-2">
                      <li className="flex items-center gap-2">🗂️ Category: {course.category}</li>
                      <li className="flex items-center gap-2">👤 Instructor: {course.instructor}</li>
                      <li className="flex items-center gap-2">⏱️ Total Content: {course.duration}</li>
                      <li className="flex items-center gap-2">♾️ Unlimited Lifetime Access</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Free Preview Intro Modal */}
      {introVideo && (
        <Dialog open={showIntroModal} onOpenChange={setShowIntroModal}>
          <DialogContent className="max-w-3xl rounded-3xl p-6 bg-white overflow-hidden">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold text-yoga-forest flex items-center gap-2">
                <PlayCircle className="text-yoga-terracotta" />
                <span>Free Preview: {introVideo.title}</span>
              </DialogTitle>
              <DialogDescription className="text-yoga-forest/70 block mt-1">
                Watching a free intro from {course.title}.
              </DialogDescription>
            </DialogHeader>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-yoga-sage/20">
              <iframe
                src={introVideo.source}
                title={introVideo.title}
                className="absolute inset-0 w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowIntroModal(false)} className="rounded-full">
                Close Preview
              </Button>
              {!hasPurchased && (
                <Button onClick={() => { setShowIntroModal(false); handleEnrollClick(); }} className="bg-yoga-terracotta hover:bg-yoga-forest text-white rounded-full">
                  Unlock Full Course
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Mock Checkout Modal */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white overflow-hidden">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-yoga-forest flex items-center gap-2">
              <ShieldCheck className="text-green-600" />
              <span>Secure Checkout</span>
            </DialogTitle>
            <DialogDescription className="text-yoga-forest/70 block mt-1">
              Complete your payment to unlock the course.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="p-4 bg-yoga-cream/30 border border-yoga-sage/10 rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-semibold text-yoga-forest text-sm truncate max-w-[200px]">{course.title}</p>
                <p className="text-xs text-yoga-forest/50">One-time payment</p>
              </div>
              <p className="text-xl font-bold text-yoga-forest">₹{course.price.toLocaleString('en-IN')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-name" className="text-xs font-semibold text-yoga-forest">Cardholder Name</Label>
              <Input 
                id="card-name" 
                placeholder="Sushmita Debnath" 
                required
                value={cardData.name}
                onChange={e => setCardData({...cardData, name: e.target.value})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-number" className="text-xs font-semibold text-yoga-forest">Card Number</Label>
              <div className="relative">
                <Input 
                  id="card-number" 
                  placeholder="4111 2222 3333 4444" 
                  maxLength={19}
                  required
                  value={cardData.number}
                  onChange={e => setCardData({...cardData, number: e.target.value})}
                  className="rounded-xl pl-10"
                />
                <CreditCard className="absolute left-3.5 top-3 text-yoga-forest/40" size={16} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="card-expiry" className="text-xs font-semibold text-yoga-forest">Expiry Date</Label>
                <Input 
                  id="card-expiry" 
                  placeholder="MM/YY" 
                  maxLength={5}
                  required
                  value={cardData.expiry}
                  onChange={e => setCardData({...cardData, expiry: e.target.value})}
                  className="rounded-xl text-center"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-cvv" className="text-xs font-semibold text-yoga-forest">CVV</Label>
                <Input 
                  id="card-cvv" 
                  type="password"
                  maxLength={3}
                  placeholder="***" 
                  required
                  value={cardData.cvv}
                  onChange={e => setCardData({...cardData, cvv: e.target.value})}
                  className="rounded-xl text-center"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isProcessing}
              className="w-full bg-yoga-terracotta hover:bg-yoga-forest text-white rounded-full py-6 mt-4 relative overflow-hidden"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Securely...</span>
                </div>
              ) : (
                <span>Pay ₹{course.price.toLocaleString('en-IN')} & Enroll</span>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CourseDetail;
