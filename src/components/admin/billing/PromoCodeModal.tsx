import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PromoCodeData, billingService } from '@/services/billingService';
import { useToast } from '@/hooks/use-toast';

interface PromoCodeModalProps {
  promo?: PromoCodeData | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (code: PromoCodeData) => void;
}

export const PromoCodeModal: React.FC<PromoCodeModalProps> = ({
  promo,
  isOpen,
  onClose,
  onSaved
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<Partial<PromoCodeData>>({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    max_discount_amount: undefined,
    valid_until: '',
    max_uses: undefined,
    is_active: true
  });

  useEffect(() => {
    if (promo) {
      setForm({
        ...promo,
        valid_until: promo.valid_until ? promo.valid_until.split('T')[0] : ''
      });
    } else {
      setForm({
        code: '',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_amount: 0,
        max_discount_amount: undefined,
        valid_until: '',
        max_uses: undefined,
        is_active: true
      });
    }
  }, [promo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || form.discount_value === undefined) {
      toast({ title: "Validation error", description: "Code and discount value required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload: PromoCodeData = {
        id: form.id,
        code: form.code.toUpperCase().trim(),
        discount_type: form.discount_type || 'percentage',
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount || 0),
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : undefined,
        valid_until: form.valid_until || undefined,
        max_uses: form.max_uses ? Number(form.max_uses) : undefined,
        is_active: form.is_active ?? true
      };

      const res = form.id
        ? await billingService.updatePromoCode(form.id, payload)
        : await billingService.createPromoCode(payload);

      const data = (res as any).data || res;
      if (data && (data.code || data.id)) {
        toast({
          title: form.id ? "Promo Code Updated" : "Promo Code Created",
          description: `Code ${data.code} is now active.`
        });
        onSaved(data);
        onClose();
      } else {
        toast({ title: "Failed to save", description: (res as any).error || "Failed to save", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">{form.id ? 'Edit Promo Code' : 'New Promo Code'}</h3>
          </div>
          <Button onClick={onClose} size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <Label className="text-xs font-semibold text-slate-700">Coupon / Promo Code</Label>
            <Input
              className="mt-1 font-mono uppercase"
              placeholder="e.g. SUMMER20"
              value={form.code}
              onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Type</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                value={form.discount_type}
                onChange={(e) => setForm(prev => ({ ...prev, discount_type: e.target.value as any }))}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Value</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                className="mt-1 font-mono"
                value={form.discount_value}
                onChange={(e) => setForm(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Min Order (₹)</Label>
              <Input
                type="number"
                min="0"
                className="mt-1 font-mono"
                value={form.min_order_amount}
                onChange={(e) => setForm(prev => ({ ...prev, min_order_amount: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Max Discount (₹)</Label>
              <Input
                type="number"
                min="0"
                placeholder="Unlimited"
                className="mt-1 font-mono"
                value={form.max_discount_amount || ''}
                onChange={(e) => setForm(prev => ({ ...prev, max_discount_amount: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Expiry Date</Label>
              <Input
                type="date"
                className="mt-1"
                value={form.valid_until}
                onChange={(e) => setForm(prev => ({ ...prev, valid_until: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700">Max Usage Limit</Label>
              <Input
                type="number"
                min="1"
                placeholder="Unlimited"
                className="mt-1 font-mono"
                value={form.max_uses || ''}
                onChange={(e) => setForm(prev => ({ ...prev, max_uses: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <label htmlFor="is_active" className="text-xs font-medium text-slate-700 cursor-pointer">
              Enable this promotional code immediately
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white">
              {loading ? 'Saving...' : form.id ? 'Save Changes' : 'Create Promo Code'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoCodeModal;
