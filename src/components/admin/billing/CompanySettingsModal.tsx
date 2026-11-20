import React, { useState } from 'react';
import { X, Globe, CreditCard, Zap, Upload, Trash2, MapPin, Building, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BillingSettingsData, billingService } from '@/services/billingService';
import { useToast } from '@/hooks/use-toast';

interface CompanySettingsModalProps {
  initialSettings?: BillingSettingsData | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: BillingSettingsData) => void;
}

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  initialSettings,
  isOpen,
  onClose,
  onSaved
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<BillingSettingsData>({
    company_name: initialSettings?.company_name || 'gorilla tech solution',
    company_email: initialSettings?.company_email || 'business@gorillatechsolution.com',
    company_phone: initialSettings?.company_phone || '+91 92 333 11931',
    tax_id_type: initialSettings?.tax_id_type || 'PAN',
    pan: initialSettings?.pan || 'DCKPK2142C',
    license_no: initialSettings?.license_no || 'UDYAM-TR-08-0000160',
    website: initialSettings?.website || 'gorillatechsolution.com',
    address: initialSettings?.address || 'Agartala Tripura(w)',
    zip_code: initialSettings?.zip_code || '799006',
    state: initialSettings?.state || 'Tripura',
    country: initialSettings?.country || 'India',
    bank_name: initialSettings?.bank_name || 'RBL',
    account_name: initialSettings?.account_name || 'prasenjit kar malakar',
    account_number: initialSettings?.account_number || '309028561095',
    ifsc_code: initialSettings?.ifsc_code || 'RATN0000458',
    upi_id: initialSettings?.upi_id || '9233311931@ybl',
    qr_code_url: initialSettings?.qr_code_url || '',
    logo_url: initialSettings?.logo_url || '',
    signature_url: initialSettings?.signature_url || '',
    gst_rate: initialSettings?.gst_rate ?? 18,
    service_charge: initialSettings?.service_charge ?? 1
  });

  if (!isOpen) return null;

  const handleChange = (field: keyof BillingSettingsData, val: any) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handleFileUpload = (field: 'logo_url' | 'signature_url' | 'qr_code_url', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setForm(prev => ({ ...prev, [field]: e.target!.result as string }));
        toast({
          title: "File attached",
          description: "Image attached successfully."
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await billingService.updateSettings(form);
      const data = (res as any).data || res;
      if (data && (data.company_name || data.id)) {
        toast({
          title: "Settings Saved",
          description: "Company details and payment info updated successfully."
        });
        onSaved(data);
        onClose();
      } else {
        toast({
          title: "Save failed",
          description: (res as any).error || "Unable to update settings",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Company & Payment Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your company details, banking information, and branding.
            </p>
          </div>
          <Button onClick={onClose} size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 overflow-y-auto space-y-8 text-sm">
          {/* SECTION 1: Company Details */}
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base mb-4">
              <Globe className="w-5 h-5 text-slate-700" />
              <span>Company Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Company Name</Label>
                <Input
                  className="mt-1"
                  value={form.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="e.g. gorilla tech solution"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Email</Label>
                <Input
                  className="mt-1"
                  type="email"
                  value={form.company_email}
                  onChange={(e) => handleChange('company_email', e.target.value)}
                  placeholder="business@example.com"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Phone</Label>
                <Input
                  className="mt-1"
                  value={form.company_phone}
                  onChange={(e) => handleChange('company_phone', e.target.value)}
                  placeholder="+91 92 333 11931"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Tax ID Type</Label>
                <select
                  value={form.tax_id_type || 'PAN'}
                  onChange={(e) => handleChange('tax_id_type', e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="PAN">PAN</option>
                  <option value="GSTIN">GSTIN</option>
                  <option value="VAT">VAT</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">{form.tax_id_type || 'PAN'}</Label>
                <Input
                  className="mt-1"
                  value={form.pan}
                  onChange={(e) => handleChange('pan', e.target.value)}
                  placeholder="e.g. DCKPK2142C"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">License No.</Label>
                <Input
                  className="mt-1"
                  value={form.license_no}
                  onChange={(e) => handleChange('license_no', e.target.value)}
                  placeholder="UDYAM-TR-08-0000160"
                />
              </div>

              <div className="sm:col-span-3">
                <Label className="text-xs font-semibold text-slate-700">Company Website</Label>
                <div className="relative mt-1">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    className="pl-9 font-mono"
                    value={form.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="gorillatechsolution.com"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <Label className="text-xs font-semibold text-slate-700">Address</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Textarea
                    className="pl-9 min-h-[70px]"
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Agartala Tripura(w)"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">ZIP Code</Label>
                <Input
                  className="mt-1"
                  value={form.zip_code}
                  onChange={(e) => handleChange('zip_code', e.target.value)}
                  placeholder="799006"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">State</Label>
                <Input
                  className="mt-1"
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="Tripura"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Country</Label>
                <Input
                  className="mt-1"
                  value={form.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="India"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* SECTION 2: Payment Settings */}
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base mb-4">
              <CreditCard className="w-5 h-5 text-slate-700" />
              <span>Payment Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Bank Details Card */}
              <div className="p-4 border rounded-xl bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Bank Details</h4>

                <div>
                  <Label className="text-xs text-slate-600">Bank Name</Label>
                  <Input
                    className="mt-1 bg-white"
                    value={form.bank_name}
                    onChange={(e) => handleChange('bank_name', e.target.value)}
                    placeholder="RBL"
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-600">Account Name</Label>
                  <Input
                    className="mt-1 bg-white"
                    value={form.account_name}
                    onChange={(e) => handleChange('account_name', e.target.value)}
                    placeholder="prasenjit kar malakar"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-slate-600">Account Number</Label>
                    <Input
                      className="mt-1 bg-white font-mono"
                      value={form.account_number}
                      onChange={(e) => handleChange('account_number', e.target.value)}
                      placeholder="309028561095"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">IFSC Code</Label>
                    <Input
                      className="mt-1 bg-white font-mono"
                      value={form.ifsc_code}
                      onChange={(e) => handleChange('ifsc_code', e.target.value)}
                      placeholder="RATN0000458"
                    />
                  </div>
                </div>
              </div>

              {/* UPI & QR Card */}
              <div className="p-4 border rounded-xl bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">UPI & QR</h4>

                <div>
                  <Label className="text-xs text-slate-600">UPI ID</Label>
                  <Input
                    className="mt-1 bg-white font-mono"
                    value={form.upi_id}
                    onChange={(e) => handleChange('upi_id', e.target.value)}
                    placeholder="9233311931@ybl"
                  />
                </div>

                <div>
                  <Label className="text-xs text-slate-600">QR Code Image</Label>
                  <div className="mt-1.5 flex items-start space-x-3">
                    <div className="w-16 h-16 border rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      {form.qr_code_url ? (
                        <img loading="lazy" src={form.qr_code_url} alt="QR" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-[10px] text-slate-400 font-mono text-center p-1">No QR</div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <label className="cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm">
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          <span>Change Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('qr_code_url', file);
                            }}
                          />
                        </label>
                        {form.qr_code_url && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleChange('qr_code_url', '')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">Formats: JPG/PNG/WEBP. Max: 2MB.</p>
                      <p className="text-[10px] text-amber-700 font-medium">💡 Recommended: 400x400px (SQR)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* SECTION 3: Branding */}
          <div>
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base mb-4">
              <Zap className="w-5 h-5 text-slate-700" />
              <span>Branding</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Company Logo */}
              <div className="p-4 border rounded-xl bg-slate-50/50 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Company Logo</h4>
                <div className="flex items-start space-x-3 pt-1">
                  <div className="w-24 h-16 border rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {form.logo_url ? (
                      <img loading="lazy" src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-[10px] text-slate-400 font-mono text-center p-1">No Logo</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <label className="cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm">
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        <span>Change Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('logo_url', file);
                          }}
                        />
                      </label>
                      {form.logo_url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleChange('logo_url', '')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">Formats: JPG/PNG/WEBP. Max: 2MB.</p>
                    <p className="text-[10px] text-amber-700 font-medium">💡 Recommended: 500x200px (L-PNG)</p>
                  </div>
                </div>
              </div>

              {/* Authorized Signature */}
              <div className="p-4 border rounded-xl bg-slate-50/50 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Authorized Signature</h4>
                <div className="flex items-start space-x-3 pt-1">
                  <div className="w-24 h-16 border rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {form.signature_url ? (
                      <img loading="lazy" src={form.signature_url} alt="Signature" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-[10px] text-slate-400 font-mono text-center p-1">No Sig</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <label className="cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm">
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        <span>Change Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('signature_url', file);
                          }}
                        />
                      </label>
                      {form.signature_url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleChange('signature_url', '')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">Formats: JPG/PNG/WEBP. Max: 2MB.</p>
                    <p className="text-[10px] text-amber-700 font-medium">💡 Recommended: 400x200px (S-PNG)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white min-w-[120px]">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanySettingsModal;
