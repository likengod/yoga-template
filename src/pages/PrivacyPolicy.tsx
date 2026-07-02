import React from 'react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Eye, Cookie, UserCheck, Lock, FileText } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

const PrivacyPolicy = () => {
  useScrollToTop();
  usePageMeta({ title: 'Privacy Policy', description: 'Read our Privacy Policy to understand how SHAKTI YOGA THEME collects, uses, and protects your personal information.' });

  return (
    <div className="min-h-screen bg-yoga-cream">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-yoga-forest to-yoga-sage text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Shield size={48} className="text-yoga-cream" />
            <h1 className="text-4xl lg:text-5xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <div className="mt-6 text-sm text-white/70">
            Last updated: December 2024
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-12">
            
            {/* Information We Collect */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Eye size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-yoga-forest mb-2">Personal Information:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name, email address, and phone number when you contact us or book classes</li>
                    <li>Payment information for class bookings and purchases</li>
                    <li>Health information you voluntarily provide for yoga class safety</li>
                    <li>Communication preferences and feedback</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-yoga-forest mb-2">Automatically Collected Information:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Website usage data and analytics</li>
                    <li>Device information and IP address</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <UserCheck size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">How We Use Your Information</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide yoga classes, workshops, and related services</li>
                  <li>To process payments and manage bookings</li>
                  <li>To communicate with you about classes, schedules, and updates</li>
                  <li>To ensure safety during yoga practices based on health information</li>
                  <li>To improve our website and services</li>
                  <li>To send newsletters and promotional content (with your consent)</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>
            </div>

            {/* Data Protection */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Lock size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Data Protection & Security</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Secure encryption for data transmission and storage</li>
                  <li>Limited access to personal information on a need-to-know basis</li>
                  <li>Regular security assessments and updates</li>
                  <li>Secure payment processing through trusted providers</li>
                  <li>Data retention policies to minimize storage duration</li>
                </ul>
              </div>
            </div>

            {/* Cookies Policy */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Cookie size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Cookies & Tracking</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your preferences and login status</li>
                  <li>Analyze website traffic and user behavior</li>
                  <li>Improve website functionality and user experience</li>
                  <li>Provide personalized content and recommendations</li>
                </ul>
                <p>You can control cookies through your browser settings, though some website features may not work properly without them.</p>
              </div>
            </div>

            {/* Your Rights */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <FileText size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Your Rights</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and receive a copy of your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Withdraw consent for marketing communications</li>
                  <li>Object to processing of your personal information</li>
                  <li>Data portability where applicable</li>
                </ul>
                <p>To exercise these rights, contact us at <strong>info@shaktiyogaraai.com</strong></p>
              </div>
            </div>

            {/* Third-Party Services */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Shield size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Third-Party Services</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <p>We may use third-party services for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Payment processing (secure, PCI-compliant providers)</li>
                  <li>Email marketing and communications</li>
                  <li>Website analytics (Google Analytics, etc.)</li>
                  <li>Social media integration</li>
                </ul>
                <p>These services have their own privacy policies, and we encourage you to review them.</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-yoga-sage/10 to-yoga-forest/10 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-yoga-forest mb-4">Questions About This Policy?</h2>
              <p className="text-yoga-forest/80 mb-6">
                If you have any questions about our Privacy Policy, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> info@shaktiyogaraai.com</p>
                <p><strong>Phone:</strong> +91 87778 16410</p>
                <p><strong>Address:</strong> 123 Wellness Street, Mumbai 400001</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
