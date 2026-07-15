import React, { useState, useEffect } from 'react';
import AdminLoadingSpinner from './admin/AdminLoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Award, Plus, Trash2, Loader2, Copy, Settings } from 'lucide-react';
import { certificateService, bookingService } from '@/services/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClassesData } from '@/hooks/useClassesData';
import { useInstructorsData } from '@/hooks/useInstructorsData';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { defaultSiteSettings } from '@/config/siteSettings';
import ImagePicker from '@/components/ImagePicker';

interface Certificate {
  id: string;
  certificateId: string;
  studentName: string;
  courseName: string;
  issueDate: string;
  instructorName: string;
  created_at: string;
}

const AdminCertificates = () => {
  const { toast } = useToast();
  const { classes } = useClassesData();
  const { instructors } = useInstructorsData();
  
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  
  const siteSettings = useSiteSettings();
  const [settingsForm, setSettingsForm] = useState({
    certificateSchoolName: siteSettings.certificateSchoolName || 'Shakti Yoga Vidya Peetham',
    certificateSignatureImage: siteSettings.certificateSignatureImage || '',
    certificateRegNoTemplate: siteSettings.certificateRegNoTemplate || 'Reg. No. {id}/ATTC/SYVP/{year}',
    certificateTitle: siteSettings.certificateTitle || 'CERTIFICATE OF COMPLETION',
    certificateIsoImage: siteSettings.certificateIsoImage || ''
  });

  useEffect(() => {
    setSettingsForm({
      certificateSchoolName: siteSettings.certificateSchoolName || 'Shakti Yoga Vidya Peetham',
      certificateSignatureImage: siteSettings.certificateSignatureImage || '',
      certificateRegNoTemplate: siteSettings.certificateRegNoTemplate || 'Reg. No. {id}/ATTC/SYVP/{year}',
      certificateTitle: siteSettings.certificateTitle || 'CERTIFICATE OF COMPLETION',
      certificateIsoImage: siteSettings.certificateIsoImage || ''
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
    instructorName: ''
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
    setIsLoading(true);
    try {
      const data = await certificateService.getCertificates();
      setCertificates(data || []);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load certificates.",
      });
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
        instructorName: ''
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this certificate? This action cannot be undone.")) return;
    try {
      await certificateService.deleteCertificate(id);
      toast({
        title: "Success",
        description: "Certificate deleted successfully.",
      });
      fetchCertificates();
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

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-yoga-forest mb-2">Yoga Certificates</h2>
          <p className="text-yoga-forest/70">Issue and manage student certificates.</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-yoga-forest text-yoga-forest">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Certificate Layout Settings</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSettingsSave} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Certificate Title</Label>
                  <Input 
                    value={settingsForm.certificateTitle} 
                    onChange={e => setSettingsForm({...settingsForm, certificateTitle: e.target.value})}
                  />
                  <p className="text-xs text-slate-500">The primary title of the certificate (e.g., CERTIFICATE OF COMPLETION).</p>
                </div>
                <div className="space-y-2">
                  <Label>School Name</Label>
                  <Input 
                    value={settingsForm.certificateSchoolName} 
                    onChange={e => setSettingsForm({...settingsForm, certificateSchoolName: e.target.value})}
                  />
                  <p className="text-xs text-slate-500">The main title text displayed at the top center of the certificate.</p>
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
                  <p className="text-xs text-slate-500">Supported/Recommended size: 80x80 pixels (PNG format with transparent background). Leave blank to use the default gold seal.</p>
                </div>
                <div className="space-y-2">
                  <Label>Registration Number Template</Label>
                  <Input 
                    value={settingsForm.certificateRegNoTemplate} 
                    onChange={e => setSettingsForm({...settingsForm, certificateRegNoTemplate: e.target.value})}
                  />
                  <p className="text-xs text-slate-500">Use {'{id}'} for the certificate ID prefix, and {'{year}'} for the issue year.</p>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Certificate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
              <div className="pt-4 flex justify-end">
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
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yoga-sage" />
            Issued Certificates
          </CardTitle>
          <CardDescription>A complete list of all verified yoga certificates issued to students.</CardDescription>
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-yoga-forest uppercase bg-yoga-cream/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Certificate ID</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Issue Date</th>
                    <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="border-b border-yoga-cream/50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono">
                        <div className="flex items-center gap-2">
                          {cert.certificateId}
                          <button onClick={() => copyToClipboard(cert.certificateId)} className="text-slate-400 hover:text-yoga-sage" title="Copy ID">
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-yoga-forest">{cert.studentName}</td>
                      <td className="px-4 py-3 text-yoga-forest/80">{cert.courseName}</td>
                      <td className="px-4 py-3 text-yoga-forest/80">{new Date(cert.issueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(cert.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCertificates;
