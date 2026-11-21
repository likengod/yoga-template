import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Calendar, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InvoiceData, InvoiceItem, billingService } from '@/services/billingService';
import { useToast } from '@/hooks/use-toast';

interface InvoiceModalProps {
  invoice?: InvoiceData | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (invoice: InvoiceData) => void;
  defaultTaxRate?: number;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSaved,
  defaultTaxRate = 18
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateInvoiceNumber = () => {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `#INV-${yearMonth}-${rand}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const dueDateStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState<Partial<InvoiceData>>({
    invoice_number: generateInvoiceNumber(),
    customer_name: '',
    customer_company: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    customer_city: '',
    customer_state: '',
    customer_zip: '',
    customer_country: '',
    issue_date: todayStr,
    due_date: dueDateStr,
    status: 'pending',
    notes: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Web Development Services', qty: 1, price: 5000, tax: defaultTaxRate, amount: 5000 }
  ]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        customer_name: invoice.customer_name || '',
        customer_company: invoice.customer_company || '',
        customer_email: invoice.customer_email || '',
        customer_phone: invoice.customer_phone || '',
        customer_address: invoice.customer_address || '',
        customer_city: invoice.customer_city || '',
        customer_state: invoice.customer_state || '',
        customer_zip: invoice.customer_zip || '',
        customer_country: invoice.customer_country || '',
        issue_date: invoice.issue_date?.split('T')[0] || todayStr,
        due_date: invoice.due_date?.split('T')[0] || dueDateStr,
        status: invoice.status || 'pending',
        notes: invoice.notes || ''
      });

      try {
        const parsed = typeof invoice.items_json === 'string' ? JSON.parse(invoice.items_json) : invoice.items_json;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      } catch {
        // default items
      }
    } else {
      setFormData({
        invoice_number: generateInvoiceNumber(),
        customer_name: '',
        customer_company: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        customer_city: '',
        customer_state: '',
        customer_zip: '',
        customer_country: '',
        issue_date: todayStr,
        due_date: dueDateStr,
        status: 'pending',
        notes: ''
      });
      setItems([
        { description: 'Web Development Services', qty: 1, price: 5000, tax: defaultTaxRate, amount: 5000 }
      ]);
    }
  }, [invoice, isOpen, defaultTaxRate]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof InvoiceData, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, val: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: val };

    if (field === 'qty' || field === 'price' || field === 'tax') {
      const qty = field === 'qty' ? Number(val) : Number(item.qty);
      const price = field === 'price' ? Number(val) : Number(item.price);
      item.amount = Number((qty * price).toFixed(2));
    }

    updated[index] = item;
    setItems(updated);
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { description: '', qty: 1, price: 0, tax: defaultTaxRate, amount: 0 }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast({ title: "At least one item required", variant: "destructive" });
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Compute subtotal, tax_amount, total_amount
  const subtotal = items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.price || 0)), 0);
  const taxAmount = items.reduce((sum, item) => {
    const itemSub = Number(item.qty || 0) * Number(item.price || 0);
    const taxRate = Number(item.tax ?? defaultTaxRate);
    return sum + (itemSub * (taxRate / 100));
  }, 0);
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!formData.customer_name?.trim() && !formData.customer_company?.trim()) || !formData.customer_email?.trim()) {
      toast({ title: "Customer details missing", description: "Customer name or company name, and email are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload: InvoiceData = {
        id: formData.id,
        invoice_number: formData.invoice_number || generateInvoiceNumber(),
        customer_name: formData.customer_name?.trim() || formData.customer_company?.trim() || '',
        customer_company: formData.customer_company?.trim() || '',
        customer_email: formData.customer_email?.trim() || '',
        customer_phone: formData.customer_phone?.trim() || '',
        customer_address: formData.customer_address?.trim() || '',
        customer_city: formData.customer_city?.trim() || '',
        customer_state: formData.customer_state?.trim() || '',
        customer_zip: formData.customer_zip?.trim() || '',
        customer_country: formData.customer_country?.trim() || '',
        issue_date: formData.issue_date || todayStr,
        due_date: formData.due_date || dueDateStr,
        status: (formData.status as any) || 'pending',
        subtotal: Number(subtotal.toFixed(2)),
        tax_amount: Number(taxAmount.toFixed(2)),
        total_amount: Number(totalAmount.toFixed(2)),
        items_json: JSON.stringify(items),
        notes: formData.notes
      };

      const res = formData.id
        ? await billingService.updateInvoice(formData.id, payload)
        : await billingService.createInvoice(payload);

      const data = (res as any).data || res;
      if (data && (data.invoice_number || data.id)) {
        toast({
          title: formData.id ? "Invoice Updated" : "Invoice Created",
          description: `Invoice ${data.invoice_number} saved successfully.`
        });
        onSaved(data);
        onClose();
      } else {
        toast({
          title: "Failed to save invoice",
          description: (res as any).error || "Please check details",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Error saving invoice",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {formData.id ? `Edit Invoice: ${formData.invoice_number}` : 'Create New Invoice'}
            </h2>
          </div>
          <Button onClick={onClose} size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm">
          {/* Top metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Invoice Number</Label>
              <Input
                className="mt-1 font-mono font-medium bg-white"
                value={formData.invoice_number}
                onChange={(e) => handleFieldChange('invoice_number', e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Status</Label>
              <select
                value={formData.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Issue Date</Label>
              <Input
                type="date"
                className="mt-1 bg-white"
                value={formData.issue_date}
                onChange={(e) => handleFieldChange('issue_date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Due Date</Label>
              <Input
                type="date"
                className="mt-1 bg-white"
                value={formData.due_date}
                onChange={(e) => handleFieldChange('due_date', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Customer Details */}
          <div>
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm mb-3">
              <User className="w-4 h-4 text-slate-600" />
              <span>Customer & Company Information</span>
            </div>
            <div className="space-y-3">
              {/* Row 1: Customer Name & Company / Org Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-600">Customer Name (Contact Person)</Label>
                  <Input
                    className="mt-1"
                    value={formData.customer_name || ''}
                    onChange={(e) => handleFieldChange('customer_name', e.target.value)}
                    placeholder="e.g. S. Kupetiene"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Company / Organization Name</Label>
                  <Input
                    className="mt-1"
                    value={formData.customer_company || ''}
                    onChange={(e) => handleFieldChange('customer_company', e.target.value)}
                    placeholder="e.g. Ananda veda MB"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-600">Email Address <span className="text-rose-500">*</span></Label>
                  <Input
                    type="email"
                    className="mt-1"
                    value={formData.customer_email || ''}
                    onChange={(e) => handleFieldChange('customer_email', e.target.value)}
                    placeholder="customer@example.com"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Phone</Label>
                  <Input
                    className="mt-1"
                    value={formData.customer_phone || ''}
                    onChange={(e) => handleFieldChange('customer_phone', e.target.value)}
                    placeholder="+37062200744"
                  />
                </div>
              </div>

              {/* Row 3: Street Address */}
              <div>
                <Label className="text-xs text-slate-600">Street Address</Label>
                <Input
                  className="mt-1"
                  value={formData.customer_address || ''}
                  onChange={(e) => handleFieldChange('customer_address', e.target.value)}
                  placeholder="Street address, building, suite / flat no."
                />
              </div>

              {/* Row 4: City, State/Region, ZIP, Country */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs text-slate-600">City</Label>
                  <Input
                    className="mt-1"
                    value={formData.customer_city || ''}
                    onChange={(e) => handleFieldChange('customer_city', e.target.value)}
                    placeholder="e.g. Alytus"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600">State / Region</Label>
                  <Input
                    className="mt-1"
                    value={formData.customer_state || ''}
                    onChange={(e) => handleFieldChange('customer_state', e.target.value)}
                    placeholder="e.g. Alytus County"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600">ZIP / Postal Code</Label>
                  <Input
                    className="mt-1"
                    value={formData.customer_zip || ''}
                    onChange={(e) => handleFieldChange('customer_zip', e.target.value)}
                    placeholder="e.g. 62105"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Country</Label>
                  <Input
                    className="mt-1"
                    value={formData.customer_country || ''}
                    onChange={(e) => handleFieldChange('customer_country', e.target.value)}
                    placeholder="e.g. Lithuania or India"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <Calculator className="w-4 h-4 text-slate-600" />
                <span>Line Items</span>
              </div>
              <Button type="button" onClick={addItem} size="sm" variant="outline" className="text-xs h-8 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </Button>
            </div>

            <div className="border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs">
                <thead className="bg-slate-100/70 border-b text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Item Description</th>
                    <th className="py-2.5 px-3 text-center w-20">Qty</th>
                    <th className="py-2.5 px-3 text-right w-32">Unit Price (₹)</th>
                    <th className="py-2.5 px-3 text-center w-20">Tax %</th>
                    <th className="py-2.5 px-3 text-right w-32">Total (₹)</th>
                    <th className="py-2.5 px-2 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <Input
                          className="h-8 text-xs"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="e.g. hosting aws 12 month"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="1"
                          className="h-8 text-xs text-center font-mono"
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                          required
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="h-8 text-xs text-right font-mono"
                          value={item.price}
                          onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                          required
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          className="h-8 text-xs text-center font-mono"
                          value={item.tax}
                          onChange={(e) => handleItemChange(idx, 'tax', e.target.value)}
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-semibold text-slate-800 pr-3">
                        ₹{(Number(item.qty || 0) * Number(item.price || 0)).toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(idx)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 rounded-full"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total calculation panel */}
            <div className="flex flex-col items-end pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between w-64 text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-slate-600">
                <span>Tax:</span>
                <span className="font-mono font-medium">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 pt-2 border-t font-black text-slate-900 text-sm">
                <span>Grand Total:</span>
                <span className="font-mono text-base text-blue-700">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white min-w-[120px]">
              {loading ? 'Saving...' : formData.id ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceModal;
