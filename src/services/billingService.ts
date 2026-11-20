import { api } from '@/services/api';

export interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
  tax: number;
  amount: number;
}

export interface InvoiceData {
  id?: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_zip?: string;
  customer_country?: string;
  issue_date: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  items_json: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BillingSettingsData {
  id?: string;
  gst_rate: number;
  service_charge: number;
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  tax_id_type?: string;
  pan?: string;
  license_no?: string;
  website?: string;
  address?: string;
  zip_code?: string;
  state?: string;
  country?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  qr_code_url?: string;
  logo_url?: string;
  signature_url?: string;
}

export interface PromoCodeData {
  id?: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  max_uses?: number;
  used_count?: number;
  valid_until?: string;
  is_active?: boolean;
}

export const DEFAULT_DEMO_INVOICES: InvoiceData[] = [
  {
    id: "inv-0008",
    invoice_number: "INV-202606-0008",
    customer_name: "Urban Asana Studio",
    customer_email: "hello@urbanasana.in",
    customer_phone: "+91 94365 88990",
    customer_address: "Palace Compound",
    customer_city: "Agartala",
    customer_state: "Tripura",
    customer_zip: "799001",
    customer_country: "India",
    issue_date: "2026-06-25",
    due_date: "2026-07-25",
    status: "paid",
    subtotal: 6000.00,
    tax_amount: 1080.00,
    total_amount: 7080.00,
    items_json: JSON.stringify([
      { description: "SEO Optimization & Speed Retainer (Monthly)", qty: 1, price: 4000.00, tax: 18, amount: 4000.00 },
      { description: "Google My Business Local Maps Setup", qty: 1, price: 2000.00, tax: 18, amount: 2000.00 }
    ]),
    notes: "Payment received via UPI. Thank you!"
  },
  {
    id: "inv-0007",
    invoice_number: "INV-202606-0007",
    customer_name: "Aura Life Health Center",
    customer_email: "accounts@auralifehealth.com",
    customer_phone: "+91 97740 99881",
    customer_address: "Dhaleswar Road 4",
    customer_city: "Agartala",
    customer_state: "Tripura",
    customer_zip: "799007",
    customer_country: "India",
    issue_date: "2026-05-10",
    due_date: "2026-06-10",
    status: "overdue",
    subtotal: 25000.00,
    tax_amount: 4500.00,
    total_amount: 29500.00,
    items_json: JSON.stringify([
      { description: "Custom Appointment Booking Engine", qty: 1, price: 20000.00, tax: 18, amount: 20000.00 },
      { description: "Transactional SMS Gateway (50,000 Credits)", qty: 1, price: 5000.00, tax: 18, amount: 5000.00 }
    ]),
    notes: "Invoice overdue by 24 days. Payment reminder sent."
  },
  {
    id: "inv-0006",
    invoice_number: "INV-202606-0006",
    customer_name: "Tripura Daily Chronicle",
    customer_email: "editor@tripurachronicle.in",
    customer_phone: "+91 98621 11223",
    customer_address: "Post Office Chowmuhani",
    customer_city: "Agartala",
    customer_state: "Tripura",
    customer_zip: "799001",
    customer_country: "India",
    issue_date: "2026-06-20",
    due_date: "2026-07-20",
    status: "pending",
    subtotal: 12000.00,
    tax_amount: 2160.00,
    total_amount: 14160.00,
    items_json: JSON.stringify([
      { description: "High-Traffic Cloud CDN & DDoS Shield (Annual)", qty: 1, price: 9000.00, tax: 18, amount: 9000.00 },
      { description: "Daily Automated Off-site Backup Storage", qty: 1, price: 3000.00, tax: 18, amount: 3000.00 }
    ]),
    notes: "Payment due within 30 days."
  },
  {
    id: "inv-0005",
    invoice_number: "INV-202606-0005",
    customer_name: "Lotus Mind Institute",
    customer_email: "admin@lotusmind.org",
    customer_phone: "+91 98620 54321",
    customer_address: "Banamalipur Main Road",
    customer_city: "Agartala",
    customer_state: "Tripura",
    customer_zip: "799001",
    customer_country: "India",
    issue_date: "2026-06-15",
    due_date: "2026-07-15",
    status: "paid",
    subtotal: 8000.00,
    tax_amount: 1440.00,
    total_amount: 9440.00,
    items_json: JSON.stringify([
      { description: "Online Course Platform Video Streaming Setup", qty: 1, price: 5000.00, tax: 18, amount: 5000.00 },
      { description: "SSL Certificate & Payment Gateway Integration", qty: 1, price: 3000.00, tax: 18, amount: 3000.00 }
    ]),
    notes: "Paid online via NetBanking."
  },
  {
    id: "inv-0004",
    invoice_number: "INV-202606-0004",
    customer_name: "Hard Rock",
    customer_email: "info@hardrock.com",
    customer_phone: "7085259671",
    customer_address: "AGARTALA",
    customer_city: "Agartala",
    customer_state: "Tripura",
    customer_zip: "799001",
    customer_country: "India",
    issue_date: "2026-06-28",
    due_date: "2026-07-28",
    status: "pending",
    subtotal: 15478.00,
    tax_amount: 2786.04,
    total_amount: 18264.04,
    items_json: JSON.stringify([
      { description: "domain", qty: 1, price: 799.00, tax: 18, amount: 799.00 },
      { description: "hosting aws 12 month", qty: 1, price: 12075.00, tax: 18, amount: 12075.00 },
      { description: "email for 12 month monthly 29rs 2 email", qty: 1, price: 696.00, tax: 18, amount: 696.00 },
      { description: "ssl 12 month monthly 159rs", qty: 1, price: 1908.00, tax: 18, amount: 1908.00 }
    ]),
    notes: "Thank you for your business! Payment due within 30 days."
  },
  {
    id: "inv-0003",
    invoice_number: "INV-202606-0003",
    customer_name: "News Vigilant",
    customer_email: "admin@newssvigilant.com",
    customer_phone: "+91 98765 43210",
    customer_address: "Agartala",
    customer_city: "Agartala",
    customer_state: "Tripura",
    customer_zip: "799001",
    customer_country: "India",
    issue_date: "2026-06-03",
    due_date: "2026-07-08",
    status: "paid",
    subtotal: 3133.18,
    tax_amount: 563.97,
    total_amount: 3697.15,
    items_json: JSON.stringify([
      { description: "Web Maintenance & Security Update", qty: 1, price: 3133.18, tax: 18, amount: 3133.18 }
    ]),
    notes: "Paid in full via UPI."
  },
  {
    id: "inv-0002",
    invoice_number: "INV-202606-0002",
    customer_name: "NEWS VANGUARD",
    customer_email: "admin@newsvanguard.com",
    customer_phone: "+91 94361 22334",
    customer_address: "Tripura West",
    customer_city: "Agartala",
    customer_state: "Tripura",
    customer_zip: "799002",
    customer_country: "India",
    issue_date: "2026-05-30",
    due_date: "2026-07-11",
    status: "pending",
    subtotal: 14180.85,
    tax_amount: 2552.55,
    total_amount: 16733.40,
    items_json: JSON.stringify([
      { description: "Dedicated Cloud Server & Bandwidth Package", qty: 1, price: 14180.85, tax: 18, amount: 14180.85 }
    ]),
    notes: "Payment due within 30 days."
  },
  {
    id: "inv-0001",
    invoice_number: "INV-202606-0001",
    customer_name: "janatarkalam.com",
    customer_email: "admin@janatarkalam.com",
    customer_phone: "+91 97740 11223",
    customer_address: "Kunjaban",
    customer_city: "Agartala",
    customer_state: "Tripura",
    customer_zip: "799006",
    customer_country: "India",
    issue_date: "2026-06-04",
    due_date: "2026-07-09",
    status: "paid",
    subtotal: 3133.18,
    tax_amount: 563.97,
    total_amount: 3697.15,
    items_json: JSON.stringify([
      { description: "Domain & DNS Cloud Protection", qty: 1, price: 3133.18, tax: 18, amount: 3133.18 }
    ]),
    notes: "Paid online."
  },
  {
    id: "inv-0000",
    invoice_number: "INV-202605-0002",
    customer_name: "hack2skill",
    customer_email: "info@hack2skill.com",
    customer_phone: "+91 98123 45678",
    customer_address: "HSR Layout",
    customer_city: "Bengaluru",
    customer_state: "Karnataka",
    customer_zip: "560102",
    customer_country: "India",
    issue_date: "2026-05-22",
    due_date: "2026-06-26",
    status: "paid",
    subtotal: 19491.53,
    tax_amount: 3508.48,
    total_amount: 23000.01,
    items_json: JSON.stringify([
      { description: "Full-Stack Hackathon Portal Development", qty: 1, price: 19491.53, tax: 18, amount: 19491.53 }
    ]),
    notes: "Bank transfer confirmed."
  },
  {
    id: "inv-0009",
    invoice_number: "INV-202604-0001",
    customer_name: "Zenith Yoga & Wellness Retreat",
    customer_email: "contact@zenithyogaretreat.com",
    customer_phone: "+91 98630 77665",
    customer_address: "Udaipur Bypass",
    customer_city: "Udaipur",
    customer_state: "Tripura",
    customer_zip: "799120",
    customer_country: "India",
    issue_date: "2026-04-12",
    due_date: "2026-05-12",
    status: "overdue",
    subtotal: 36000.00,
    tax_amount: 6480.00,
    total_amount: 42480.00,
    items_json: JSON.stringify([
      { description: "Annual Enterprise Yoga Portal & Booking System", qty: 1, price: 30000.00, tax: 18, amount: 30000.00 },
      { description: "Dedicated Video Streaming Server Setup", qty: 1, price: 6000.00, tax: 18, amount: 6000.00 }
    ]),
    notes: "Overdue notice sent. Follow up with accounts manager."
  },
  {
    id: "inv-0010",
    invoice_number: "INV-202603-0003",
    customer_name: "Kalyani Yoga Sangha",
    customer_email: "contact@kalyaniyogasangha.org",
    customer_phone: "+91 94361 77889",
    customer_address: "College Tilla",
    customer_city: "Agartala",
    customer_state: "Tripura",
    customer_zip: "799004",
    customer_country: "India",
    issue_date: "2026-03-25",
    due_date: "2026-04-25",
    status: "paid",
    subtotal: 10000.00,
    tax_amount: 1800.00,
    total_amount: 11800.00,
    items_json: JSON.stringify([
      { description: "Student Management Portal Integration", qty: 1, price: 10000.00, tax: 18, amount: 10000.00 }
    ]),
    notes: "Paid via UPI transfer."
  },
  {
    id: "inv-0011",
    invoice_number: "INV-202603-0002",
    customer_name: "Himalayan Vinyasa Academy",
    customer_email: "support@himalayanvinyasa.com",
    customer_phone: "+91 98622 33445",
    customer_address: "Mall Road",
    customer_city: "Dharamsala",
    customer_state: "Himachal Pradesh",
    customer_zip: "176215",
    customer_country: "India",
    issue_date: "2026-03-15",
    due_date: "2026-04-15",
    status: "pending",
    subtotal: 18000.00,
    tax_amount: 3240.00,
    total_amount: 21240.00,
    items_json: JSON.stringify([
      { description: "E-Learning LMS Platform & Certificate Generator", qty: 1, price: 18000.00, tax: 18, amount: 18000.00 }
    ]),
    notes: "Payment due in 30 days."
  },
  {
    id: "inv-0012",
    invoice_number: "INV-202603-0001",
    customer_name: "Shiva Shakti Wellness Club",
    customer_email: "finance@shivashaktiwellness.in",
    customer_phone: "+91 97741 55667",
    customer_address: "Banamalipur Main",
    customer_city: "Agartala",
    customer_state: "Tripura",
    customer_zip: "799001",
    customer_country: "India",
    issue_date: "2026-03-01",
    due_date: "2026-04-01",
    status: "paid",
    subtotal: 12000.00,
    tax_amount: 2160.00,
    total_amount: 14160.00,
    items_json: JSON.stringify([
      { description: "Annual Domain & Cloud Infrastructure Package", qty: 1, price: 12000.00, tax: 18, amount: 12000.00 }
    ]),
    notes: "Payment received in full."
  }
];

export const DEFAULT_DEMO_SETTINGS: BillingSettingsData = {
  id: "billing-settings-default",
  gst_rate: 18,
  service_charge: 1,
  company_name: "gorilla tech solution",
  company_email: "business@gorillatechsolution.com",
  company_phone: "+91 92 333 11931",
  tax_id_type: "GSTIN",
  pan: "DCKPK2142C",
  license_no: "UDYAM-TR-08-0000160",
  website: "gorillatechsolution.com",
  address: "Agartala Tripura(w)",
  zip_code: "799006",
  state: "Tripura",
  country: "India",
  bank_name: "RBL",
  account_name: "prasenjit kar malakar",
  account_number: "309028561095",
  ifsc_code: "RATN0000458",
  upi_id: "9233311931@ybl",
  qr_code_url: "",
  logo_url: "",
  signature_url: ""
};

export const DEFAULT_DEMO_PROMOS: PromoCodeData[] = [
  {
    id: "promo-001",
    code: "SUMMER2026",
    discount_type: "percentage",
    discount_value: 20,
    min_order_amount: 1000,
    max_discount_amount: 2500,
    valid_until: "2026-08-31",
    max_uses: 100,
    used_count: 14,
    is_active: true
  },
  {
    id: "promo-002",
    code: "WELCOME500",
    discount_type: "fixed",
    discount_value: 500,
    min_order_amount: 2500,
    valid_until: "2026-12-31",
    max_uses: 50,
    used_count: 8,
    is_active: true
  },
  {
    id: "promo-003",
    code: "CORPORATE10",
    discount_type: "percentage",
    discount_value: 10,
    min_order_amount: 10000,
    max_discount_amount: 5000,
    valid_until: "2026-11-30",
    max_uses: 20,
    used_count: 3,
    is_active: true
  },
  {
    id: "promo-004",
    code: "FESTIVE15",
    discount_type: "percentage",
    discount_value: 15,
    min_order_amount: 3000,
    max_discount_amount: 1500,
    valid_until: "2026-10-15",
    max_uses: 200,
    used_count: 42,
    is_active: true
  }
];

export const billingService = {
  // Invoices
  async getInvoices(): Promise<InvoiceData[]> {
    try {
      const deletedIds = JSON.parse(localStorage.getItem('deletedInvoiceIds') || '[]');
      const data = await api.get('/invoices');
      const items = Array.isArray(data) ? data : (data && Array.isArray((data as any).data) ? (data as any).data : []);
      return items.filter((i: any) => !deletedIds.includes(i.id) && !deletedIds.includes(i.invoice_number));
    } catch {
      if (localStorage.getItem('invoices_cleared') === 'true') {
        return [];
      }
      const deletedIds = JSON.parse(localStorage.getItem('deletedInvoiceIds') || '[]');
      return DEFAULT_DEMO_INVOICES.filter(i => !deletedIds.includes(i.id) && !deletedIds.includes(i.invoice_number));
    }
  },
  async getInvoiceById(id: string): Promise<InvoiceData> {
    try {
      return await api.get(`/invoices/${id}`);
    } catch {
      const deletedIds = JSON.parse(localStorage.getItem('deletedInvoiceIds') || '[]');
      if (deletedIds.includes(id)) throw new Error('Invoice not found');
      const found = DEFAULT_DEMO_INVOICES.find(i => (i.id === id || i.invoice_number === id) && !deletedIds.includes(i.id));
      if (found) return found;
      throw new Error('Invoice not found');
    }
  },
  async createInvoice(data: Partial<InvoiceData>): Promise<InvoiceData> {
    localStorage.removeItem('invoices_cleared');
    try { localStorage.removeItem('cache_/invoices'); } catch {}
    return api.post('/invoices', data);
  },
  async updateInvoice(id: string, data: Partial<InvoiceData>): Promise<InvoiceData> {
    try { localStorage.removeItem('cache_/invoices'); } catch {}
    return api.put(`/invoices/${id}`, data);
  },
  async deleteInvoice(id: string): Promise<{ success: boolean }> {
    try {
      const deletedIds = JSON.parse(localStorage.getItem('deletedInvoiceIds') || '[]');
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
      }
      localStorage.setItem('deletedInvoiceIds', JSON.stringify(deletedIds));
      try { localStorage.removeItem('cache_/invoices'); } catch {}
      return await api.delete(`/invoices/${id}`);
    } catch {
      try { localStorage.removeItem('cache_/invoices'); } catch {}
      return { success: true };
    }
  },

  async verifyInvoice(invoiceNumber: string, amount?: string): Promise<{
    verified: boolean;
    amountMismatch?: boolean;
    message?: string;
    error?: string;
    invoice?: InvoiceData;
    settings?: BillingSettingsData;
  }> {
    try {
      const query = new URLSearchParams();
      query.set('number', invoiceNumber);
      if (amount) query.set('amount', amount);
      const res = await api.get(`/invoices/verify?${query.toString()}`);
      return res;
    } catch {
      // Offline / fallback verification
      const cleanNum = invoiceNumber.replace(/^[#\s]+/, '').toLowerCase();
      const found = DEFAULT_DEMO_INVOICES.find(i => {
        const iNum = (i.invoice_number || '').replace(/^[#\s]+/, '').toLowerCase();
        return iNum === cleanNum || i.id === cleanNum;
      });

      if (!found) {
        return {
          verified: false,
          error: 'Invoice not found. This invoice number does not exist in our official records.'
        };
      }

      if (amount) {
        const parsed = parseFloat(amount);
        if (!isNaN(parsed) && Math.abs(Number(found.total_amount) - parsed) > 0.5) {
          return {
            verified: false,
            amountMismatch: true,
            message: `Amount mismatch: You entered ₹${parsed.toFixed(2)}, but the official invoice amount is ₹${Number(found.total_amount).toFixed(2)}.`,
            invoice: found
          };
        }
      }

      return {
        verified: true,
        amountMismatch: false,
        invoice: found,
        settings: DEFAULT_DEMO_SETTINGS
      };
    }
  },

  // Settings
  async getSettings(): Promise<BillingSettingsData> {
    try {
      const data = await api.get('/billing_settings');
      if (data && (data.company_name || data.id)) return data;
      return DEFAULT_DEMO_SETTINGS;
    } catch {
      return DEFAULT_DEMO_SETTINGS;
    }
  },
  async updateSettings(data: Partial<BillingSettingsData>): Promise<BillingSettingsData> {
    try { localStorage.removeItem('cache_/billing_settings'); } catch {}
    return api.post('/billing_settings', data);
  },

  // Promo Codes
  async getPromoCodes(): Promise<PromoCodeData[]> {
    try {
      const data = await api.get('/promo_codes');
      if (Array.isArray(data) && data.length > 0) return data;
      return DEFAULT_DEMO_PROMOS;
    } catch {
      return DEFAULT_DEMO_PROMOS;
    }
  },
  async createPromoCode(data: Partial<PromoCodeData>): Promise<PromoCodeData> {
    return api.post('/promo_codes', data);
  },
  async updatePromoCode(id: string, data: Partial<PromoCodeData>): Promise<PromoCodeData> {
    return api.put(`/promo_codes/${id}`, data);
  },
  async deletePromoCode(id: string): Promise<{ success: boolean }> {
    return api.delete(`/promo_codes/${id}`);
  }
};
