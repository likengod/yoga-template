import React from 'react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RefreshCw, Clock, CreditCard, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

const RefundPolicy = () => {
  useScrollToTop();
  usePageMeta({ title: 'Refund Policy', description: 'Understand the refund and cancellation policy at SHAKTI YOGA THEME for classes, products, and memberships.' });

  return (
    <div className="min-h-screen bg-yoga-cream">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-yoga-forest to-yoga-sage text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <RefreshCw size={48} className="text-yoga-cream" />
            <h1 className="text-4xl lg:text-5xl font-bold">Refund Policy</h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            We want you to be completely satisfied with our yoga classes. Please review our refund policy below.
          </p>
          <div className="mt-6 text-sm text-white/70">
            Last updated: December 2024
          </div>
        </div>
      </section>

      {/* Refund Policy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-12">

            {/* General Refund Policy */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <RefreshCw size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">General Refund Policy</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <p>At SHAKTI YOGA THEME, we understand that circumstances can change. Our refund policy is designed to be fair to both our students and our instructors who prepare classes in advance.</p>
                <div className="bg-yoga-sage/10 border-l-4 border-yoga-sage p-4 rounded-r-lg">
                  <p className="font-semibold text-yoga-forest">Key Principle:</p>
                  <p>Refunds are considered on a case-by-case basis, with consideration for timing, circumstances, and impact on our community.</p>
                </div>
              </div>
            </div>

            {/* Single Class Refunds */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Clock size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Single Class Refunds</h2>
              </div>
              <div className="space-y-6 text-yoga-forest/80 leading-relaxed">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle size={32} className="mx-auto text-green-600 mb-3" />
                    <h3 className="font-semibold text-green-800 mb-2">Full Refund</h3>
                    <p className="text-sm text-green-700">Cancellation 24+ hours before class</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle size={32} className="mx-auto text-yellow-600 mb-3" />
                    <h3 className="font-semibold text-yellow-800 mb-2">50% Refund</h3>
                    <p className="text-sm text-yellow-700">Cancellation 4-24 hours before class</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <XCircle size={32} className="mx-auto text-red-600 mb-3" />
                    <h3 className="font-semibold text-red-800 mb-2">No Refund</h3>
                    <p className="text-sm text-red-700">Cancellation less than 4 hours or no-show</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Package & Membership Refunds */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Package & Membership Refunds</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-yoga-forest mb-3">Class Packages:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Unused classes:</strong> Refund available for unused classes if requested within 30 days of purchase</li>
                    <li><strong>Partially used packages:</strong> Prorated refund based on unused classes minus a 10% administrative fee</li>
                    <li><strong>Medical reasons:</strong> Full refund with medical documentation, regardless of usage</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-yoga-forest mb-3">Monthly Memberships:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>First 7 days:</strong> Full refund if unused and requested within first week</li>
                    <li><strong>After 7 days:</strong> No refund, but membership can be paused for medical reasons</li>
                    <li><strong>Auto-renewal:</strong> Can be cancelled anytime for future billing cycles</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Special Circumstances */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <AlertCircle size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Special Circumstances</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-yoga-forest mb-2">Full Refunds Available For:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Medical emergencies or serious illness (with documentation)</li>
                    <li>Family emergencies or bereavement</li>
                    <li>Job loss or significant financial hardship</li>
                    <li>Relocation more than 50km from our studio</li>
                    <li>Class cancellations by SHAKTI YOGA THEME</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-yoga-forest mb-2">Weather & External Factors:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Severe weather conditions preventing travel</li>
                    <li>Public transport strikes or major disruptions</li>
                    <li>Government-mandated closures or restrictions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Refund Process */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">How to Request a Refund</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-yoga-forest mb-3">Contact Methods:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Email: info@shaktiyogaraai.com</li>
                      <li>WhatsApp: +91 87778 16410</li>
                      <li>Phone: +91 87778 16410</li>
                      <li>In person at the studio</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-yoga-forest mb-3">Information Required:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Your name and contact details</li>
                      <li>Booking or payment reference</li>
                      <li>Reason for refund request</li>
                      <li>Supporting documentation if applicable</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-yoga-sage/10 border-l-4 border-yoga-sage p-4 rounded-r-lg mt-6">
                  <h3 className="font-semibold text-yoga-forest mb-2">Processing Time:</h3>
                  <p>Refunds are typically processed within 5-7 business days after approval. The time for funds to appear in your account depends on your payment method and bank.</p>
                </div>
              </div>
            </div>

            {/* Workshop & Special Events */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Clock size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Workshops & Special Events</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <p>Special events and workshops have different refund policies due to their unique nature:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>30+ days before:</strong> Full refund minus 5% processing fee</li>
                  <li><strong>14-29 days before:</strong> 75% refund</li>
                  <li><strong>7-13 days before:</strong> 50% refund</li>
                  <li><strong>Less than 7 days:</strong> No refund (credit for future events may be offered)</li>
                  <li><strong>Transfer option:</strong> You may transfer your spot to another person up to 48 hours before the event</li>
                </ul>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-yoga-sage/10 to-yoga-forest/10 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-yoga-forest mb-4">Need Help with a Refund?</h2>
              <p className="text-yoga-forest/80 mb-6">
                Our team is here to help. We understand that life happens and we'll work with you to find a fair solution.
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> info@shaktiyogaraai.com</p>
                <p><strong>WhatsApp:</strong> +91 87778 16410</p>
                <p><strong>Phone:</strong> +91 87778 16410</p>
              </div>
              <div className="mt-6 text-sm text-yoga-forest/60">
                <p>We aim to respond to all refund requests within 24 hours</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
