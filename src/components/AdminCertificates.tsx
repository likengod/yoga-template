import React, { useState, useEffect } from 'react';
import AdminLoadingSpinner from './admin/AdminLoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Award, Plus, Trash2, Loader2, Copy, Settings, ExternalLink, Eye, Sparkles } from 'lucide-react';
import { certificateService, bookingService, DEFAULT_DEMO_CERTIFICATES } from '@/services/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClassesData } from '@/hooks/useClassesData';
import { useInstructorsData } from '@/hooks/useInstructorsData';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { defaultSiteSettings } from '@/config/siteSettings';
import ImagePicker from '@/components/ImagePicker';
import { QRCodeSVG } from 'qrcode.react';
import CertificateCrest from '@/components/CertificateCrest';
import CertificateSeal from '@/components/CertificateSeal';

interface Certificate {
  id: string;
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  instructorName: string;
  phone?: string;
  signature_url?: string;
  isPremium?: boolean;
  showRegNo?: boolean;
  showIsoBadge?: boolean;
  created_at: string;
}

const AdminCertificates = () => {
  const { toast } = useToast();
  const { classes } = useClassesData();
  const { instructors } = useInstructorsData();
  
  const [certificates, setCertificates] = useState<Certificate[]>(DEFAULT_DEMO_CERTIFICATES as any);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  
  // Preview modal state
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  
  const siteSettings = useSiteSettings();
  const [settingsForm, setSettingsForm] = useState({
    certificateSchoolName: siteSettings.certificateSchoolName || 'Shakti Yoga RaaiKtha',
    certificateSignatureImage: siteSettings.certificateSignatureImage || '',
    certificateRegNoTemplate: siteSettings.certificateRegNoTemplate || 'Reg. No. {id}/ATTC/SYVP/{year}',
    certificateTitle: siteSettings.certificateTitle || 'CERTIFICATE OF COMPLETION',
    certificateSubtitle: siteSettings.certificateSubtitle || 'OF ACHIEVEMENT',
    certificatePresentationLine: siteSettings.certificatePresentationLine || 'THIS CERTIFICATE IS PROUDLY PRESENTED TO',
    certificateDescription: siteSettings.certificateDescription || 'For having successfully completed the comprehensive training program and met all required academic and practical proficiencies in',
    certificateConductedBy: siteSettings.certificateConductedBy || 'Conducted by {school} at Bangalore, India',
    certificateBannerText: siteSettings.certificateBannerText || 'OFFICIAL ACCREDITED',
    certificateBannerTextPremium: siteSettings.certificateBannerTextPremium || 'ISO 9001:2015 CERTIFIED',
    certificateManagerTitle: siteSettings.certificateManagerTitle || 'General Manager',
    certificateIsoImage: siteSettings.certificateIsoImage || '',
    certificateLogo: siteSettings.certificateLogo || siteSettings.headerLogo || '/gorillatechsolution-uploads/001a3e79-c253-4f0f-8842-ed9a57850b57.png',
    certificateLicenseNo: siteSettings.certificateLicenseNo || 'Lic. No: SY-AYUSH-2024/88'
  });

  useEffect(() => {
    setSettingsForm({
      certificateSchoolName: siteSettings.certificateSchoolName || 'Shakti Yoga RaaiKtha',
      certificateSignatureImage: siteSettings.certificateSignatureImage || '',
      certificateRegNoTemplate: siteSettings.certificateRegNoTemplate || 'Reg. No. {id}/ATTC/SYVP/{year}',
      certificateTitle: siteSettings.certificateTitle || 'CERTIFICATE OF COMPLETION',
      certificateSubtitle: siteSettings.certificateSubtitle || 'OF ACHIEVEMENT',
      certificatePresentationLine: siteSettings.certificatePresentationLine || 'THIS CERTIFICATE IS PROUDLY PRESENTED TO',
      certificateDescription: siteSettings.certificateDescription || 'For having successfully completed the comprehensive training program and met all required academic and practical proficiencies in',
      certificateConductedBy: siteSettings.certificateConductedBy || 'Conducted by {school} at Bangalore, India',
      certificateBannerText: siteSettings.certificateBannerText || 'OFFICIAL ACCREDITED',
      certificateBannerTextPremium: siteSettings.certificateBannerTextPremium || 'ISO 9001:2015 CERTIFIED',
      certificateManagerTitle: siteSettings.certificateManagerTitle || 'General Manager',
      certificateIsoImage: siteSettings.certificateIsoImage || '',
      certificateLogo: siteSettings.certificateLogo || siteSettings.headerLogo || '/gorillatechsolution-uploads/001a3e79-c253-4f0f-8842-ed9a57850b57.png',
      certificateLicenseNo: siteSettings.certificateLicenseNo || 'Lic. No: SY-AYUSH-2024/88'
    });
  }, [siteSettings]);

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stored = localStorage.getItem('siteSettings');
      const parsed = stored ? JSON.parse(stored) : defaultSiteSettings;
      const updated = { ...parsed, ...settingsForm };
      localStorage.setItem('siteSettings', JSON.stringify(updated));
      window.dispatchEvent(new Event('siteSettingsUpdated'));
      setIsSettingsOpen(false);
      toast({ title: 'Success', description: 'Certificate settings saved successfully.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    }
  };

  const [formData, setFormData] = useState({
    certificateId: `SY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    studentName: '',
    courseName: '',
    issueDate: new Date().toISOString().split('T')[0],
    instructorName: '',
    isPremium: false
  });

  const handleSearchPhone = async () => {
    if (!searchPhone.trim()) return;
    setIsSearchingPhone(true);
    try {
      const data = await bookingService.searchBookingsByPhone(searchPhone.trim());
      if (data && data.status === 'confirmed') {
        const foundClassType = data.class_type || data.classType;
        
        // Find matching class and its instructor
        const matchedClass = classes?.find(c => c.title === foundClassType);
        const matchedInstructor = instructors?.find(i => i.id === matchedClass?.instructorId);

        setFormData(prev => ({
          ...prev,
          studentName: data.name,
          courseName: foundClassType || prev.courseName,
          instructorName: matchedInstructor?.name || prev.instructorName
        }));
        toast({ title: "Student Found", description: "Details auto-filled from confirmed booking." });
      } else if (data) {
        toast({ variant: "destructive", title: "Booking Not Confirmed", description: `Found booking for ${data.name}, but status is ${data.status}.` });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Not Found", description: "No booking found for this phone number." });
    } finally {
      setIsSearchingPhone(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const data = await certificateService.getCertificates();
      if (Array.isArray(data) && data.length > 0) {
        setCertificates(data);
      } else {
        setCertificates(DEFAULT_DEMO_CERTIFICATES as any);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      setCertificates(DEFAULT_DEMO_CERTIFICATES as any);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await certificateService.issueCertificate(formData);
      toast({
        title: "Success",
        description: "Certificate issued successfully.",
      });
      setIsDialogOpen(false);
      setFormData({
        certificateId: `SY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: '',
        courseName: '',
        issueDate: new Date().toISOString().split('T')[0],
        instructorName: '',
        isPremium: false
      });
      setSearchPhone('');
      fetchCertificates();
    } catch (error) {
      console.error('Failed to issue certificate:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to issue certificate. ID may already exist.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePremium = async (id: string, newPremium: boolean) => {
    // Update local state optimistically
    setCertificates(prev => prev.map(c => {
      if (c.id === id || c.certificateId === id) {
        return { ...c, isPremium: newPremium };
      }
      return c;
    }));

    if (previewCert && (previewCert.id === id || previewCert.certificateId === id)) {
      setPreviewCert(prev => prev ? ({ ...prev, isPremium: newPremium }) : null);
    }

    try {
      await certificateService.updateCertificate(id, { isPremium: newPremium });
      toast({
        title: newPremium ? 'Premium Activated' : 'Standard Tier',
        description: newPremium 
          ? 'Certificate set to Premium (Reg No & ISO Badge automatically enabled).' 
          : 'Certificate set to Standard (Reg No & ISO Badge hidden).',
      });
    } catch (error) {
      console.error('Failed to update premium toggle:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not save setting change."
      });
      fetchCertificates();
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCerts(certificates.map(c => c.id));
    } else {
      setSelectedCerts([]);
    }
  };

  const handleSelectCert = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCerts(prev => [...prev, id]);
    } else {
      setSelectedCerts(prev => prev.filter(x => x !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCerts.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedCerts.length} selected certificates? This action cannot be undone.`)) return;

    const count = selectedCerts.length;
    const ids = [...selectedCerts];

    try {
      await Promise.all(ids.map(id => certificateService.deleteCertificate(id).catch(() => {})));
      setCertificates(prev => {
        const remaining = prev.filter(c => !ids.includes(c.id) && !ids.includes(c.certificateId));
        if (remaining.length === 0) {
          localStorage.setItem('certs_cleared', 'true');
        }
        return remaining;
      });
      setSelectedCerts([]);
      toast({
        title: "Certificates Deleted",
        description: `Successfully deleted ${count} certificates.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete Error",
        description: "Failed to delete certificates.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this certificate? This action cannot be undone.")) return;
    try {
      await certificateService.deleteCertificate(id);
      setSelectedCerts(prev => prev.filter(x => x !== id));
      setCertificates(prev => {
        const remaining = prev.filter(c => c.id !== id && c.certificateId !== id);
        if (remaining.length === 0) {
          localStorage.setItem('certs_cleared', 'true');
        }
        return remaining;
      });
      toast({
        title: "Success",
        description: "Certificate deleted successfully.",
      });
    } catch (error) {
      console.error('Failed to delete certificate:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete certificate.",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Certificate ID copied to clipboard.",
    });
  };

  const openPreview = (cert: Certificate) => {
    setPreviewCert(cert);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6 w-full max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-yoga-forest mb-2">Yoga Certificates</h2>
          <p className="text-yoga-forest/70">Issue and manage student certificates. Standard by default; activate Premium to display official Reg No & ISO accreditation badges.</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-yoga-forest text-yoga-forest">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Certificate Layout Settings</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSettingsSave} className="space-y-4 pt-4">
                
                {/* 1. Header & Titles */}
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                  <h3 className="text-xs font-bold text-yoga-forest uppercase tracking-wider">Titles & Emblems</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Certificate Title</Label>
                      <Input 
                        value={settingsForm.certificateTitle} 
                        onChange={e => setSettingsForm({...settingsForm, certificateTitle: e.target.value})}
                        placeholder="CERTIFICATE OF COMPLETION"
                      />
                      <p className="text-[11px] text-slate-500">Main uppercase heading.</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Certificate Subtitle</Label>
                      <Input 
                        value={settingsForm.certificateSubtitle} 
                        onChange={e => setSettingsForm({...settingsForm, certificateSubtitle: e.target.value})}
                        placeholder="OF ACHIEVEMENT"
                      />
                      <p className="text-[11px] text-slate-500">Subtitle directly below main heading.</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>School Name</Label>
                    <Input 
                      value={settingsForm.certificateSchoolName} 
                      onChange={e => setSettingsForm({...settingsForm, certificateSchoolName: e.target.value})}
                      placeholder="Shakti Yoga RaaiKtha"
                    />
                    <p className="text-[11px] text-slate-500">Displayed in laurel wreath emblem and throughout the certificate.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Standard Ribbon Banner Text</Label>
                      <Input 
                        value={settingsForm.certificateBannerText} 
                        onChange={e => setSettingsForm({...settingsForm, certificateBannerText: e.target.value})}
                        placeholder="OFFICIAL ACCREDITED"
                      />
                      <p className="text-[11px] text-slate-500">Text on golden ribbon for Standard certificates.</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Premium Ribbon Banner Text</Label>
                      <Input 
                        value={settingsForm.certificateBannerTextPremium} 
                        onChange={e => setSettingsForm({...settingsForm, certificateBannerTextPremium: e.target.value})}
                        placeholder="ISO 9001:2015 CERTIFIED"
                      />
                      <p className="text-[11px] text-slate-500">Text on golden ribbon for Premium certificates.</p>
                    </div>
                  </div>
                </div>

                {/* 2. Certificate Body Content */}
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                  <h3 className="text-xs font-bold text-yoga-forest uppercase tracking-wider">Certificate Body & Descriptions</h3>
                  
                  <div className="space-y-1.5">
                    <Label>Presentation Line</Label>
                    <Input 
                      value={settingsForm.certificatePresentationLine} 
                      onChange={e => setSettingsForm({...settingsForm, certificatePresentationLine: e.target.value})}
                      placeholder="THIS CERTIFICATE IS PROUDLY PRESENTED TO"
                    />
                    <p className="text-[11px] text-slate-500">Line introducing the student's name.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Completion Description Text</Label>
                    <Textarea 
                      rows={3}
                      value={settingsForm.certificateDescription} 
                      onChange={e => setSettingsForm({...settingsForm, certificateDescription: e.target.value})}
                      placeholder="For having successfully completed the comprehensive training program and met all required academic and practical proficiencies in"
                    />
                    <p className="text-[11px] text-slate-500">The description paragraph between the student's name and course title.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Conducted By / Location Text</Label>
                    <Input 
                      value={settingsForm.certificateConductedBy} 
                      onChange={e => setSettingsForm({...settingsForm, certificateConductedBy: e.target.value})}
                      placeholder="Conducted by {school} at Bangalore, India"
                    />
                    <p className="text-[11px] text-slate-500">Location text below course title. Use <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">{'{school}'}</code> to automatically insert School Name.</p>
                  </div>
                </div>

                {/* 3. Branding, Authority & Signatures */}
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                  <h3 className="text-xs font-bold text-yoga-forest uppercase tracking-wider">Branding & Authority Signatures</h3>
                  
                  <div className="space-y-2">
                    <Label>Shakti Yoga Logo (Top-Left Corner)</Label>
                    <ImagePicker 
                      value={settingsForm.certificateLogo} 
                      onChange={value => setSettingsForm({...settingsForm, certificateLogo: value})}
                      placeholder="/gorillatechsolution-uploads/001a3e79-c253-4f0f-8842-ed9a57850b57.png"
                    />
                    <p className="text-xs text-slate-500">Official logo shown on the top-left side inside the certificate.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>License / Affiliation Number (Below Logo)</Label>
                    <Input 
                      value={settingsForm.certificateLicenseNo} 
                      onChange={e => setSettingsForm({...settingsForm, certificateLicenseNo: e.target.value})}
                      placeholder="e.g. Lic. No: SY-AYUSH-2024/88"
                    />
                    <p className="text-xs text-slate-500">Official license or affiliation number displayed directly below the Shakti Yoga logo at the top-left.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Signatory Designation / Title</Label>
                      <Input 
                        value={settingsForm.certificateManagerTitle} 
                        onChange={e => setSettingsForm({...settingsForm, certificateManagerTitle: e.target.value})}
                        placeholder="General Manager"
                      />
                      <p className="text-[11px] text-slate-500">Title displayed below the Master Instructor's name.</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Registration Number Template</Label>
                      <Input 
                        value={settingsForm.certificateRegNoTemplate} 
                        onChange={e => setSettingsForm({...settingsForm, certificateRegNoTemplate: e.target.value})}
                        placeholder="Reg. No. {id}/ATTC/SYVP/{year}"
                      />
                      <p className="text-[11px] text-slate-500">Use {'{id}'} and {'{year}'} placeholders.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Master Instructor Signature (Image URL)</Label>
                    <ImagePicker 
                      value={settingsForm.certificateSignatureImage} 
                      onChange={value => setSettingsForm({...settingsForm, certificateSignatureImage: value})}
                      placeholder="https://example.com/signature.png"
                    />
                    <p className="text-xs text-slate-500">Leave blank to use the default cursive text.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>ISO Icon Badge (Image URL)</Label>
                    <ImagePicker 
                      value={settingsForm.certificateIsoImage} 
                      onChange={value => setSettingsForm({...settingsForm, certificateIsoImage: value})}
                      placeholder="https://example.com/iso-badge.png"
                    />
                    <p className="text-xs text-slate-500">Recommended size: 80x80 pixels (PNG format with transparent background). Leave blank to use the default gold seal.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-yoga-sage hover:bg-yoga-forest">Save Settings</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yoga-sage hover:bg-yoga-forest">
                <Plus className="h-4 w-4 mr-2" />
                Issue New Certificate
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Issue Certificate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="certificateId">Certificate ID</Label>
                <Input id="certificateId" name="certificateId" value={formData.certificateId} onChange={handleInputChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchPhone">Student Phone Number (Auto-fill)</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="searchPhone" 
                    placeholder="Enter phone number..." 
                    value={searchPhone} 
                    onChange={(e) => setSearchPhone(e.target.value)} 
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleSearchPhone} 
                    disabled={isSearchingPhone || !searchPhone}
                  >
                    {isSearchingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name</Label>
                <Input id="studentName" name="studentName" value={formData.studentName} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseName">Course Name</Label>
                <Select
                  value={formData.courseName}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, courseName: val }))}
                  required
                >
                  <SelectTrigger id="courseName">
                    <SelectValue placeholder="Select a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map(cls => (
                      <SelectItem key={cls.id} value={cls.title || `course-${cls.id}`}>{cls.title || "Unnamed Course"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input type="date" id="issueDate" name="issueDate" value={formData.issueDate} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructorName">Instructor Name</Label>
                  <Select
                    value={formData.instructorName}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, instructorName: val }))}
                    required
                  >
                    <SelectTrigger id="instructorName">
                      <SelectValue placeholder="Select an instructor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors?.map(inst => (
                        <SelectItem key={inst.id} value={inst.name || `instructor-${inst.id}`}>{inst.name || "Unnamed Instructor"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Single Unified Premium Certificate Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <Label htmlFor="isPremium" className="text-sm font-semibold text-amber-950 cursor-pointer">
                      Premium Certificate
                    </Label>
                  </div>
                  <p className="text-xs text-amber-800/80">
                    Automatically includes official Registration Number (Reg No.) and ISO Accreditation Badge
                  </p>
                </div>
                <Switch
                  id="isPremium"
                  checked={formData.isPremium}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPremium: checked }))}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="bg-yoga-sage hover:bg-yoga-forest">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Issue Certificate"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yoga-sage" />
                Issued Certificates
              </CardTitle>
              <CardDescription>
                A complete list of all verified yoga certificates. All certificates are Standard by default — click to toggle Premium.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedCerts.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 rounded-lg shadow-sm font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedCerts.length})</span>
                </Button>
              )}
              <span className="self-start sm:self-center text-xs px-3 py-1 bg-yoga-sage/15 text-yoga-forest font-semibold rounded-full border border-yoga-sage/20">
                {certificates.length} Total Certificates
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <AdminLoadingSpinner message="Loading certificates..." />
          ) : certificates.length === 0 ? (
            <div className="text-center py-12 text-yoga-forest/70">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No certificates issued yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-xs">
              <table className="w-full min-w-[860px] text-sm text-left border-collapse">
                <thead className="text-xs text-yoga-forest uppercase bg-yoga-cream/40 border-b border-slate-200/80 font-semibold">
                  <tr>
                    <th className="px-3 py-3.5 w-10 text-center rounded-tl-xl">
                      <input
                        type="checkbox"
                        checked={certificates.length > 0 && selectedCerts.length === certificates.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-slate-300 text-yoga-sage cursor-pointer w-4 h-4"
                        title="Select All"
                      />
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Certificate ID</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Student Name</th>
                    <th className="px-4 py-3.5 min-w-[220px]">Course</th>
                    <th className="px-4 py-3.5 text-center whitespace-nowrap">Type</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Instructor</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Issue Date</th>
                    <th className="px-4 py-3.5 rounded-tr-xl text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.map((cert) => {
                    const isPremium = cert.isPremium === true;
                    const isSelected = selectedCerts.includes(cert.id);

                    return (
                      <tr key={cert.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-yoga-cream/20' : ''}`}>
                        <td className="px-3 py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectCert(cert.id, e.target.checked)}
                            className="rounded border-slate-300 text-yoga-sage cursor-pointer w-4 h-4"
                          />
                        </td>
                        <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 bg-yoga-cream/70 border border-yoga-cream/80 px-2.5 py-1 rounded-md text-xs font-semibold text-yoga-forest shadow-2xs">
                            <span className="whitespace-nowrap tracking-wide">{cert.certificateId}</span>
                            <button 
                              onClick={() => copyToClipboard(cert.certificateId)} 
                              className="text-slate-400 hover:text-yoga-forest transition-colors p-0.5 ml-0.5" 
                              title="Copy ID"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 text-sm">{cert.studentName}</div>
                          {cert.phone && (
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{cert.phone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 font-medium text-xs sm:text-sm">
                          <span className="line-clamp-2 max-w-sm">{cert.courseName}</span>
                        </td>
                        
                        {/* Single Unified Premium Toggle */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          {isPremium ? (
                            <button
                              type="button"
                              onClick={() => handleTogglePremium(cert.id, false)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-all cursor-pointer shadow-xs"
                              title="Premium active (Reg No & ISO Badge shown). Click to switch to Standard."
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                              <span>Premium</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTogglePremium(cert.id, true)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer"
                              title="Standard tier (Reg No & ISO Badge hidden). Click to activate Premium."
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>Standard</span>
                            </button>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 border border-slate-200/60">
                            {cert.instructorName || 'Master Instructor'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 text-xs font-medium whitespace-nowrap">
                          {new Date(cert.issueDate).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openPreview(cert)}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-yoga-forest hover:bg-yoga-cream/60 rounded-md transition-colors" 
                              title="Live Preview Certificate"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <a 
                              href={`/yoga-certificate`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="h-8 w-8 inline-flex items-center justify-center p-0 text-slate-500 hover:text-yoga-forest hover:bg-yoga-cream/60 rounded-md transition-colors" 
                              title="Open Student Certificate Portal"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(cert.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete Certificate"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Certificate Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <DialogTitle className="text-xl font-bold text-yoga-forest flex items-center gap-2">
                  <Award className="h-5 w-5 text-yoga-sage" />
                  Certificate Preview: {previewCert?.studentName}
                </DialogTitle>
                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {previewCert?.certificateId}</p>
              </div>

              {previewCert && (
                <div className="flex items-center gap-2.5 bg-amber-50/80 px-3.5 py-1.5 rounded-lg border border-amber-200">
                  <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span className="text-xs font-semibold text-amber-950">Premium Tier:</span>
                  <Switch
                    checked={previewCert.isPremium !== false}
                    onCheckedChange={(checked) => handleTogglePremium(previewCert.id, checked)}
                  />
                  <span className="text-[11px] font-semibold text-amber-800">
                    {previewCert.isPremium !== false ? 'Active (Reg No + ISO Shown)' : 'Standard (Hidden)'}
                  </span>
                </div>
              )}
            </div>
          </DialogHeader>

          {previewCert && (
            <div className="pt-2 flex flex-col items-center w-full">
              <div 
                className="w-full max-w-[540px] aspect-[210/297] rounded-lg shadow-xl relative overflow-hidden bg-no-repeat bg-center bg-white border border-slate-300"
                style={{
                  backgroundImage: "url('/certificate-background.webp')",
                  backgroundSize: "100% 100%"
                }}
              >
                <div 
                  className="absolute inset-0 flex flex-col justify-between items-center text-center select-none"
                  style={{
                    left: '6.5%',
                    top: '6%',
                    width: '87%',
                    height: '88%',
                    padding: '14px 16px',
                  }}
                >
                  {/* Top Left Shakti Yoga Logo & License Number */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex flex-col items-center pointer-events-none">
                    {(siteSettings.certificateLogo || siteSettings.headerLogo) && (
                      <img 
                        src={siteSettings.certificateLogo || siteSettings.headerLogo} 
                        alt="Shakti Yoga Logo" 
                        className="h-10 sm:h-12 md:h-14 w-auto max-w-[80px] sm:max-w-[100px] object-contain drop-shadow-xs" 
                      />
                    )}
                    {(siteSettings.certificateLicenseNo || 'Lic. No: SY-AYUSH-2024/88') && (
                      <div className="mt-1 px-1.5 py-0.5 rounded bg-white/75 border border-slate-300/60 shadow-2xs">
                        <p className="text-[6.5px] sm:text-[7.5px] font-bold text-[#1b3960] tracking-wider whitespace-nowrap">
                          {siteSettings.certificateLicenseNo || 'Lic. No: SY-AYUSH-2024/88'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Top Golden Laurel Crest */}
                  <div className="w-full flex justify-center items-center pt-1">
                    <CertificateCrest
                      schoolName={siteSettings.certificateSchoolName || 'Shakti Yoga RaaiKtha'}
                      bannerText={previewCert.isPremium ? (siteSettings.certificateBannerTextPremium || 'ISO 9001:2015 CERTIFIED') : (siteSettings.certificateBannerText || 'OFFICIAL ACCREDITED')}
                      domain="SHAKTIYOGARAAI.COM"
                      className="w-48 sm:w-56 md:w-60 aspect-[400/275]"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="text-center my-auto px-4 space-y-1.5">
                    <h4 className="text-base sm:text-xl font-black tracking-widest text-[#204066] uppercase font-serif">
                      {siteSettings.certificateTitle || 'CERTIFICATE OF COMPLETION'}
                    </h4>
                    <p className="text-[8.5px] font-semibold text-[#204066] tracking-[0.25em] uppercase">
                      {siteSettings.certificateSubtitle || 'OF ACHIEVEMENT'}
                    </p>
                    <p className="text-[8px] uppercase tracking-wider text-slate-500 mt-1">
                      {siteSettings.certificatePresentationLine || 'THIS CERTIFICATE IS PROUDLY PRESENTED TO'}
                    </p>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl text-slate-900 font-serif font-bold italic py-1">
                      {previewCert.studentName}
                    </h2>
                    <div className="w-2/3 max-w-[280px] mx-auto h-[1px] bg-slate-300 mb-1"></div>
                    <p className="text-[9px] sm:text-[10px] text-slate-600 italic font-serif max-w-sm mx-auto">
                      {siteSettings.certificateDescription || 'For having successfully completed the comprehensive training program and met all required academic and practical proficiencies in'}
                    </p>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#1e3a8a] font-serif max-w-sm mx-auto">
                      {previewCert.courseName}
                    </h3>
                    <p className="text-[8.5px] text-slate-700 font-serif">
                      {(siteSettings.certificateConductedBy || 'Conducted by {school} at Bangalore, India').replace('{school}', siteSettings.certificateSchoolName || 'Shakti Yoga RaaiKtha')}
                    </p>
                  </div>

                  {/* Footer Details: Left Sig, Wax Seal Center, Right Sig */}
                  <div className="w-full flex items-end justify-between pt-2 border-t border-slate-200/80 text-xs">
                    <div className="flex items-center gap-1.5">
                      <QRCodeSVG 
                        value={typeof window !== 'undefined' ? `${window.location.origin}/verify/${previewCert.certificateId}` : `https://shaktiyogaraai.com/verify/${previewCert.certificateId}`} 
                        size={32} 
                      />
                      <div className="text-[8px] text-slate-600 text-left">
                        <div className="font-semibold">{new Date(previewCert.issueDate).toLocaleDateString()}</div>
                        <div className="text-[7px] text-slate-400">ISSUED ON</div>
                      </div>
                    </div>

                    {/* Center Seal / ISO Badge */}
                    <div className="flex items-center justify-center relative pb-0.5">
                      <CertificateSeal
                        isPremium={previewCert.isPremium}
                        showIsoBadge={previewCert.showIsoBadge}
                        customIsoImage={siteSettings.certificateIsoImage}
                        className="w-14 h-14 sm:w-16 sm:h-16"
                      />
                    </div>

                    <div className="text-center">
                      {previewCert.signature_url || siteSettings.certificateSignatureImage ? (
                        <img loading="lazy" src={previewCert.signature_url || siteSettings.certificateSignatureImage} alt="Signature" className="h-7 mx-auto object-contain" />
                      ) : (
                        <div className="font-serif italic text-xs text-slate-800">{previewCert.instructorName || 'Master Instructor'}</div>
                      )}
                      <div className="border-t border-slate-400 pt-0.5 text-[8.5px] font-semibold text-slate-700">
                        {previewCert.instructorName || 'Master Instructor'}
                      </div>
                      <div className="text-[7px] text-slate-400">
                        {siteSettings.certificateManagerTitle || 'General Manager'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end w-full max-w-[540px] gap-2 mt-4 pt-3 border-t">
                <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)} className="h-8 text-xs px-3">
                  Close
                </Button>
                <a 
                  href={`/yoga-certificate`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 h-8 bg-yoga-sage hover:bg-yoga-forest text-white rounded-md text-xs font-medium transition-colors shrink-0 whitespace-nowrap"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Public Student View
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCertificates;
