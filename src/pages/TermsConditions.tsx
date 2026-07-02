import React from 'react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FileText, AlertTriangle, Calendar, CreditCard, UserX, Scale } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

const TermsConditions = () => {
  useScrollToTop();
  usePageMeta({ title: 'Terms & Conditions', description: 'Read the Terms and Conditions for using SHAKTI YOGA THEME services, classes, and products.' });

  return (
    <div className="min-h-screen bg-yoga-cream">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-yoga-forest to-yoga-sage text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Scale size={48} className="text-yoga-cream" />
            <h1 className="text-4xl lg:text-5xl font-bold">Terms & Conditions</h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Please read these terms and conditions carefully before using our services or attending our yoga classes.
          </p>
          <div className="mt-6 text-sm text-white/70">
            Last updated: December 2024
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-12">

            {/* Acceptance of Terms */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <FileText size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Acceptance of Terms</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <p>By accessing our website, booking classes, or participating in any SHAKTI YOGA THEME services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>
                <p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.</p>
              </div>
            </div>

            {/* Class Bookings & Attendance */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Calendar size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Class Bookings & Attendance</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-yoga-forest mb-2">Booking Policy:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Classes must be booked in advance through our website or WhatsApp</li>
                    <li>Booking confirmation will be sent via email or WhatsApp</li>
                    <li>Class capacity is limited and bookings are on a first-come, first-served basis</li>
                    <li>We reserve the right to cancel classes due to insufficient bookings or unforeseen circumstances</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-yoga-forest mb-2">Cancellation Policy:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Cancellations must be made at least 4 hours before class start time</li>
                    <li>Late cancellations or no-shows may result in forfeiture of class fees</li>
                    <li>Rescheduling is possible subject to availability</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Payment Terms</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Payment is required at the time of booking unless otherwise arranged</li>
                  <li>We accept online payments, bank transfers, and cash payments</li>
                  <li>All prices are in Indian Rupees (INR) and include applicable taxes</li>
                  <li>Package deals and memberships are non-transferable</li>
                  <li>Refunds are processed according to our Refund Policy</li>
                  <li>Prices may change without notice, but existing bookings are honored at the original price</li>
                </ul>
              </div>
            </div>

            {/* Health & Safety */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Health & Safety</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-yoga-forest mb-2">Medical Conditions:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You must disclose any medical conditions, injuries, or physical limitations</li>
                    <li>Consult your doctor before starting yoga if you have health concerns</li>
                    <li>Inform your instructor of any pain or discomfort during practice</li>
                    <li>Practice within your comfort zone and never force poses</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-yoga-forest mb-2">Assumption of Risk:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You participate in yoga classes at your own risk</li>
                    <li>Yoga involves physical activity that may result in injury</li>
                    <li>You are responsible for knowing your physical limits</li>
                    <li>We recommend appropriate insurance coverage</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Code of Conduct */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <UserX size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Code of Conduct</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <p>To maintain a peaceful and respectful environment for all practitioners:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Arrive on time and prepared for class</li>
                  <li>Maintain silence in practice areas</li>
                  <li>Respect other students' space and practice</li>
                  <li>Follow instructor guidance and safety instructions</li>
                  <li>No photography or recording during classes without permission</li>
                  <li>Clean up after yourself and treat facilities with care</li>
                  <li>Inappropriate behavior may result in removal from premises</li>
                </ul>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Scale size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Intellectual Property</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <ul className="list-disc pl-6 space-y-2">
                  <li>All website content, class materials, and proprietary sequences are protected by copyright</li>
                  <li>You may not reproduce, distribute, or use our materials without permission</li>
                  <li>The SHAKTI YOGA THEME name and logo are trademarked</li>
                  <li>Any feedback or suggestions you provide may be used by us without compensation</li>
                </ul>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle size={24} className="text-yoga-sage" />
                <h2 className="text-2xl font-bold text-yoga-forest">Limitation of Liability</h2>
              </div>
              <div className="space-y-4 text-yoga-forest/80 leading-relaxed">
                <p>To the fullest extent permitted by law:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>SHAKTI YOGA THEME shall not be liable for any injuries or damages arising from participation in classes</li>
                  <li>Our liability is limited to the amount paid for the specific service</li>
                  <li>We are not responsible for personal property loss or damage</li>
                  <li>Force majeure events (natural disasters, pandemics) may necessitate service changes without liability</li>
                </ul>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-yoga-sage/10 to-yoga-forest/10 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-yoga-forest mb-4">Questions About These Terms?</h2>
              <p className="text-yoga-forest/80 mb-6">
                If you have any questions about our Terms & Conditions, please contact us:
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

export default TermsConditions;
