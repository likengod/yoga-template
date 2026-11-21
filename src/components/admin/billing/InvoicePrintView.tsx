import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  X,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Building2,
  Copy,
  Check,
  Globe,
  MessageCircle,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvoiceData, InvoiceItem, BillingSettingsData } from '@/services/billingService';
import { useToast } from '@/hooks/use-toast';

interface InvoicePrintViewProps {
  invoice: InvoiceData;
  settings?: BillingSettingsData | null;
  onClose: () => void;
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ invoice, settings, onClose }) => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  let items: InvoiceItem[] = [];
  try {
    items = typeof invoice.items_json === 'string' ? JSON.parse(invoice.items_json) : (invoice.items_json || []);
  } catch {
    items = [];
  }

  // Fallbacks from settings or defaults
  const companyName = settings?.company_name || 'GORILLA TECH SOLUTION';
  const companyEmail = settings?.company_email || 'business@gorillatechsolution.com';
  const companyPhone = settings?.company_phone || '+91 92 333 11931';
  const licenseNo = settings?.license_no || 'UDYAM-TR-08-0000160';
  const taxIdType = (settings?.tax_id_type || 'PAN').toUpperCase();
  const taxIdValue = settings?.pan || 'DCKPK2142C';
  const companyAddress = settings?.address || 'AGARTALA TRIPURA(W)';
  const companyZip = settings?.zip_code || '799006';
  const companyState = settings?.state || 'TRIPURA';
  const companyCountry = settings?.country || 'INDIA';
  const bankName = settings?.bank_name || 'RBL';
  const accountName = settings?.account_name || 'prasenjit kar malakar';
  const accountNumber = settings?.account_number || '309028561095';
  const ifscCode = settings?.ifsc_code || 'RATN0000458';
  const upiId = settings?.upi_id || '9233311931@ybl';
  // Dynamically resolve domain from current browser host (e.g. localhost:8080 during dev)
  // or fall back to company website setting
  const currentDomain = typeof window !== 'undefined' && window.location.host
    ? window.location.host
    : (settings?.website ? settings.website.replace(/^https?:\/\//, '') : 'localhost:8080');

  const currentOrigin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : `http://${currentDomain}`;

  const cleanWebsite = currentDomain;
  const verificationUrl = `${currentOrigin}/verify-invoice?number=${encodeURIComponent(invoice.invoice_number)}`;
  const displayVerificationUrl = `${currentDomain}/verify-invoice`;

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    paid: { bg: 'bg-emerald-100 text-emerald-800', text: 'text-emerald-600', label: 'PAID' },
    pending: { bg: 'bg-amber-100 text-amber-800', text: 'text-amber-600', label: 'PENDING' },
    overdue: { bg: 'bg-rose-100 text-rose-800', text: 'text-rose-600', label: 'OVERDUE' },
    cancelled: { bg: 'bg-slate-100 text-slate-800', text: 'text-slate-600', label: 'CANCELLED' }
  };

  const currentStatus = statusColors[invoice.status] || statusColors.pending;

  // Format dates
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Build message for WhatsApp and Email sharing
  const invoiceShareMessage = `*INVOICE: ${invoice.invoice_number}*
From: ${companyName}
Bill To: ${invoice.customer_name}
Total Amount: Rs. ${Number(invoice.total_amount).toFixed(2)}
Issue Date: ${formatDate(invoice.issue_date)}
Due Date: ${formatDate(invoice.due_date)}
Status: ${invoice.status.toUpperCase()}

*PAYMENT DETAILS:*
Bank: ${bankName}
A/C Name: ${accountName}
A/C Number: ${accountNumber}
IFSC Code: ${ifscCode}
UPI ID: ${upiId}

Verify invoice online at:
${verificationUrl}`;

  // WhatsApp Share Handler
  const handleWhatsAppShare = () => {
    let phoneNum = (invoice.customer_phone || '').replace(/[^0-9]/g, '');
    if (phoneNum && phoneNum.length === 10) {
      phoneNum = `91${phoneNum}`;
    }
    const url = phoneNum
      ? `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(invoiceShareMessage)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(invoiceShareMessage)}`;
    window.open(url, '_blank');
  };

  // Email Share Handler
  const handleEmailShare = () => {
    const subject = `Invoice ${invoice.invoice_number} from ${companyName}`;
    const mailtoUrl = `mailto:${invoice.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(invoiceShareMessage)}`;
    window.location.href = mailtoUrl;
  };

  // Copy Summary Handler
  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(invoiceShareMessage);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: `Invoice ${invoice.invoice_number} details copied.`
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <>
      {/* Strict Single A4 Page Print CSS */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 6mm 10mm;
        }
        @media print {
          html, body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #ffffff !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-modal,
          #printable-invoice-modal * {
            visibility: visible !important;
          }
          #printable-invoice-modal {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-height: 285mm !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 99999999 !important;
            overflow: hidden !important;
          }
          #printable-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 2mm 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-height: 280mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-compact-table th,
          .print-compact-table td {
            padding-top: 3px !important;
            padding-bottom: 3px !important;
          }
          .print-hide {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="printable-invoice-modal"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:rounded-none">
          {/* Top Control Bar (Hidden on print) */}
          <div className="print-hide flex flex-wrap items-center justify-between px-6 py-3.5 border-b bg-slate-50 gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-800">Invoice Preview</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-blue-100 text-blue-700 font-semibold">
                {invoice.invoice_number}
              </span>
            </div>

            {/* Action Buttons: WhatsApp, Email, Copy, Print, Close */}
            <div className="flex items-center flex-wrap gap-2">
              {/* WhatsApp Button */}
              <Button
                onClick={handleWhatsAppShare}
                size="sm"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 h-8 px-3"
                title="Share via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </Button>

              {/* Email Button */}
              <Button
                onClick={handleEmailShare}
                size="sm"
                variant="outline"
                className="text-xs text-slate-700 hover:text-slate-900 border-slate-300 h-8 px-3 flex items-center gap-1.5"
                title="Share via Email"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Email</span>
              </Button>

              {/* Copy Details */}
              <Button
                onClick={handleCopySummary}
                size="sm"
                variant="outline"
                className="text-xs text-slate-700 hover:text-slate-900 border-slate-300 h-8 px-2.5 flex items-center gap-1"
                title="Copy Details"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>

              {/* Print 1-Page A4 Button */}
              <Button
                onClick={handlePrint}
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 h-8 px-3.5"
                title="Print single A4 page"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Single A4</span>
              </Button>

              {/* Close Button */}
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Printable Invoice Sheet (Matches Screenshot 1 & fits on 1 A4 page) */}
          <div
            id="printable-sheet"
            ref={printRef}
            className="p-8 sm:p-10 overflow-y-auto bg-white text-slate-900 print:p-2 print:m-0 print:overflow-visible"
          >
            {/* Top Brand & Title Bar */}
            <div className="flex items-start justify-between pb-3 print:pb-2 border-b border-slate-900/15">
              <div>
                {settings?.logo_url ? (
                  <img loading="lazy" src={settings.logo_url} alt={companyName} className="h-11 w-auto object-contain mb-1" />
                ) : (
                  <div className="flex items-center space-x-2 border-2 border-blue-900 text-blue-950 font-black px-3 py-1 tracking-tight rounded inline-block">
                    <span className="text-xl sm:text-2xl font-black">GORILLATECH</span>
                    <span className="text-xs tracking-widest text-blue-600 font-bold uppercase self-end mb-0.5">SOLUTION</span>
                  </div>
                )}
                <div className="text-[10px] tracking-wider text-slate-500 font-semibold uppercase mt-1">
                  LICENSE NO: {licenseNo}
                </div>
              </div>

              <div className="text-right">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">INVOICE</h1>
                <div className="text-sm font-semibold text-slate-700 mt-0.5 font-mono">
                  NO: {invoice.invoice_number}
                </div>
              </div>
            </div>

            {/* FROM vs BILL TO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:gap-4 my-4 print:my-2 text-xs sm:text-sm">
              {/* From */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">FROM</div>
                <div className="font-bold text-slate-900 text-sm sm:text-base">{companyName}</div>
                <div className="mt-1.5 space-y-0.5 text-slate-600 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{companyAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{companyZip}, {companyState}, {companyCountry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{companyEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{companyPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-medium text-slate-700">{cleanWebsite}</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-slate-800 pt-0.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{taxIdType}: {taxIdValue}</span>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="text-left sm:text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">BILL TO</div>
                {invoice.customer_company ? (
                  <>
                    <div className="font-bold text-slate-900 text-sm sm:text-base uppercase tracking-tight">{invoice.customer_company}</div>
                    {invoice.customer_name && (
                      <div className="text-xs font-semibold text-slate-700 mt-0.5">{invoice.customer_name}</div>
                    )}
                  </>
                ) : (
                  <div className="font-bold text-slate-900 text-sm sm:text-base uppercase tracking-tight">{invoice.customer_name}</div>
                )}
                <div className="mt-1.5 space-y-0.5 text-slate-600 text-xs sm:flex sm:flex-col sm:items-end">
                  {invoice.customer_address && (
                    <div className="flex items-center gap-2">
                      <span>{invoice.customer_address}</span>
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    </div>
                  )}
                  {(invoice.customer_city || invoice.customer_state || invoice.customer_zip) && (
                    <div className="flex items-center gap-2">
                      <span>
                        {[
                          invoice.customer_city,
                          invoice.customer_state,
                          invoice.customer_zip
                        ].filter(Boolean).join(', ')}
                      </span>
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    </div>
                  )}
                  {invoice.customer_country && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{invoice.customer_country}</span>
                      <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    </div>
                  )}
                  {invoice.customer_email && (
                    <div className="flex items-center gap-2">
                      <span>{invoice.customer_email}</span>
                      <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    </div>
                  )}
                  {invoice.customer_phone && (
                    <div className="flex items-center gap-2">
                      <span>{invoice.customer_phone}</span>
                      <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Bar (Issue Date, Due Date, Status) */}
            <div className="grid grid-cols-3 border-y border-slate-900/15 py-2 my-4 print:my-2 bg-slate-50/50 text-center">
              <div className="border-r border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ISSUE DATE</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">{formatDate(invoice.issue_date)}</div>
              </div>
              <div className="border-r border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DUE DATE</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">{formatDate(invoice.due_date)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">STATUS</div>
                <div className={`text-xs sm:text-sm font-black uppercase mt-0.5 ${currentStatus.text}`}>
                  {currentStatus.label}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="my-4 print:my-2">
              <table className="w-full text-xs print-compact-table">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-1.5 text-left font-semibold">DESCRIPTION</th>
                    <th className="py-1.5 text-center font-semibold w-14">QTY</th>
                    <th className="py-1.5 text-right font-semibold w-24">PRICE</th>
                    <th className="py-1.5 text-right font-semibold w-16">TAX</th>
                    <th className="py-1.5 text-right font-semibold w-24">AMT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-1.5 text-left font-medium text-slate-800">{item.description}</td>
                      <td className="py-1.5 text-center text-slate-600 font-mono">{item.qty}</td>
                      <td className="py-1.5 text-right text-slate-700 font-mono">Rs {Number(item.price).toFixed(2)}</td>
                      <td className="py-1.5 text-right text-blue-600 font-mono">{item.tax || 18}%</td>
                      <td className="py-1.5 text-right font-semibold text-slate-900 font-mono">
                        Rs {Number(item.amount || item.qty * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculations Breakdown */}
              <div className="border-t border-slate-900/10 pt-2 mt-1.5 flex flex-col items-end space-y-1 text-xs">
                <div className="flex justify-between w-60 text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">Rs {Number(invoice.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-60 text-slate-600">
                  <span>Tax Amount:</span>
                  <span className="font-mono font-medium">Rs {Number(invoice.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-60 pt-1.5 border-t border-slate-900 font-black text-slate-900 text-sm">
                  <span>TOTAL:</span>
                  <span className="font-mono">Rs {Number(invoice.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Details & Signatory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:gap-3 pt-4 print:pt-2 mt-4 print:mt-2 border-t border-slate-900/15">
              {/* Payment Details */}
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-extrabold text-slate-900 uppercase tracking-wider mb-1 underline decoration-slate-300">
                    PAYMENT DETAILS
                  </div>
                  <div className="grid grid-cols-3 gap-y-0.5 text-xs">
                    <span className="text-slate-500">Bank:</span>
                    <span className="col-span-2 font-bold text-slate-800">{bankName}</span>

                    <span className="text-slate-500">A/C:</span>
                    <span className="col-span-2 font-bold text-slate-800">{accountName}</span>

                    <span className="text-slate-500">No:</span>
                    <span className="col-span-2 font-bold text-slate-900 font-mono">{accountNumber}</span>

                    <span className="text-slate-500">IFSC:</span>
                    <span className="col-span-2 font-bold text-blue-700 font-mono">{ifscCode}</span>

                    <span className="text-slate-500">UPI:</span>
                    <span className="col-span-2 font-bold text-slate-900 font-mono">{upiId}</span>
                  </div>
                </div>

                {/* QR Code Scan To Pay Box */}
                <div className="flex items-center space-x-3 p-1.5 bg-slate-50 border border-slate-200 rounded-lg max-w-xs">
                  <div className="bg-white p-1 rounded border border-slate-100 shadow-sm shrink-0">
                    {settings?.qr_code_url ? (
                      <img loading="lazy" src={settings.qr_code_url} alt="Scan to pay" className="w-14 h-14 object-contain" />
                    ) : (
                      <QRCodeSVG
                        value={`upi://pay?pa=${upiId}&pn=${encodeURIComponent(companyName)}&am=${invoice.total_amount}&cu=INR`}
                        size={56}
                      />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 tracking-wider">SCAN TO PAY</div>
                    <div className="text-[9px] text-slate-500">Use any UPI app to pay directly</div>
                  </div>
                </div>
              </div>

              {/* Authorized Signatory */}
              <div className="flex flex-col items-start sm:items-end justify-end">
                <div className="text-center sm:text-right">
                  {settings?.signature_url ? (
                    <img loading="lazy" src={settings.signature_url} alt="Authorized Signature" className="h-12 object-contain mb-1 ml-auto" />
                  ) : (
                    <div className="mb-1 italic text-slate-700 font-serif text-xs">
                      <span className="font-semibold text-[10px] uppercase block text-slate-400 not-italic">{companyName}</span>
                      <span className="text-blue-900 font-bold">Authorized Signatory</span>
                    </div>
                  )}
                  <div className="border-t-2 border-slate-900 pt-1 text-[10px] font-black uppercase tracking-wider text-slate-900">
                    AUTHORIZED SIGNATORY
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Barcode & Notes */}
            <div className="mt-4 print:mt-2 pt-2 border-t border-slate-200 text-center">
              <p className="text-[11px] font-medium text-slate-600">
                Thank you for your business! Payment due within 30 days.
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                User can verify invoice visit{' '}
                <a
                  href={`/verify-invoice?number=${encodeURIComponent(invoice.invoice_number)}`}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  {displayVerificationUrl}
                </a>
              </p>

              {/* Barcode Graphic */}
              <div className="mt-2 flex flex-col items-center">
                <div className="flex items-center justify-center space-x-0.5 h-6">
                  {/* Visual Barcode Bars */}
                  {Array.from({ length: 42 }).map((_, i) => {
                    const widths = [1, 2, 3, 1, 4, 2, 1, 3, 2];
                    const w = widths[i % widths.length];
                    return (
                      <div
                        key={i}
                        style={{ width: `${w * 1.5}px` }}
                        className={`h-5 ${i % 7 === 0 ? 'bg-transparent w-1' : 'bg-slate-900'}`}
                      />
                    );
                  })}
                </div>
                <span className="text-[11px] font-mono tracking-widest text-slate-800 font-bold mt-0.5">
                  {invoice.invoice_number}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicePrintView;
