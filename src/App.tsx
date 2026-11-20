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
const VerifyCertificate = React.lazy(() => import("./pages/VerifyCertificate"));
const VerifyInvoice = React.lazy(() => import("./pages/VerifyInvoice"));
const SetupWizard = React.lazy(() => import("./pages/SetupWizard"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Courses = React.lazy(() => import("./pages/Courses"));
const CourseDetail = React.lazy(() => import("./pages/CourseDetail"));
const CourseWatch = React.lazy(() => import("./pages/CourseWatch"));
const MyCourses = React.lazy(() => import("./pages/MyCourses"));

import LoadingScreen from "@/components/LoadingScreen";

const queryClient = new QueryClient();

const LoadingSpinner = () => <LoadingScreen />;

const SetupGuard = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Safety net: ensure pointer-events and scroll lock from Radix dialogs/sheets/menus never freeze the page
  useEffect(() => {
    document.body.style.pointerEvents = '';
    document.body.style.overflow = '';
  }, [location.pathname]);

  useEffect(() => {
    let isCancelled = false;

    const fetchWithQuickTimeout = async (url: string, ms = 2500): Promise<Response | null> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ms);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        return res;
      } catch {
        clearTimeout(timer);
        return null;
      }
    };

    const checkStatus = async () => {
      let isConfigured = false;
      let checkPerformed = false;

      // 1. Check Node.js /api/setup/status first
      try {
        const response = await fetchWithQuickTimeout('/api/setup/status', 2500);
        if (response && response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await response.json();
            if (typeof data.isConfigured === 'boolean') {
              isConfigured = data.isConfigured;
              checkPerformed = true;
            }
          }
        }
      } catch (err) {
        // Node backend not responding
      }

      // 2. Fallback to PHP status check if Node.js backend was not reached
      if (!checkPerformed) {
        try {
          const phpRes = await fetchWithQuickTimeout('/setup.php?action=status', 2500);
          if (phpRes && phpRes.ok) {
            const phpType = phpRes.headers.get('content-type') || '';
            if (phpType.includes('application/json')) {
              const phpData = await phpRes.json();
              if (typeof phpData.isConfigured === 'boolean') {
                isConfigured = phpData.isConfigured;
                checkPerformed = true;
              }
            }
          }
        } catch (phpErr) {
          // PHP check error
        }
      }

      if (isCancelled) return;

      // Strict Enforcement:
      // If database is NOT configured / connected -> Open Setup Wizard
      // If database IS configured / connected -> Block Setup Wizard and redirect to home
      if (!isConfigured) {
        if (location.pathname !== '/setup') {
          navigate('/setup', { replace: true });
        }
      } else {
        if (location.pathname === '/setup') {
          navigate('/', { replace: true });
        }
      }

      setLoading(false);
    };
    
    checkStatus();

    return () => {
      isCancelled = true;
    };
  }, [navigate, location.pathname]);

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
              <Route path="/admin/:tab" element={<Admin />} />
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
              <Route path="/certificate" element={<YogaCertificatePage />} />
              <Route path="/verify-certificate" element={<VerifyCertificate />} />
              <Route path="/verify-certificate/:id" element={<VerifyCertificate />} />
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route path="/verify/:id" element={<VerifyCertificate />} />
              <Route path="/verify-invoice" element={<VerifyInvoice />} />
              <Route path="/verify-invoice/:invoiceNumber" element={<VerifyInvoice />} />
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
