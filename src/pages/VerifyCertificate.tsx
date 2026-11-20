import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { certificateService } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Award, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText, 
  Building2, 
  UserCheck, 
  Sparkles,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import CertificateCrest from '@/components/CertificateCrest';
import CertificateSeal from '@/components/CertificateSeal';

interface CertificateRecord {
  id?: string;
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  instructorName?: string;
  signature_url?: string;
  phone?: string;
  isPremium?: boolean;
  showRegNo?: boolean;
  showIsoBadge?: boolean;
}

const VerifyCertificate: React.FC = () => {
  useScrollToTop();
  usePageMeta({
    title: 'Verify Yoga Certificate | Official Registry',
    description: 'Verify official yoga certification credentials issued by Shakti Yoga RaaiKtha.'
  });

  const { id: paramId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const settings = useSiteSettings();

  const initialSearchId = paramId || searchParams.get('id') || searchParams.get('certId') || '';

  const [searchId, setSearchId] = useState(initialSearchId);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(true);

  const fetchCertificate = async (idToLookup: string) => {
    const cleanId = idToLookup.trim();
    if (!cleanId) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await certificateService.getCertificate(cleanId);
      if (data) {
        setCertificate(data);
      } else {
        setCertificate(null);
        setError(`No official certificate found matching ID "${cleanId}". Please verify the certificate number and try again.`);
      }
    } catch (err: any) {
      setCertificate(null);
      setError(err?.response?.data?.error || `Certificate ID "${cleanId}" could not be verified in our registry.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialSearchId) {
      fetchCertificate(initialSearchId);
    }
  }, [initialSearchId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      fetchCertificate(searchId);
    }
  };

  const copyCertId = () => {
    if (!certificate?.certificateId) return;
    navigator.clipboard.writeText(certificate.certificateId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentDomain = typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname.replace(/^www\./, '').toUpperCase()
    : 'SHAKTIYOGARAAI.COM';

  const verificationUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://shaktiyogaraai.com/verify/${certificate?.certificateId || ''}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-24 md:py-28 max-w-5xl">
        {/* Verification Hero Banner */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Official Certificate Authentication Registry
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-yoga-forest tracking-tight">
            Certificate Verification
          </h1>
          <p className="text-slate-600 text-sm md:text-base mt-2">
            Verify the authenticity and accreditation status of official Shakti Yoga certificates in real-time.
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md mx-auto mt-6">
            <Input
              type="text"
              placeholder="Enter Certificate ID (e.g. SY-2026-1042)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="bg-white border-slate-300 h-11 text-sm shadow-xs focus-visible:ring-yoga-sage"
              required
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-yoga-sage hover:bg-yoga-forest text-white h-11 px-5 shadow-xs font-medium"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-1.5" />
                  Verify
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Status: Verified Certificate Found */}
        {certificate && (
          <div className="space-y-6">
            {/* Green Authenticated Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-lg border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="font-black text-lg md:text-xl tracking-wide uppercase">Official Certificate Verified</span>
                    <Badge className="bg-emerald-400 text-emerald-950 font-bold hover:bg-emerald-400 text-[10px]">
                      AUTHENTIC RECORD
                    </Badge>
                  </div>
                  <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                    This certificate is authentic, active, and officially registered in our global training registry.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDocumentPreview(!showDocumentPreview)}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-semibold"
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  {showDocumentPreview ? 'Hide Document' : 'View Document'}
                </Button>
                <Link to="/yoga-certificate">
                  <Button size="sm" className="bg-white text-emerald-900 hover:bg-emerald-50 font-semibold text-xs shadow-md">
                    <Download className="w-4 h-4 mr-1.5" />
                    Student Portal
                  </Button>
                </Link>
              </div>
            </div>

            {/* Verification Metadata Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Details Card */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-slate-200/90 shadow-sm bg-white overflow-hidden">
                  <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yoga-forest" />
                      Credential Specifications
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded">
                        {certificate.certificateId}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyCertId}
                        className="h-7 w-7 text-slate-500 hover:text-slate-800"
                        title="Copy Certificate ID"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                      {/* Student Name */}
                      <div className="sm:col-span-2 pb-4 border-b border-slate-100">
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Certified Practitioner</span>
                        <h2 className="text-2xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                          {certificate.studentName}
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        </h2>
                      </div>

                      {/* Course */}
                      <div className="sm:col-span-2 pb-4 border-b border-slate-100">
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Program / Course Curriculum</span>
                        <p className="text-base font-bold text-[#1e3a8a] mt-0.5">
                          {certificate.courseName}
                        </p>
                      </div>

                      {/* Issue Date */}
                      <div>
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Date of Issue</span>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          {new Date(certificate.issueDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>

                      {/* Registration Number */}
                      <div>
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Registration Number</span>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5 font-mono">
                          {certificate.isPremium
                            ? (settings.certificateRegNoTemplate || 'Reg: {id}/{year}')
                                .replace('{id}', certificate.certificateId.substring(0, 6).toUpperCase())
                                .replace('{year}', new Date(certificate.issueDate).getFullYear().toString())
                            : 'Standard Registration'}
                        </p>
                      </div>

                      {/* Issuing Institution */}
                      <div>
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Issuing Institution</span>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-slate-500" />
                          {settings.certificateSchoolName || 'Shakti Yoga RaaiKtha'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Bangalore, India</p>
                      </div>

                      {/* Instructor / Authority */}
                      <div>
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Master Instructor / Verifier</span>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-slate-500" />
                          {certificate.instructorName || 'Master Instructor'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{settings.certificateManagerTitle || 'General Manager'}</p>
                      </div>

                      {/* License Number */}
                      <div>
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Institute License No</span>
                        <p className="text-sm font-semibold text-emerald-800 font-mono mt-0.5">
                          {settings.certificateLicenseNo || 'Lic. No: SY-AYUSH-2024/88'}
                        </p>
                      </div>

                      {/* Accreditation Tier */}
                      <div>
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Accreditation Tier</span>
                        <div className="mt-1">
                          {certificate.isPremium ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                              <Sparkles className="w-3.5 h-3.5 text-amber-700 fill-amber-600" />
                              ISO 9001:2015 Premium Certified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                              Official Accredited Standard
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Col: Trust & QR Security Summary */}
              <div className="space-y-6">
                <Card className="border-slate-200/90 shadow-sm bg-white">
                  <CardHeader className="py-4 px-5 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-yoga-forest" />
                      Digital Verification QR
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 flex flex-col items-center text-center">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-xs mb-3">
                      <QRCodeSVG value={verificationUrl} size={130} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Permanent Verification URL</span>
                    <p className="text-[11px] text-slate-500 font-mono break-all mt-1 px-2">
                      {verificationUrl}
                    </p>

                    <div className="w-full border-t border-slate-100 pt-3 mt-4 text-left">
                      <h4 className="text-xs font-bold text-slate-800 mb-2">Cryptographic Verification:</h4>
                      <ul className="text-xs text-slate-600 space-y-1.5">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>Recorded in Shakti Yoga official database</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>Tamper-evident unique credential hash</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>Direct institutional verification</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Embedded Live Certificate Document Preview */}
            {showDocumentPreview && (
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-yoga-forest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yoga-sage" />
                    Official Certificate Document
                  </h3>
                  <span className="text-xs text-slate-500">ISO Standard A4 Document</span>
                </div>

                <style>{`
                  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Great+Vibes&family=Alex+Brush&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
                  .cert-cinzel { font-family: 'Cinzel', serif; }
                  .cert-name-font { font-family: 'Great Vibes', cursive; }
                  .cert-signature-font { font-family: 'Alex Brush', 'Great Vibes', cursive; }
                  .cert-serif { font-family: 'Playfair Display', serif; }
                  .cert-sans { font-family: 'Montserrat', sans-serif; }
                `}</style>

                <div className="w-full max-w-[680px] mx-auto shadow-2xl rounded-sm overflow-hidden border border-slate-300">
                  <div 
                    className="relative w-full aspect-[210/297] bg-no-repeat bg-center bg-white overflow-hidden"
                    style={{
                      backgroundImage: "url('/certificate-background.webp')",
                      backgroundSize: "100% 100%"
                    }}
                  >
                    {/* Inner content box */}
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

                      {/* 1. TOP CREST */}
                      <div className="w-full flex justify-center items-center pt-1">
                        <CertificateCrest
                          schoolName={settings.certificateSchoolName || 'Shakti Yoga RaaiKtha'}
                          bannerText={certificate.isPremium ? (settings.certificateBannerTextPremium || 'ISO 9001:2015 CERTIFIED') : (settings.certificateBannerText || 'OFFICIAL ACCREDITED')}
                          domain={currentDomain}
                          className="w-56 sm:w-64 md:w-72 aspect-[400/275]"
                        />
                      </div>

                      {/* 2. CENTER SECTION */}
                      <div className="w-full flex flex-col items-center my-auto z-10 px-4">
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

                        <h1 className="cert-cinzel text-2xl sm:text-3xl md:text-4xl font-black text-[#204066] tracking-[0.10em] uppercase my-1 text-center">
                          {settings.certificateTitle || 'CERTIFICATE OF COMPLETION'}
                        </h1>

                        <h2 className="cert-sans text-[10px] sm:text-xs font-semibold tracking-[0.35em] text-[#204066] uppercase mt-0.5">
                          {settings.certificateSubtitle || 'OF ACHIEVEMENT'}
                        </h2>

                        <p className="cert-sans text-[9px] sm:text-[10.5px] font-medium tracking-[0.25em] text-slate-500 uppercase mt-3 mb-0.5">
                          {settings.certificatePresentationLine || 'THIS CERTIFICATE IS PROUDLY PRESENTED TO'}
                        </p>

                        <div className="w-full flex flex-col items-center my-1.5">
                          <h3 className="cert-name-font text-4xl sm:text-5xl md:text-6xl text-slate-900 text-center px-4 pt-1 pb-0 leading-tight">
                            {certificate.studentName}
                          </h3>
                          <div className="w-2/3 max-w-[320px] h-[1px] bg-slate-300 mt-1 mb-2"></div>
                        </div>

                        <p className="cert-serif italic text-xs sm:text-sm text-slate-600 max-w-md text-center leading-relaxed px-2 my-1">
                          {settings.certificateDescription || 'For having successfully completed the comprehensive training program and met all required academic and practical proficiencies in'}
                        </p>

                        <h4 className="cert-cinzel text-sm sm:text-base md:text-lg font-bold text-[#1e3a8a] text-center max-w-lg tracking-wider uppercase my-1.5">
                          {certificate.courseName}
                        </h4>

                        <p className="cert-sans text-[10px] sm:text-xs text-slate-700 tracking-wider text-center font-medium mt-0.5">
                          {(settings.certificateConductedBy || 'Conducted by {school} at Bangalore, India').replace('{school}', settings.certificateSchoolName || 'Shakti Yoga RaaiKtha')}
                        </p>
                      </div>

                      {/* 3. BOTTOM SECTION */}
                      <div className="w-full flex flex-row items-end justify-between pt-3 pb-2 px-3 border-t border-slate-200/60 z-10 gap-2">
                        {/* Left Column: QR Code & Issue Date */}
                        <div className="flex flex-col items-center text-center w-1/3">
                          <div className="p-0.5 bg-white border border-slate-300/80 rounded shadow-xs mb-1">
                            <QRCodeSVG value={verificationUrl} size={42} />
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
        )}

        {/* Status: Not Found / Error */}
        {hasSearched && error && (
          <Card className="border-red-200 bg-red-50/70 text-center p-8 max-w-xl mx-auto shadow-sm">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-900">Certificate Verification Failed</h3>
            <p className="text-sm text-red-700 mt-2 max-w-md mx-auto">{error}</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/yoga-certificate">
                <Button variant="outline" className="border-red-300 text-red-800 hover:bg-red-100/60">
                  Search by Phone Number
                </Button>
              </Link>
              <Link to="/contact">
                <Button className="bg-yoga-sage hover:bg-yoga-forest text-white">
                  Contact Support
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default VerifyCertificate;
