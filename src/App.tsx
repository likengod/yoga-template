import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-yoga-cream">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yoga-forest"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/about-us" element={<AboutPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/collaborations" element={<Collaborations />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/store" element={<Store />} />
            <Route path="/events" element={<Events />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <FloatingBookButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
