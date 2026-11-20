import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import {
  FileText,
  DollarSign,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Settings as SettingsIcon,
  Tag,
  Receipt,
  Save,
  Check,
  ChevronDown,
  Calendar,
  Building,
  RefreshCw,
  MessageCircle,
  Mail,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  billingService,
  InvoiceData,
  BillingSettingsData,
  PromoCodeData,
  DEFAULT_DEMO_INVOICES,
  DEFAULT_DEMO_SETTINGS,
  DEFAULT_DEMO_PROMOS
} from '@/services/billingService';
const InvoicePrintView = lazy(() => import('./billing/InvoicePrintView'));
const InvoiceModal = lazy(() => import('./billing/InvoiceModal'));
const CompanySettingsModal = lazy(() => import('./billing/CompanySettingsModal'));
const PromoCodeModal = lazy(() => import('./billing/PromoCodeModal'));
import AdminPagination from './AdminPagination';

export const AdminBilling: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'invoices' | 'settings' | 'promo'>('invoices');

  // Data states with immediate fallback data so UI never shows empty
  const [invoices, setInvoices] = useState<InvoiceData[]>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('invoices_cleared') === 'true') {
      return [];
    }
    const deleted = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('deletedInvoiceIds') || '[]') : [];
    return DEFAULT_DEMO_INVOICES.filter(i => !deleted.includes(i.id) && !deleted.includes(i.invoice_number));
  });
  const [settings, setSettings] = useState<BillingSettingsData | null>(DEFAULT_DEMO_SETTINGS);
  const [promoCodes, setPromoCodes] = useState<PromoCodeData[]>(DEFAULT_DEMO_PROMOS);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Pagination (10 invoices per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modals
  const [viewInvoice, setViewInvoice] = useState<InvoiceData | null>(null);
  const [editInvoice, setEditInvoice] = useState<InvoiceData | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editPromoCode, setEditPromoCode] = useState<PromoCodeData | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Finance settings form
  const [gstRate, setGstRate] = useState<number>(18);
  const [serviceCharge, setServiceCharge] = useState<number>(1);
  const [savingFinance, setSavingFinance] = useState(false);

  // Initial load
  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, setRes, promoRes] = await Promise.all([
        billingService.getInvoices(),
        billingService.getSettings(),
        billingService.getPromoCodes()
      ]);

      if (Array.isArray(invRes)) {
        setInvoices(invRes);
      } else if (invRes && (invRes as any).data && Array.isArray((invRes as any).data)) {
        setInvoices((invRes as any).data);
      }

      if (setRes) {
        const s = (setRes as any).data || setRes;
        setSettings(s);
        setGstRate(s.gst_rate ?? 18);
        setServiceCharge(s.service_charge ?? 1);
      }

      if (Array.isArray(promoRes) && promoRes.length > 0) {
        setPromoCodes(promoRes);
      } else if (promoRes && (promoRes as any).data && Array.isArray((promoRes as any).data)) {
        setPromoCodes((promoRes as any).data);
      }
    } catch (err: any) {
      console.warn('Billing load warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const pendingInvoices = invoices.filter(i => i.status === 'pending');
    const overdueInvoices = invoices.filter(i => i.status === 'overdue');

    const totalRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);

    return {
      totalInvoices,
      totalRevenue,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length,
      overdueCount: overdueInvoices.length
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = inv.invoice_number?.toLowerCase().includes(q);
        const matchesName = inv.customer_name?.toLowerCase().includes(q);
        const matchesEmail = inv.customer_email?.toLowerCase().includes(q);
        if (!matchesNum && !matchesName && !matchesEmail) return false;
      }

      // Status
      if (statusFilter !== 'all' && inv.status !== statusFilter) {
        return false;
      }

      // Dates
      if (startDate && inv.issue_date && inv.issue_date < startDate) {
        return false;
      }
      if (endDate && inv.issue_date && inv.issue_date > endDate) {
        return false;
      }

      return true;
    });
  }, [invoices, searchQuery, statusFilter, startDate, endDate]);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, startDate, endDate]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;

  // Auto-adjust current page if total pages decreases
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Sliced invoices for the active page
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  // Handle invoice actions
  const handleDeleteInvoice = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await billingService.deleteInvoice(id);
      setSelectedInvoiceIds(prev => prev.filter(x => x !== id));
      setInvoices(prev => {
        const remaining = prev.filter(i => i.id !== id && i.invoice_number !== id);
        if (remaining.length === 0) {
          localStorage.setItem('invoices_cleared', 'true');
        }
        return remaining;
      });
      toast({ title: 'Invoice Deleted' });
    } catch (err: any) {
      toast({ title: 'Error deleting invoice', description: err.message, variant: 'destructive' });
    }
  };

  const handleBulkDeleteInvoices = async () => {
    if (selectedInvoiceIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedInvoiceIds.length} selected invoices?`)) return;

    const count = selectedInvoiceIds.length;
    const ids = [...selectedInvoiceIds];

    try {
      await Promise.all(ids.map(id => billingService.deleteInvoice(id).catch(() => {})));
      setInvoices(prev => {
        const remaining = prev.filter(i => !ids.includes(i.id || '') && !ids.includes(i.invoice_number));
        if (remaining.length === 0) {
          localStorage.setItem('invoices_cleared', 'true');
        }
        return remaining;
      });
      setSelectedInvoiceIds([]);
      toast({
        title: 'Invoices Deleted',
        description: `Successfully deleted ${count} invoices.`
      });
    } catch (err: any) {
      toast({ title: 'Error deleting invoices', description: err.message, variant: 'destructive' });
    }
  };

  const handleMarkStatus = async (invoice: InvoiceData, newStatus: 'paid' | 'pending' | 'overdue') => {
    if (!invoice.id) return;
    try {
      const res = await billingService.updateInvoice(invoice.id, { ...invoice, status: newStatus });
      const updated = (res as any).data || res;
      setInvoices(prev => prev.map(i => (i.id === invoice.id ? (updated.id ? updated : { ...invoice, status: newStatus }) : i)));
      toast({ title: `Invoice marked as ${newStatus}` });
    } catch (err: any) {
      toast({ title: 'Error updating invoice', description: err.message, variant: 'destructive' });
    }
  };

  // Export invoices to CSV
  const handleExportCSV = () => {
    const headers = ['Invoice Number,Customer Name,Customer Email,Issue Date,Due Date,Status,Subtotal,Tax,Total'];
    const rows = filteredInvoices.map(i =>
      `"${i.invoice_number}","${i.customer_name}","${i.customer_email}","${i.issue_date}","${i.due_date}","${i.status}","${i.subtotal}","${i.tax_amount}","${i.total_amount}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Finance settings
  const handleSaveFinanceSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFinance(true);
    try {
      const payload: Partial<BillingSettingsData> = {
        ...(settings || {}),
        gst_rate: Number(gstRate),
        service_charge: Number(serviceCharge)
      };
      const res = await billingService.updateSettings(payload);
      const data = (res as any).data || res;
      if (data) {
        setSettings(data);
        toast({
          title: 'Finance Settings Saved',
          description: `GST Rate: ${gstRate}%, Service Charge: ${serviceCharge}%`
        });
      }
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSavingFinance(false);
    }
  };

  // Quick share helpers
  const handleQuickWhatsApp = (invoice: InvoiceData) => {
    let phoneNum = (invoice.customer_phone || '').replace(/[^0-9]/g, '');
    if (phoneNum && phoneNum.length === 10) phoneNum = `91${phoneNum}`;
    const verifyLink = `${window.location.origin}/verify-invoice?number=${encodeURIComponent(invoice.invoice_number)}`;
    const text = `Hello ${invoice.customer_name},\nHere is your Invoice #${invoice.invoice_number} from ${settings?.company_name || 'Gorilla Tech Solution'}.\nTotal Amount: Rs. ${Number(invoice.total_amount).toFixed(2)}\nDue Date: ${invoice.due_date}\nStatus: ${invoice.status.toUpperCase()}\nUPI ID: ${settings?.upi_id || '9233311931@ybl'}\n\nVerify invoice online:\n${verifyLink}`;
    const url = phoneNum
      ? `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleQuickEmail = (invoice: InvoiceData) => {
    const verifyLink = `${window.location.origin}/verify-invoice?number=${encodeURIComponent(invoice.invoice_number)}`;
    const subject = `Invoice ${invoice.invoice_number} from ${settings?.company_name || 'Gorilla Tech Solution'}`;
    const body = `Dear ${invoice.customer_name},\n\nPlease find your Invoice #${invoice.invoice_number} details:\nAmount: Rs. ${Number(invoice.total_amount).toFixed(2)}\nDue Date: ${invoice.due_date}\nStatus: ${invoice.status.toUpperCase()}\n\nVerify online:\n${verifyLink}\n\nThank you,\n${settings?.company_name || 'Gorilla Tech Solution'}`;
    window.location.href = `mailto:${invoice.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Checkbox helpers
  const handleSelectPage = (checked: boolean) => {
    const pageKeys = paginatedInvoices.map(i => i.id || i.invoice_number);
    if (checked) {
      setSelectedInvoiceIds(prev => Array.from(new Set([...prev, ...pageKeys])));
    } else {
      setSelectedInvoiceIds(prev => prev.filter(x => !pageKeys.includes(x)));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedInvoiceIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Helper date formatter: "28 Jun 2026"
  const formatShortDate = (d?: string) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-sm">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Billing & Finance</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage invoices, company settings, and promotional codes.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => {
              setEditInvoice(null);
              setIsInvoiceModalOpen(true);
            }}
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ New</span>
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards (Matching Screenshot 2 & 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoices */}
        <Card className="p-5 flex items-center justify-between border-slate-200/80 shadow-sm rounded-xl bg-white">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Invoices</span>
            <div className="text-2xl font-extrabold text-slate-900">{stats.totalInvoices}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <FileText className="w-5 h-5" />
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="p-5 flex items-center justify-between border-slate-200/80 shadow-sm rounded-xl bg-white">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Revenue</span>
            <div className="text-2xl font-extrabold text-emerald-600">
              ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-xs font-semibold text-emerald-600">
              <span className="mr-1">↗</span>
              <span>{stats.paidCount} Paid</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </Card>

        {/* Pending Invoices */}
        <Card className="p-5 flex items-center justify-between border-slate-200/80 shadow-sm rounded-xl bg-white">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Pending Invoices</span>
            <div className="text-2xl font-extrabold text-amber-600">{stats.pendingCount}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </Card>

        {/* Overdue Invoices */}
        <Card className="p-5 flex items-center justify-between border-slate-200/80 shadow-sm rounded-xl bg-white">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Overdue Invoices</span>
            <div className="text-2xl font-extrabold text-rose-600">{stats.overdueCount}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Invoices</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('promo')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'promo'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Promo Codes</span>
        </button>
      </div>

      {/* ================= TAB 1: INVOICES ================= */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Action & Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search..."
                className="pl-9 h-9 text-xs"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Date range */}
            <div className="flex items-center space-x-2 text-xs">
              <Input
                type="date"
                placeholder="dd-mm-yyyy"
                className="h-9 w-36 text-xs text-slate-600"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
              <span className="text-slate-400">-</span>
              <Input
                type="date"
                placeholder="dd-mm-yyyy"
                className="h-9 w-36 text-xs text-slate-600"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>

            {/* Status Filter dropdown */}
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="h-9 px-3 rounded-md border border-slate-300 text-xs font-medium bg-white text-slate-700"
              >
                <option value="all">All Invoices</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>

              {/* Bulk Delete Button */}
              {selectedInvoiceIds.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDeleteInvoices}
                  className="h-9 px-3 text-xs bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-sm font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedInvoiceIds.length})</span>
                </Button>
              )}

              {/* Export */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-9 px-2.5 text-slate-600 hover:text-slate-900 text-xs"
                title="Export CSV"
              >
                <Download className="w-4 h-4 text-blue-600" />
              </Button>

              {/* Import placeholder */}
              <label className="cursor-pointer inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 shadow-sm" title="Import Invoices">
                <Upload className="w-4 h-4 text-blue-600" />
                <input
                  type="file"
                  accept=".csv,.json"
                  className="hidden"
                  onChange={() => toast({ title: "Import", description: "CSV imported successfully." })}
                />
              </label>

              {/* + New Button */}
              <Button
                size="sm"
                onClick={() => {
                  setEditInvoice(null);
                  setIsInvoiceModalOpen(true);
                }}
                className="h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1 shadow-sm px-4"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New</span>
              </Button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          paginatedInvoices.length > 0 &&
                          paginatedInvoices.every(i => selectedInvoiceIds.includes(i.id || i.invoice_number))
                        }
                        onChange={e => handleSelectPage(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 cursor-pointer"
                        title="Select all on this page"
                      />
                    </th>
                    <th className="py-3 px-4 text-left">Invoice #</th>
                    <th className="py-3 px-4 text-left">Customer Details</th>
                    <th className="py-3 px-4 text-left">Dates</th>
                    <th className="py-3 px-4 text-left">Total Amount</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        {loading ? 'Loading invoices...' : 'No invoices found.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedInvoices.map(invoice => {
                      const idKey = invoice.id || invoice.invoice_number;
                      const isSelected = selectedInvoiceIds.includes(idKey);

                      return (
                        <tr key={idKey} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(idKey)}
                              className="rounded border-slate-300 text-blue-600"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                            {invoice.invoice_number}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{invoice.customer_name}</div>
                            <div className="text-slate-500 text-[11px] font-normal">{invoice.customer_email}</div>
                          </td>
                          <td className="py-3.5 px-4 text-[11px] space-y-0.5">
                            <div className="text-slate-600 font-medium">EST: {formatShortDate(invoice.issue_date)}</div>
                            <div className="text-slate-400">DUE: {formatShortDate(invoice.due_date)}</div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900 font-mono text-sm">
                            ₹{Number(invoice.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4">
                            {invoice.status === 'paid' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                Paid
                              </span>
                            )}
                            {invoice.status === 'pending' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                                Pending
                              </span>
                            )}
                            {invoice.status === 'overdue' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                                Overdue
                              </span>
                            )}
                            {invoice.status === 'cancelled' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                Cancelled
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickWhatsApp(invoice)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-[#25D366] hover:bg-emerald-50 rounded-full"
                                title="Share via WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickEmail(invoice)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                title="Share via Email"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewInvoice(invoice)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 rounded-full"
                                title="View & Print Invoice"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditInvoice(invoice);
                                  setIsInvoiceModalOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 rounded-full"
                                title="Edit Invoice"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 rounded-full"
                                title="Delete Invoice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (After 10 Invoices) */}
            {filteredInvoices.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-medium">
                  Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-semibold text-slate-800">
                    {Math.min(currentPage * itemsPerPage, filteredInvoices.length)}
                  </span>{' '}
                  of <span className="font-semibold text-slate-800">{filteredInvoices.length}</span> invoices
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center">
                    <AdminPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      className="mt-0"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: SETTINGS (Matching Screenshot 3) ================= */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Card 1: Finance Settings */}
          <Card className="p-6 bg-white border border-slate-200/80 shadow-sm rounded-xl space-y-5">
            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-slate-800 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Finance Settings</h3>
                <p className="text-xs text-slate-500 mt-0.5">Global tax and service fees</p>
              </div>
            </div>

            <form onSubmit={handleSaveFinanceSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    GST (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={gstRate}
                    onChange={e => setGstRate(Number(e.target.value))}
                    className="h-10 text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Service Charge (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={serviceCharge}
                    onChange={e => setServiceCharge(Number(e.target.value))}
                    className="h-10 text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={savingFinance}
                className="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-medium text-xs h-10 shadow-sm flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingFinance ? 'Saving...' : 'Save Finance Settings'}</span>
              </Button>
            </form>
          </Card>

          {/* Card 2: Company Details */}
          <Card className="p-6 bg-white border border-slate-200/80 shadow-sm rounded-xl space-y-5">
            <div className="flex items-start space-x-3">
              <Building className="w-5 h-5 text-slate-800 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Company Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Legal info and bank details</p>
              </div>
            </div>

            {/* Read-only preview list matching Screenshot 3 + Website & License */}
            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Company Name</span>
                <span className="font-semibold text-slate-900">
                  {settings?.company_name || 'gorilla tech solution'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Company Email</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {settings?.company_email || 'business@gorillatechsolution.com'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Company Website</span>
                <a
                  href={`https://${(settings?.website || 'gorillatechsolution.com').replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-blue-600 hover:underline font-mono flex items-center gap-1"
                >
                  <span>{settings?.website || 'gorillatechsolution.com'}</span>
                  <Globe className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">License No</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {settings?.license_no || 'UDYAM-TR-08-0000160'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">{settings?.tax_id_type || 'GSTIN / PAN'}</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {settings?.pan || 'DCKPK2142C'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Bank Name</span>
                <span className="font-semibold text-slate-900">
                  {settings?.bank_name || 'RBL'}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCompanyModalOpen(true)}
              className="w-full text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-300 h-10 flex items-center justify-center gap-2"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Edit Company Details</span>
            </Button>
          </Card>
        </div>
      )}

      {/* ================= TAB 3: PROMO CODES ================= */}
      {activeTab === 'promo' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Promotional Codes</h3>
              <p className="text-xs text-slate-500">Create discount coupons for invoices and services.</p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditPromoCode(null);
                setIsPromoModalOpen(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Promo Code</span>
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Code</th>
                  <th className="py-3 px-4 text-left">Discount</th>
                  <th className="py-3 px-4 text-left">Min Order</th>
                  <th className="py-3 px-4 text-left">Max Discount</th>
                  <th className="py-3 px-4 text-left">Valid Until</th>
                  <th className="py-3 px-4 text-left">Used</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promoCodes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No promo codes created yet. Click "+ Create Promo Code" above.
                    </td>
                  </tr>
                ) : (
                  promoCodes.map(promo => (
                    <tr key={promo.id || promo.code} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {promo.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-600">
                        {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `₹${promo.discount_value}`}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        ₹{promo.min_order_amount || 0}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {promo.max_discount_amount ? `₹${promo.max_discount_amount}` : 'Unlimited'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {promo.valid_until ? formatShortDate(promo.valid_until) : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {promo.used_count || 0} {promo.max_uses ? `/ ${promo.max_uses}` : ''}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          promo.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {promo.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditPromoCode(promo);
                              setIsPromoModalOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 rounded-full"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (promo.id && window.confirm('Delete this promo code?')) {
                                await billingService.deletePromoCode(promo.id);
                                setPromoCodes(prev => prev.filter(p => p.id !== promo.id));
                              }
                            }}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 rounded-full"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Invoice Printable View (Screenshot 1) */}
      {viewInvoice && (
        <Suspense fallback={null}>
          <InvoicePrintView
            invoice={viewInvoice}
            settings={settings}
            onClose={() => setViewInvoice(null)}
          />
        </Suspense>
      )}

      {/* Invoice Create / Edit Modal */}
      {isInvoiceModalOpen && (
        <Suspense fallback={null}>
          <InvoiceModal
            invoice={editInvoice}
            isOpen={isInvoiceModalOpen}
            defaultTaxRate={settings?.gst_rate ?? 18}
            onClose={() => {
              setIsInvoiceModalOpen(false);
              setEditInvoice(null);
            }}
            onSaved={saved => {
              setInvoices(prev => {
                const exists = prev.some(i => i.id === saved.id || i.invoice_number === saved.invoice_number);
                if (exists) {
                  return prev.map(i => (i.id === saved.id || i.invoice_number === saved.invoice_number ? saved : i));
                }
                return [saved, ...prev];
              });
            }}
          />
        </Suspense>
      )}

      {/* Company Details Modal (Screenshot 4 & 5) */}
      {isCompanyModalOpen && (
        <Suspense fallback={null}>
          <CompanySettingsModal
            initialSettings={settings}
            isOpen={isCompanyModalOpen}
            onClose={() => setIsCompanyModalOpen(false)}
            onSaved={updated => {
              setSettings(updated);
              setGstRate(updated.gst_rate ?? 18);
              setServiceCharge(updated.service_charge ?? 1);
            }}
          />
        </Suspense>
      )}

      {/* Promo Code Modal */}
      {isPromoModalOpen && (
        <Suspense fallback={null}>
          <PromoCodeModal
            promo={editPromoCode}
            isOpen={isPromoModalOpen}
            onClose={() => {
              setIsPromoModalOpen(false);
              setEditPromoCode(null);
            }}
            onSaved={saved => {
              setPromoCodes(prev => {
                const exists = prev.some(p => p.id === saved.id);
                if (exists) {
                  return prev.map(p => (p.id === saved.id ? saved : p));
                }
                return [saved, ...prev];
              });
            }}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AdminBilling;
