import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Calendar,
  CreditCard,
  QrCode,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  Printer,
  Eye,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { billingService, InvoiceData, BillingSettingsData } from '@/services/billingService';
const InvoicePrintView = lazy(() => import('@/components/admin/billing/InvoicePrintView'));

export const VerifyInvoice: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { invoiceNumber: paramNumber } = useParams<{ invoiceNumber?: string }>();

  const initialNum = paramNumber || searchParams.get('number') || searchParams.get('invoice') || '';
  const initialAmount = searchParams.get('amount') || '';

  const [invoiceNumber, setInvoiceNumber] = useState(initialNum);
  const [amount, setAmount] = useState(initialAmount);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Result states
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    amountMismatch?: boolean;
    message?: string;
    error?: string;
    invoice?: InvoiceData;
    settings?: BillingSettingsData;
  } | null>(null);

  const [showFullInvoice, setShowFullInvoice] = useState(false);

  // Auto-verify on mount if invoice number is present in URL
  useEffect(() => {
    if (initialNum) {
      handleVerify(initialNum, initialAmount);
    }
  }, [initialNum, initialAmount]);

  const handleVerify = async (invNum?: string, amtVal?: string) => {
    const numToSearch = (invNum !== undefined ? invNum : invoiceNumber).trim();
    if (!numToSearch) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const result = await billingService.verifyInvoice(numToSearch, amtVal !== undefined ? amtVal : amount);
      setVerificationResult(result);
    } catch (err: any) {
      setVerificationResult({
        verified: false,
        error: err.message || 'Unable to connect to verification service.'
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  const invoice = verificationResult?.invoice;
  const settings = verificationResult?.settings;

  const companyName = settings?.company_name || 'GORILLA TECH SOLUTION';
  const licenseNo = settings?.license_no || 'UDYAM-TR-08-0000160';
  const currentDomain = typeof window !== 'undefined' && window.location.host
    ? window.location.host
    : (settings?.website ? settings.website.replace(/^https?:\/\//, '') : 'localhost:8080');
  const cleanWebsite = currentDomain;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-200/50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header / Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-900 text-white font-black px-4 py-1.5 rounded-lg shadow-sm">
            <span className="text-xl sm:text-2xl tracking-tight">GORILLATECH</span>
            <span className="text-xs tracking-widest text-blue-300 uppercase">SOLUTION</span>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            LICENSE NO: {licenseNo}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Official Invoice Verification
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Verify the authenticity, issued amounts, and real-time payment status of any invoice issued by Gorilla Tech Solution.
          </p>
        </div>

        {/* Search Card */}
        <Card className="p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-slate-200/80">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Invoice Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <Input
                  className="pl-10 font-mono text-sm h-11 bg-slate-50/50 uppercase"
                  placeholder="e.g. INV-202606-0004"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Total Amount (₹) <span className="text-slate-400 font-normal lowercase">(optional match check)</span>
              </label>
              <Input
                type="number"
                step="0.01"
                className="font-mono text-sm h-11 bg-slate-50/50"
                placeholder="e.g. 18264.04"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter the amount from your invoice to verify that no numbers were altered.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !invoiceNumber.trim()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 text-sm shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying with Official Records...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Invoice Authenticity</span>
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Verification Result Section */}
        {hasSearched && verificationResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* CASE 1: VERIFIED - VALID RECORD */}
            {verificationResult.verified && invoice && (
              <Card className="overflow-hidden border-2 border-emerald-400/80 bg-white shadow-xl rounded-2xl">
                {/* Verified Header Banner */}
                <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
                    <div>
                      <div className="text-base font-black tracking-wide uppercase">
                        Authentic Invoice Verified
                      </div>
                      <div className="text-xs text-emerald-100">
                        Official document issued by {companyName}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 font-semibold tracking-wider">
                    Official Record
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border">
                    <div>
                      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                        Payment Status
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        {invoice.status === 'paid' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ PAID IN FULL
                          </span>
                        ) : invoice.status === 'overdue' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            ⚠ PAYMENT OVERDUE
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            ⏳ PAYMENT PENDING
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                        Official Invoice Amount
                      </span>
                      <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                        ₹{Number(invoice.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Document Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 text-xs uppercase block">Invoice Number</span>
                      <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">
                        {invoice.invoice_number}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs uppercase block">Billed To</span>
                      <span className="font-bold text-slate-900 text-sm sm:text-base uppercase">
                        {invoice.customer_name}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs uppercase block">Issue Date</span>
                      <span className="font-medium text-slate-800">{invoice.issue_date}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs uppercase block">Due Date</span>
                      <span className="font-medium text-slate-800">{invoice.due_date}</span>
                    </div>
                  </div>

                  {/* If UNPAID / PENDING: Direct Payment Instructions & QR */}
                  {invoice.status !== 'paid' && (
                    <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/60 space-y-4">
                      <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                        <CreditCard className="w-4 h-4 text-amber-700" />
                        <span>Pay This Invoice Directly</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1 text-slate-700">
                          <div>
                            <span className="text-slate-500">Bank: </span>
                            <span className="font-bold">{settings?.bank_name || 'RBL'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Account: </span>
                            <span className="font-bold">{settings?.account_name || 'prasenjit kar malakar'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">A/C No: </span>
                            <span className="font-mono font-bold text-slate-900">{settings?.account_number || '309028561095'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">IFSC: </span>
                            <span className="font-mono font-bold text-blue-700">{settings?.ifsc_code || 'RATN0000458'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">UPI ID: </span>
                            <span className="font-mono font-bold text-slate-900">{settings?.upi_id || '9233311931@ybl'}</span>
                          </div>
                        </div>

                        {/* UPI QR */}
                        <div className="flex items-center justify-center sm:justify-end space-x-3">
                          <div className="bg-white p-2 rounded-lg border shadow-sm">
                            <QRCodeSVG
                              value={`upi://pay?pa=${settings?.upi_id || '9233311931@ybl'}&pn=${encodeURIComponent(companyName)}&am=${invoice.total_amount}&cu=INR`}
                              size={80}
                            />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-slate-900">SCAN TO PAY</div>
                            <div className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t">
                    <Button
                      onClick={() => setShowFullInvoice(true)}
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>View Official Printable Copy</span>
                    </Button>

                    <div className="text-[11px] text-slate-400">
                      Official Verification Hash: #{invoice.invoice_number}-OK
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* CASE 2: AMOUNT MISMATCH */}
            {!verificationResult.verified && verificationResult.amountMismatch && (
              <Card className="p-6 bg-amber-50/90 border-2 border-amber-400 rounded-2xl shadow-md text-amber-950 space-y-3">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-base text-amber-900">Warning: Amount Mismatch Detected</h3>
                    <p className="text-xs text-amber-800 mt-1">
                      {verificationResult.message}
                    </p>
                  </div>
                </div>
                {verificationResult.invoice && (
                  <div className="pt-3 border-t border-amber-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="text-amber-800">Billed to: </span>
                      <span className="font-bold">{verificationResult.invoice.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-amber-800">Status: </span>
                      <span className="font-bold uppercase">{verificationResult.invoice.status}</span>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* CASE 3: NOT FOUND / INVALID */}
            {!verificationResult.verified && !verificationResult.amountMismatch && (
              <Card className="p-6 bg-rose-50 border-2 border-rose-300 rounded-2xl shadow-md text-rose-950 space-y-3">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-base text-rose-900">Invalid Invoice / Not Found</h3>
                    <p className="text-xs text-rose-800 mt-1">
                      {verificationResult.error || 'No official invoice matching this number was found in our system. Please check the invoice number or contact our billing desk.'}
                    </p>
                  </div>
                </div>
                <div className="text-[11px] text-rose-700 pt-2 border-t border-rose-200 flex items-center justify-between">
                  <span>Questions? Contact billing support:</span>
                  <a href="mailto:business@gorillatechsolution.com" className="font-semibold underline">
                    business@gorillatechsolution.com
                  </a>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-6 space-y-1">
          <div>© {new Date().getFullYear()} {companyName}. All Rights Reserved.</div>
          <div>
            Need help? Visit{' '}
            <a href="/" className="text-blue-600 hover:underline">
              {cleanWebsite}
            </a>
          </div>
        </div>
      </div>

      {/* Full Official Invoice View Modal */}
      {showFullInvoice && invoice && (
        <Suspense fallback={null}>
          <InvoicePrintView
            invoice={invoice}
            settings={settings}
            onClose={() => setShowFullInvoice(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default VerifyInvoice;
