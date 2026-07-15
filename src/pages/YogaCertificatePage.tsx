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

interface CertificateData {
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  instructorName: string;
  signature_url?: string;
}

const YogaCertificatePage = () => {
  useScrollToTop();
  usePageMeta({ 
    title: 'Verify Yoga Certificate', 
    description: 'Verify and download your official SHAKTI YOGA certificate.' 
  });
  
  const settings = useSiteSettings();

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
          
          {/* Search Section (Hidden in print) */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center print:hidden">
            <Award className="w-16 h-16 mx-auto text-yoga-sage mb-6" />
            <h1 className="text-3xl md:text-4xl font-bold text-yoga-forest mb-4">
              Get Your Yoga Certificate
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto mb-8">
              Enter the phone number used for your booking to instantly generate and download your official certificate. Your booking must be confirmed by an admin first.
            </p>

            <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <Input
                type="text"
                placeholder="e.g. +1 234 567 8900"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 h-12 text-lg"
                required
              />
              <Button type="submit" disabled={isSearching} className="h-12 px-8 bg-yoga-sage hover:bg-yoga-forest text-white">
                {isSearching ? <Search className="w-5 h-5 animate-spin" /> : 'Get Certificate'}
              </Button>
            </form>

            {error && (
              <div className="mt-6 flex items-center justify-center space-x-2 text-red-600 bg-red-50 py-3 rounded-lg max-w-lg mx-auto">
                <XCircle className="w-5 h-5" />
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
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
                .cert-border {
                  padding: 32px;
                  background-color: #fff;
                  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23cca253' stroke-width='2'%3E%3Cpath d='M50 0 C 70 30, 90 10, 100 50 C 90 90, 70 70, 50 100 C 30 70, 10 90, 0 50 C 10 10, 30 30, 50 0 Z' fill='%23fffaf0' /%3E%3Ccircle cx='50' cy='50' r='15' /%3E%3Ccircle cx='50' cy='50' r='5' fill='%23cca253'/%3E%3Cpath d='M50 15 L 50 35 M 50 85 L 50 65 M 15 50 L 35 50 M 85 50 L 65 50' /%3E%3Cpath d='M0 0 Q 20 20, 30 0' /%3E%3Cpath d='M100 0 Q 80 20, 70 0' /%3E%3Cpath d='M0 100 Q 20 80, 30 100' /%3E%3Cpath d='M100 100 Q 80 80, 70 100' /%3E%3C/g%3E%3C/svg%3E");
                  position: relative;
                }
                .cert-inner-container {
                  background-color: #fff;
                  padding: 8px;
                  height: 100%;
                  box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
                }
                .cert-inner-border {
                  border: 6px solid #cca253;
                  outline: 1px solid #cca253;
                  outline-offset: -10px;
                  position: relative;
                  padding: 40px 20px;
                  min-height: 650px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  background-color: #fffdf9;
                  background-image: url("data:image/svg+xml,%3Csvg width='200' height='30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 15 Q 50 0 100 15 T 200 15' fill='none' stroke='%23cca253' stroke-width='0.6' opacity='0.3'/%3E%3C/svg%3E");
                }
                .cert-title-font { font-family: 'Playfair Display', serif; }
                .cert-name-font { font-family: 'Great Vibes', cursive; }
                @media print {
                  @page { margin: 0; size: landscape; }
                  body { print-color-adjust: exact; -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
                  main { padding: 0 !important; }
                  .cert-border { 
                    border-width: 8px; 
                    padding: 4px; 
                    max-width: none !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    min-height: 100vh !important;
                    aspect-ratio: auto !important;
                    margin: 0 !important;
                  }
                  .cert-inner-border { padding: 40px; }
                }
              `}</style>
              <div className="cert-border shadow-2xl print:shadow-none mx-auto w-full max-w-[1050px] min-h-[742px] aspect-[1.414/1]">
                <div className="cert-inner-container">
                  <div className="cert-inner-border h-full flex flex-col justify-between overflow-hidden">
                    
                    {/* Elegant Corner Flourishes */}
                    <div className="absolute top-3 left-3 w-16 h-16 border-t-[3px] border-l-[3px] border-[#cca253] rounded-tl-[40px] z-10 opacity-80 pointer-events-none"></div>
                    <div className="absolute top-3 right-3 w-16 h-16 border-t-[3px] border-r-[3px] border-[#cca253] rounded-tr-[40px] z-10 opacity-80 pointer-events-none"></div>
                    <div className="absolute bottom-3 left-3 w-16 h-16 border-b-[3px] border-l-[3px] border-[#cca253] rounded-bl-[40px] z-10 opacity-80 pointer-events-none"></div>
                    <div className="absolute bottom-3 right-3 w-16 h-16 border-b-[3px] border-r-[3px] border-[#cca253] rounded-br-[40px] z-10 opacity-80 pointer-events-none"></div>
                    
                    {/* Corner Diamonds */}
                    <div className="absolute top-6 left-6 w-3 h-3 bg-transparent border-[1.5px] border-[#cca253] rotate-45 z-10 opacity-80 pointer-events-none"></div>
                    <div className="absolute top-6 right-6 w-3 h-3 bg-transparent border-[1.5px] border-[#cca253] rotate-45 z-10 opacity-80 pointer-events-none"></div>
                    <div className="absolute bottom-6 left-6 w-3 h-3 bg-transparent border-[1.5px] border-[#cca253] rotate-45 z-10 opacity-80 pointer-events-none"></div>
                    <div className="absolute bottom-6 right-6 w-3 h-3 bg-transparent border-[1.5px] border-[#cca253] rotate-45 z-10 opacity-80 pointer-events-none"></div>

                    {/* Top Row: Logos & Title Block */}
                    <div className="w-full flex flex-row justify-between items-center z-30 px-6 sm:px-10 mt-6 hidden sm:flex">
                      
                      {/* Left Header Logo */}
                      <div className="w-20 h-20 bg-transparent flex items-center justify-center shrink-0">
                        {settings.headerLogo ? (
                          <img src={settings.headerLogo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <Award size={40} className="text-[#cca253]" />
                        )}
                      </div>

                      {/* Center Title Block */}
                      <div className="flex flex-col items-center flex-1 px-4 z-20">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#8b0000] tracking-widest uppercase text-center leading-tight drop-shadow-sm cert-title-font">
                          {settings.certificateSchoolName || 'Shakti Yoga Vidya Peetham'}
                        </h1>
                        <p className="text-xs sm:text-sm text-[#bba375] font-medium tracking-wider mt-1">
                          www.shaktiyogaraai.com
                        </p>
                        <div className="text-[10px] sm:text-xs text-slate-500 mt-2 font-serif border-t border-slate-300/50 pt-1 flex flex-col items-center">
                          <span>
                            {(settings.certificateRegNoTemplate || 'Reg. No. {id}/ATTC/SYVP/{year}')
                              .replace('{id}', certificate.certificateId.substring(0, 8).toUpperCase())
                              .replace('{year}', new Date(certificate.issueDate).getFullYear().toString())}
                          </span>
                          <span className="mt-0.5 text-[9px] sm:text-[10px]">Certificate ID: {certificate.certificateId}</span>
                        </div>
                      </div>

                      {/* Right ISO Gold Seal */}
                      {settings.certificateIsoImage ? (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-transparent flex items-center justify-center shrink-0 relative z-30">
                          <img src={settings.certificateIsoImage} alt="ISO Certified" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="relative flex flex-col items-center drop-shadow-xl shrink-0">
                          {/* Red Ribbons */}
                          <div className="absolute -bottom-6 flex gap-[2px] z-0">
                            <div className="w-5 h-10 bg-gradient-to-b from-red-600 to-red-900 transform rotate-[15deg] origin-top-right shadow-md" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}></div>
                            <div className="w-5 h-10 bg-gradient-to-b from-red-600 to-red-900 transform -rotate-[15deg] origin-top-left shadow-md" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}></div>
                          </div>
                          {/* Gold Seal Circle */}
                          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-600 shadow-xl flex items-center justify-center z-10 p-[2px] border border-yellow-700/50">
                            {/* Inner gold border */}
                            <div className="w-full h-full rounded-full border border-dashed border-yellow-700 flex flex-col items-center justify-center bg-gradient-to-br from-[#fffdf5] to-[#f4e2b0] shadow-inner relative overflow-hidden">
                              {/* Fake Globe lines */}
                              <div className="absolute inset-0 border border-yellow-700/30 rounded-full scale-[0.65]"></div>
                              <div className="absolute w-full h-[1px] bg-yellow-700/20 top-1/2"></div>
                              <div className="absolute h-full w-[1px] bg-yellow-700/20 left-1/2"></div>
                              {/* Text */}
                              <div className="text-[6px] font-bold text-yellow-900 tracking-widest mt-1 z-10">CERTIFIED</div>
                              <div className="text-xl font-black text-yellow-950 leading-none my-0 drop-shadow-sm z-10 font-serif">ISO</div>
                              <div className="text-[6px] font-bold text-yellow-950 border-t border-b border-yellow-700 py-[1px] bg-[#f4e2b0]/80 z-10 w-4/5 text-center tracking-wider mt-[1px]">9001:2015</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Center Text Block */}
                    <div className="flex-1 flex flex-col justify-center items-center w-full my-4">
                      {/* Main Title */}
                      <h2 className="cert-title-font text-2xl sm:text-3xl md:text-4xl text-[#bba375] font-bold tracking-wider uppercase mb-2 z-20 text-center">
                        {settings.certificateTitle || 'CERTIFICATE OF COMPLETION'}
                      </h2>
                      
                      <p className="cert-title-font italic text-sm sm:text-base text-slate-700 mb-2 z-20">
                        This is to Certify that
                      </p>
    
                      <h3 className="cert-name-font text-4xl sm:text-5xl md:text-6xl text-slate-900 mb-3 z-20 text-center">
                        {certificate.studentName}
                      </h3>
    
                      <p className="cert-title-font text-sm sm:text-base text-slate-700 mb-1 z-20 text-center">
                        has successfully completed the requirement of the
                      </p>
    
                      <h4 className="cert-title-font text-lg sm:text-xl md:text-2xl font-bold text-[#1e3a8a] mb-3 z-20 text-center max-w-2xl leading-relaxed">
                        {certificate.courseName}
                      </h4>
    
                      <p className="cert-title-font text-sm sm:text-base text-slate-800 z-20 font-medium text-center">
                        Conducted by Shakti Yoga Vidya Peetham at Bangalore, India
                      </p>
                    </div>
                    
                    {/* Bottom Grid */}
                    <div className="w-full flex flex-col sm:flex-row justify-between items-center sm:items-end mt-2 pb-6 z-20 gap-4">
                      {/* Left: QR and Date */}
                      <div className="flex flex-col items-center sm:items-start text-center sm:text-left w-full sm:w-1/3 sm:pl-8">
                        <div className="mb-2 bg-white p-1 shadow-sm border border-slate-200 mt-2">
                          <QRCodeSVG value={`https://shaktiyogaraai.com/verify/${certificate.certificateId}`} size={45} />
                        </div>
                        <p className="font-semibold text-xs text-slate-800 border-b border-slate-300 pb-1 px-4 min-w-[100px] inline-block">
                          {new Date(certificate.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-[8px] text-slate-500 mt-1 uppercase tracking-wider">Issued on</p>
                      </div>

                      {/* Center: Watermark/Stamp */}
                      <div className="flex flex-col items-center justify-end h-full opacity-60 w-full sm:w-1/3 order-3 sm:order-2">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#1e3a8a] flex items-center justify-center p-1">
                          <div className="w-full h-full rounded-full border-2 border-dashed border-[#1e3a8a] flex items-center justify-center text-[7px] text-[#1e3a8a] text-center uppercase font-bold leading-tight">
                            Shakti<br/>Yoga<br/>Verified
                          </div>
                        </div>
                      </div>

                      {/* Right: Signature */}
                      <div className="flex flex-col items-center sm:items-end text-center sm:text-right w-full sm:w-1/3 order-2 sm:order-3 sm:pr-8 pt-2">
                        {certificate.signature_url || settings.certificateSignatureImage ? (
                          <div className="h-10 w-24 flex items-center justify-center -mb-2 overflow-hidden mix-blend-multiply">
                             <img src={certificate.signature_url || settings.certificateSignatureImage} alt="Signature" className="h-full w-auto object-contain" />
                          </div>
                        ) : (
                          <div className="cert-name-font text-xl sm:text-2xl text-slate-800 -mb-2 opacity-80 h-10 flex items-end justify-center whitespace-nowrap">
                            Master Instructor
                          </div>
                        )}
                        <p className="font-semibold text-xs text-slate-800 border-t border-slate-300 pt-1 px-4 min-w-[100px] inline-block mt-2 whitespace-nowrap">
                          {certificate.instructorName || "Master Instructor"}
                        </p>
                        <p className="text-[8px] text-slate-500 mt-1 uppercase tracking-wider whitespace-nowrap">Course Director & Senior Trainer</p>
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
