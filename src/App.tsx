import React, { Suspense, useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Outlet } from "react-router-dom";
import FloatingBookButton from "./components/FloatingBookButton";

const Index = React.lazy(() => import("./pages/Index"));
const Admin = React.lazy(() => import("./pages/Admin"));
const Articles = React.lazy(() => import("./pages/Articles"));
const ArticleDetail = React.lazy(() => import("./pages/ArticleDetail"));
const Gallery = React.lazy(() => import("./pages/Gallery"));
const About = React.lazy(() => import("./pages/About"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Instructors = React.lazy(() => import("./pages/Instructors"));
const Collaborations = React.lazy(() => import("./pages/Collaborations"));
const Classes = React.lazy(() => import("./pages/Classes"));
const Events = React.lazy(() => import("./pages/Events"));
const Store = React.lazy(() => import("./pages/Store"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = React.lazy(() => import("./pages/TermsConditions"));
const RefundPolicy = React.lazy(() => import("./pages/RefundPolicy"));
const CookiesPolicy = React.lazy(() => import("./pages/CookiesPolicy"));
const YogaCertificatePage = React.lazy(() => import("./pages/YogaCertificatePage"));
const SetupWizard = React.lazy(() => import("./pages/SetupWizard"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Courses = React.lazy(() => import("./pages/Courses"));
const CourseDetail = React.lazy(() => import("./pages/CourseDetail"));
const CourseWatch = React.lazy(() => import("./pages/CourseWatch"));
const MyCourses = React.lazy(() => import("./pages/MyCourses"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-yoga-cream">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yoga-forest"></div>
  </div>
);

const SetupGuard = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/setup/status');
        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.isConfigured && location.pathname !== '/setup') {
          navigate('/setup', { replace: true });
        } else if (data.isConfigured && location.pathname === '/setup') {
          navigate('/', { replace: true });
        }
        setError(null);
      } catch (err: any) {
        console.error('Failed to check setup status', err);
        setError('Cannot connect to the backend server. Please verify that your backend server is running.');
        if (location.pathname !== '/setup') {
          navigate('/setup', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkStatus();
  }, [navigate, location]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {error && location.pathname === '/setup' && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2.5 px-4 z-50 text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2">
          <span>⚠️ Connection Error: {error}</span>
        </div>
      )}
      {children}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route element={<SetupGuard><Outlet /></SetupGuard>}>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:id" element={<ArticleDetail />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/about-us" element={<AboutPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/instructors" element={<Instructors />} />
              <Route path="/collaborations" element={<Collaborations />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/courses/:id/watch" element={<CourseWatch />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/store" element={<Store />} />
              <Route path="/events" element={<Events />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/cookies-policy" element={<CookiesPolicy />} />
              <Route path="/yoga-certificate" element={<YogaCertificatePage />} />
            </Route>
            <Route path="/setup" element={<SetupGuard><SetupWizard /></SetupGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <FloatingBookButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
