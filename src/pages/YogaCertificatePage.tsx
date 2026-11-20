import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, Search, CheckCircle, Download, XCircle } from 'lucide-react';
import { certificateService } from '@/services/database';
import { QRCodeSVG } from 'qrcode.react';
import CertificateCrest from '@/components/CertificateCrest';
import CertificateSeal from '@/components/CertificateSeal';

interface CertificateData {
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  instructorName: string;
  signature_url?: string;
  phone?: string;
  isPremium?: boolean;
  showRegNo?: boolean;
  showIsoBadge?: boolean;
}

const YogaCertificatePage = () => {
  useScrollToTop();
  usePageMeta({ 
    title: 'Verify Yoga Certificate', 
    description: 'Verify and download your official SHAKTI YOGA certificate.' 
  });
  
  const settings = useSiteSettings();

  // Dynamic website name without www., includes .com, .in etc.
  const websiteDomain = React.useMemo(() => {
    if (typeof window !== 'undefined' && window.location.hostname) {
      const host = window.location.hostname.toLowerCase();
      if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
        return host.replace(/^www\./, '').toUpperCase();
      }
    }
    return 'SHAKTIYOGARAAI.COM';
  }, []);

  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    setError('');
    setCertificate(null);

    try {
      const data = await certificateService.autoGenerateCertificate(searchId.trim());
      setCertificate(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Certificate not found. Please ensure you have a completed booking with this phone number.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter flex flex-col">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-1 container mx-auto px-4 py-24 md:py-32 print:p-0 print:max-w-none print:m-0">
        <div className="max-w-4xl mx-auto space-y-12 print:space-y-0 print:max-w-none print:m-0">
          
          {/* Search Section (Clean flat layout without card effect) */}
          <div className="text-center py-4 md:py-8 print:hidden max-w-3xl mx-auto">
            <Award className="w-14 h-14 mx-auto text-yoga-sage mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-yoga-forest mb-3">
              Get Your Yoga Certificate
            </h1>
            <p className="text-slate-600 max-w-xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
              Enter the phone number used for your booking to instantly generate and download your official certificate. Your booking must be confirmed by an admin first.
            </p>

            <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="text"
                placeholder="e.g. +1 234 567 8900"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 h-12 text-base bg-white border-slate-300 shadow-sm focus-visible:ring-yoga-sage"
                required
              />
              <Button type="submit" disabled={isSearching} className="h-12 px-7 bg-yoga-sage hover:bg-yoga-forest text-white shadow-sm font-medium">
                {isSearching ? <Search className="w-5 h-5 animate-spin" /> : 'Get Certificate'}
              </Button>
            </form>

            {error && (
              <div className="mt-6 flex items-center justify-center space-x-2 text-red-600 bg-red-50/80 border border-red-200 py-3 px-4 rounded-lg max-w-md mx-auto text-sm">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Certificate Display */}
          {certificate && (
            <div className="space-y-6">
              <div className="flex justify-end print:hidden">
                <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                  <Download className="w-4 h-4 mr-2" />
                  Download / Print PDF
                </Button>
              </div>

              {/* The actual certificate layout */}
              <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Great+Vibes&family=Alex+Brush&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
                
                .cert-cinzel { font-family: 'Cinzel', serif; }
                .cert-name-font { font-family: 'Great Vibes', cursive; }
                .cert-signature-font { font-family: 'Alex Brush', 'Great Vibes', cursive; }
                .cert-serif { font-family: 'Playfair Display', serif; }
                .cert-sans { font-family: 'Montserrat', sans-serif; }

                @media print {
                  @page {
                    size: A4 portrait;
                    margin: 0;
                  }
                  body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                  }
                  main {
                    padding: 0 !important;
                    margin: 0 !important;
                  }
                  .cert-print-container {
                    max-width: 210mm !important;
                    width: 210mm !important;
                    height: 297mm !important;
                    max-height: 297mm !important;
                    margin: 0 auto !important;
                    box-shadow: none !important;
                    page-break-inside: avoid;
                    break-inside: avoid;
                  }
                  .cert-a4-frame {
                    width: 210mm !important;
                    height: 297mm !important;
                    max-height: 297mm !important;
                    aspect-ratio: 210 / 297 !important;
                  }
                }
              `}</style>

              <div className="cert-print-container mx-auto w-full max-w-[680px] shadow-2xl print:shadow-none">
                <div 
                  className="cert-a4-frame relative w-full aspect-[210/297] bg-no-repeat bg-center bg-white rounded-sm overflow-hidden"
                  style={{
                    backgroundImage: "url('/certificate-background.webp')",
                    backgroundSize: "100% 100%"
                  }}
                >
                  {/* Inner content box positioned inside the authentic A4 guilloche border */}
                  <div 
                    className="absolute inset-0 flex flex-col justify-between items-center text-center select-none"
                    style={{
                      left: '6.5%',
                      top: '6%',
                      width: '87%',
                      height: '88%',
                      padding: '16px 20px',
                    }}
                  >

                    {/* Top Left Shakti Yoga Logo & License Number */}
                    <div className="absolute top-2 left-3 sm:top-3 sm:left-4 z-20 flex flex-col items-center pointer-events-none">
                      {(settings.certificateLogo || settings.headerLogo) && (
                        <img 
                          src={settings.certificateLogo || settings.headerLogo} 
                          alt="Shakti Yoga Logo" 
                          className="h-11 sm:h-14 md:h-16 w-auto max-w-[85px] sm:max-w-[115px] object-contain drop-shadow-xs" 
                        />
                      )}
                      {(settings.certificateLicenseNo || 'Lic. No: SY-AYUSH-2024/88') && (
                        <div className="mt-1 px-1.5 py-0.5 rounded bg-white/75 border border-slate-300/60 shadow-2xs">
                          <p className="cert-sans text-[7.5px] sm:text-[8.5px] font-bold text-[#1b3960] tracking-wider whitespace-nowrap">
                            {settings.certificateLicenseNo || 'Lic. No: SY-AYUSH-2024/88'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 1. TOP CREST: Royal Golden Laurel Wreath & Ribbon Emblem */}
                    <div className="w-full flex justify-center items-center pt-1">
                      <CertificateCrest
                        schoolName={settings.certificateSchoolName || 'Shakti Yoga RaaiKtha'}
                        bannerText={certificate.isPremium ? (settings.certificateBannerTextPremium || 'ISO 9001:2015 CERTIFIED') : (settings.certificateBannerText || 'OFFICIAL ACCREDITED')}
                        domain={websiteDomain}
                        className="w-56 sm:w-64 md:w-72 aspect-[400/275]"
                      />
                    </div>

                    {/* CENTER SECTION: Title & Flourishes */}
                    <div className="w-full flex flex-col items-center my-auto z-10 px-4">
                      {/* Top Filigree Flourish */}
                      <svg viewBox="0 0 540 36" className="w-full max-w-[360px] h-4 sm:h-4.5 text-[#204066]" fill="currentColor">
                        <circle cx="270" cy="18" r="3.5" />
                        <circle cx="258" cy="18" r="2" />
                        <circle cx="282" cy="18" r="2" />
                        <polygon points="270,10 274,18 270,26 266,18" fill="currentColor" opacity="0.85"/>
                        <line x1="120" y1="18" x2="248" y2="18" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="125" y1="15" x2="243" y2="15" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
                        <line x1="292" y1="18" x2="420" y2="18" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="297" y1="15" x2="415" y2="15" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
                        <path d="M130,18 C105,18 85,10 70,5 C55,0 42,4 38,12 C34,20 42,28 54,26 C66,24 72,14 62,8 C54,3 44,7 44,14 C44,20 50,22 56,20 M75,12 C60,6 48,10 46,16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                        <circle cx="38" cy="12" r="2.5" />
                        <path d="M38,12 Q20,15 10,18" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M410,18 C435,18 455,10 470,5 C485,0 498,4 502,12 C506,20 498,28 486,26 C474,24 468,14 478,8 C486,3 496,7 496,14 C496,20 490,22 484,20 M465,12 C480,6 492,10 494,16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                        <circle cx="502" cy="12" r="2.5" />
                        <path d="M502,12 Q520,15 530,18" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>

                      {/* Large Main Heading */}
                      <h1 className="cert-cinzel text-2xl sm:text-3xl md:text-4xl font-black text-[#204066] tracking-[0.10em] uppercase my-1 text-center">
                        {settings.certificateTitle || 'CERTIFICATE OF COMPLETION'}
                      </h1>

                      {/* Subtitle */}
                      <h2 className="cert-sans text-[10px] sm:text-xs font-semibold tracking-[0.35em] text-[#204066] uppercase mt-0.5">
                        {settings.certificateSubtitle || 'OF ACHIEVEMENT'}
                      </h2>

                      {/* Presented To */}
                      <p className="cert-sans text-[9px] sm:text-[10.5px] font-medium tracking-[0.25em] text-slate-500 uppercase mt-3 mb-0.5">
                        {settings.certificatePresentationLine || 'THIS CERTIFICATE IS PROUDLY PRESENTED TO'}
                      </p>

                      {/* Recipient Name with Underline */}
                      <div className="w-full flex flex-col items-center my-1.5">
                        <h3 className="cert-name-font text-4xl sm:text-5xl md:text-6xl text-slate-900 text-center px-4 pt-1 pb-0 leading-tight">
                          {certificate.studentName}
                        </h3>
                        <div className="w-2/3 max-w-[320px] h-[1px] bg-slate-300 mt-1 mb-2"></div>
                      </div>

                      {/* Descriptive Course Achievement Paragraph */}
                      <p className="cert-serif italic text-xs sm:text-sm text-slate-600 max-w-md text-center leading-relaxed px-2 my-1">
                        {settings.certificateDescription || 'For having successfully completed the comprehensive training program and met all required academic and practical proficiencies in'}
                      </p>

                      {/* Course Name */}
                      <h4 className="cert-cinzel text-sm sm:text-base md:text-lg font-bold text-[#1e3a8a] text-center max-w-lg tracking-wider uppercase my-1.5">
                        {certificate.courseName}
                      </h4>

                      <p className="cert-sans text-[10px] sm:text-xs text-slate-700 tracking-wider text-center font-medium mt-0.5">
                        {(settings.certificateConductedBy || 'Conducted by {school} at Bangalore, India').replace('{school}', settings.certificateSchoolName || 'Shakti Yoga RaaiKtha')}
                      </p>
                    </div>

                    {/* BOTTOM SECTION: Left Signature, Center Red Wax Seal, Right Signature */}
                    <div className="w-full flex flex-row items-end justify-between pt-3 pb-2 px-3 border-t border-slate-200/60 z-10 gap-2">
                      {/* Left Column: QR Code & Issue Date */}
                      <div className="flex flex-col items-center text-center w-1/3">
                        <div className="p-0.5 bg-white border border-slate-300/80 rounded shadow-xs mb-1">
                          <QRCodeSVG 
                            value={typeof window !== 'undefined' ? `${window.location.origin}/verify/${certificate.certificateId}` : `https://shaktiyogaraai.com/verify/${certificate.certificateId}`} 
                            size={42} 
                          />
                        </div>
                        <div className="w-full max-w-[130px] border-t border-slate-400 pt-0.5">
                          <p className="cert-sans text-[8px] sm:text-[9px] text-slate-700 tracking-wider whitespace-nowrap">
                            <span className="text-[7px] text-slate-400 uppercase tracking-widest mr-1">ISSUED ON:</span>
                            <span className="font-semibold text-slate-800">
                              {new Date(certificate.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Center Column: Realistic 3D Wax Seal / ISO 9001:2015 Badge */}
                      <div className="flex flex-col items-center justify-end w-1/3 relative pb-0.5">
                        <CertificateSeal
                          isPremium={certificate.isPremium}
                          showIsoBadge={certificate.showIsoBadge}
                          customIsoImage={settings.certificateIsoImage}
                          className="w-16 h-16 sm:w-20 sm:h-20"
                        />
                      </div>

                      {/* Right Column: Master Instructor & Reg No */}
                      <div className="flex flex-col items-center text-center w-1/3">
                        {certificate.signature_url || settings.certificateSignatureImage ? (
                          <div className="h-9 w-28 flex items-center justify-center -mb-1 overflow-hidden mix-blend-multiply">
                            <img loading="lazy" src={certificate.signature_url || settings.certificateSignatureImage} alt="Signature" className="h-full w-auto object-contain" />
                          </div>
                        ) : (
                          <div className="h-9 flex items-end justify-center cert-signature-font text-2xl sm:text-3xl text-[#1e293b] -mb-1">
                            {certificate.instructorName || settings.certificateDirectorName || "Dr. A. Sharma"}
                          </div>
                        )}
                        <div className="w-full max-w-[140px] border-t border-[#708090]/80 pt-1 mt-0.5">
                          <p className="cert-sans text-[8.5px] sm:text-[9.5px] font-bold text-[#1e293b] uppercase tracking-[0.16em]">
                            {settings.certificateDirectorTitle || 'COURSE DIRECTOR'}
                          </p>
                          <p className="cert-sans text-[7px] sm:text-[8px] font-medium text-[#64748b] tracking-[0.14em] uppercase mt-0.5">
                            {settings.certificatePresidentTitle || 'PRESIDENT DIRECTOR'}
                          </p>
                        </div>
                        {/* Certificate ID & Reg No */}
                        <div className="text-[8px] text-slate-500 mt-0.5 font-mono text-center">
                          {certificate.isPremium === true && (
                            <p className="font-semibold text-emerald-800">
                              {(settings.certificateRegNoTemplate || 'Reg: {id}/{year}')
                                .replace('{id}', certificate.certificateId.substring(0, 6).toUpperCase())
                                .replace('{year}', new Date(certificate.issueDate).getFullYear().toString())}
                            </p>
                          )}
                          <p className="text-[7.5px] text-slate-400">ID: {certificate.certificateId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default YogaCertificatePage;
