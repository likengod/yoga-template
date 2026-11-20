import { api } from '@/services/api';

export const bookingService = {
  async createBooking(booking: any) {
    return api.post('/bookings', booking);
  },
  async getBookings() {
    return api.get('/bookings');
  },
  async deleteBooking(id: string) {
    return api.delete(`/bookings/${id}`);
  },
  async updateStatus(id: string, status: string) {
    return api.put(`/bookings/${id}`, { status });
  },
  async searchBookingsByPhone(phone: string) {
    return api.get(`/bookings/search?phone=${encodeURIComponent(phone)}`);
  }
};

export const popupService = {
  async getSettings() {
    const items = await api.get('/popup_settings');
    return items.length > 0 ? items[0] : null;
  },
  async updateSettings(settings: any) {
    const dbSettings = {
      enabled: settings.enabled,
      title: settings.title,
      message: settings.message,
      button_text: settings.buttonText !== undefined ? settings.buttonText : settings.button_text,
      button_url: settings.buttonUrl !== undefined ? settings.buttonUrl : settings.button_url,
      image: settings.image,
      delay: settings.delay
    };
    const items = await api.get('/popup_settings');
    if (items.length > 0) {
      return api.put(`/popup_settings/${items[0].id}`, dbSettings);
    }
    return api.post('/popup_settings', dbSettings);
  }
};

export interface HomeContentData {
  hero_title?: string;
  hero_subtitle?: string;
  hero_video_url?: string;
  hero_primary_button_text?: string;
  hero_primary_button_link?: string;
  hero_secondary_button_text?: string;
  hero_secondary_button_link?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_youtube?: string;
  programs_title?: string;
  programs_subtitle?: string;
  features_title?: string;
  features_subtitle?: string;
  cta_title?: string;
  cta_subtitle?: string;
  cta_button_text?: string;
  cta_button_link?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  hero?: {
    titleTop?: string;
    titleBottom?: string;
    subtitle?: string;
    buttonPrimary?: string;
    buttonSecondary?: string;
    stats?: { years?: string; students?: string; classes?: string };
    image?: string;
  };
  about?: {
    title?: string;
    description?: string;
    philosophyTitle?: string;
    philosophyP1?: string;
    philosophyP2?: string;
    button?: string;
    image?: string;
    features?: Array<{ title?: string; description?: string }>;
  };
}

export interface FileItem {
  id: string;
  name: string;
  url: string;
  size: number | string;
  type: string;
  created_at?: string;
  dimensions?: string;
  uploadDate?: string;
}

export interface AboutContentData {
  title?: string;
  subtitle?: string;
  mission_title?: string;
  mission_text?: string;
  vision_title?: string;
  vision_text?: string;
  values_title?: string;
  values_text?: string;
  team_title?: string;
  team_subtitle?: string;
  history_title?: string;
  history_text?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export interface ContactContentData {
  title?: string;
  subtitle?: string;
  address?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  business_hours?: string;
  map_embed_url?: string;
  form_title?: string;
  form_subtitle?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export const fileService = {
  async getFiles(): Promise<FileItem[]> {
    try {
      const data = await api.get('/files');
      if (Array.isArray(data)) {
        try {
          localStorage.setItem('cached_files', JSON.stringify(data));
        } catch {}
        return data;
      }
      return [];
    } catch {
      try {
        const cached = localStorage.getItem('cached_files');
        if (cached) return JSON.parse(cached);
      } catch {}
      return [];
    }
  },
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData);
  },
  async deleteFile(id: string) {
    try {
      return await api.delete(`/files/${id}`);
    } catch {
      return { success: true };
    }
  },
  async createFile(fileData: any) {
    return api.post('/files', fileData);
  },
  async updateFile(id: string, fileData: any) {
    return api.put(`/files/${id}`, fileData);
  }
};

export const homeContentService = {
  async getHomeContent() {
    return api.get('/home_content');
  },
  async updateHomeContent(content: any) {
    return api.post('/home_content', content);
  }
};

export const aboutService = {
  async getAboutContent() {
    return api.get('/about_content');
  },
  async updateAboutContent(content: any) {
    return api.post('/about_content', content);
  }
};

export const contactService = {
  async getContactContent() {
    return api.get('/contact_content');
  },
  async updateContactContent(content: any) {
    return api.post('/contact_content', content);
  }
};

export const galleryService = {
  async getImages() {
    return api.get('/gallery_images');
  },
  async addImage(image: any) {
    return api.post('/gallery_images', image);
  },
  async updateImage(id: string, image: any) {
    return api.put(`/gallery_images/${id}`, image);
  },
  async deleteImage(id: string) {
    return api.delete(`/gallery_images/${id}`);
  },
  async incrementViews(id: string) {
    return api.post(`/gallery_images/${id}/view`, {});
  }
};

export const policiesService = {
  async getPolicy(type: string) {
    return api.get(`/policies/${type}`);
  },
  async updatePolicy(type: string, content: any) {
    return api.post(`/policies/${type}`, content);
  }
};

export const DEFAULT_DEMO_CERTIFICATES = [
  {
    id: "cert-demo-001",
    certificateId: "SY-2026-1042",
    studentName: "Aarav Sharma",
    courseName: "200-Hour Ashtanga Yoga Teacher Training",
    issueDate: "2026-06-15T00:00:00.000Z",
    instructorName: "Master Raai",
    phone: "+91 98765 43210",
    signature_url: "/uploads/signature_master_raai.png",
    isPremium: false,
    created_at: "2026-06-15T10:30:00.000Z"
  },
  {
    id: "cert-demo-002",
    certificateId: "SY-2026-1043",
    studentName: "Priya Patel",
    courseName: "Hatha Yoga Masterclass: Balance & Alignment",
    issueDate: "2026-06-20T00:00:00.000Z",
    instructorName: "Priya Sharma",
    phone: "+91 98123 45678",
    signature_url: "/uploads/signature_priya.png",
    isPremium: false,
    created_at: "2026-06-20T11:00:00.000Z"
  },
  {
    id: "cert-demo-003",
    certificateId: "SY-2026-1044",
    studentName: "Rahul Verma",
    courseName: "Vinyasa Flow & Dynamic Power Yoga",
    issueDate: "2026-07-02T00:00:00.000Z",
    instructorName: "Ananya Sen",
    phone: "+91 98234 56789",
    signature_url: "/uploads/signature_ananya.png",
    isPremium: false,
    created_at: "2026-07-02T09:15:00.000Z"
  },
  {
    id: "cert-demo-004",
    certificateId: "SY-2026-1045",
    studentName: "Neha Kulkarni",
    courseName: "Pranayama & Kundalini Energy Awakening",
    issueDate: "2026-07-10T00:00:00.000Z",
    instructorName: "Yogi Vikram",
    phone: "+91 98345 67890",
    signature_url: "/uploads/signature_vikram.png",
    isPremium: false,
    created_at: "2026-07-10T14:20:00.000Z"
  },
  {
    id: "cert-demo-005",
    certificateId: "SY-2026-1046",
    studentName: "Rohan Gupta",
    courseName: "Yoga for Beginners – Complete Foundation",
    issueDate: "2026-07-18T00:00:00.000Z",
    instructorName: "Sushmita Debnath",
    phone: "+91 98456 78901",
    signature_url: "/uploads/signature_sushmita.png",
    isPremium: false,
    created_at: "2026-07-18T16:45:00.000Z"
  },
  {
    id: "cert-demo-006",
    certificateId: "SY-2026-1047",
    studentName: "Meera Krishnan",
    courseName: "Restorative Yin Yoga & Sound Healing",
    issueDate: "2026-07-25T00:00:00.000Z",
    instructorName: "Master Raai",
    phone: "+91 98567 89012",
    signature_url: "/uploads/signature_master_raai.png",
    isPremium: false,
    created_at: "2026-07-25T12:00:00.000Z"
  },
  {
    id: "cert-demo-007",
    certificateId: "SY-2026-1048",
    studentName: "Vikramaditya Roy",
    courseName: "Advanced Pranayama & Chakra Alignment",
    issueDate: "2026-08-01T00:00:00.000Z",
    instructorName: "Yogi Vikram",
    phone: "+91 98678 90123",
    signature_url: "/uploads/signature_vikram.png",
    isPremium: false,
    created_at: "2026-08-01T15:30:00.000Z"
  },
  {
    id: "cert-demo-008",
    certificateId: "SY-2026-1049",
    studentName: "Ananya Sen",
    courseName: "Mindfulness & Vedic Meditation Intensive",
    issueDate: "2026-08-10T00:00:00.000Z",
    instructorName: "Sushmita Debnath",
    phone: "+91 98789 01234",
    signature_url: "/uploads/signature_sushmita.png",
    isPremium: false,
    created_at: "2026-08-10T11:10:00.000Z"
  }
];

export const certificateService = {
  async getCertificates() {
    try {
      const res = await api.get('/certificates');
      const list = Array.isArray(res) ? res : (res?.data || []);
      const deletedIds = JSON.parse(localStorage.getItem('deletedCertIds') || '[]');
      if (Array.isArray(list)) {
        return list.filter((c: any) => !deletedIds.includes(c.id) && !deletedIds.includes(c.certificateId));
      }
      return [];
    } catch {
      if (localStorage.getItem('certs_cleared') === 'true') {
        return [];
      }
      const deletedIds = JSON.parse(localStorage.getItem('deletedCertIds') || '[]');
      return DEFAULT_DEMO_CERTIFICATES.filter(c => !deletedIds.includes(c.id) && !deletedIds.includes(c.certificateId));
    }
  },
  async getCertificate(certId: string) {
    try {
      return await api.get(`/certificates/${certId}`);
    } catch {
      const deletedIds = JSON.parse(localStorage.getItem('deletedCertIds') || '[]');
      if (deletedIds.includes(certId)) throw new Error('Certificate not found');
      const found = DEFAULT_DEMO_CERTIFICATES.find(c => (c.certificateId === certId || c.id === certId) && !deletedIds.includes(c.id));
      if (found) return found;
      throw new Error('Certificate not found');
    }
  },
  async autoGenerateCertificate(phone: string) {
    try {
      return await api.post('/certificates/auto', { phone });
    } catch (err) {
      const deletedIds = JSON.parse(localStorage.getItem('deletedCertIds') || '[]');
      const cleanPhone = phone.replace(/\D/g, '');
      const found = DEFAULT_DEMO_CERTIFICATES.find(c => {
        if (deletedIds.includes(c.id) || deletedIds.includes(c.certificateId)) return false;
        const cleanC = (c.phone || '').replace(/\D/g, '');
        return c.phone === phone || cleanC === cleanPhone || c.certificateId === phone;
      });
      if (found) return found;
      throw err;
    }
  },
  async issueCertificate(data: any) {
    return api.post('/certificates', data);
  },
  async updateCertificate(id: string, data: any) {
    try {
      return await api.put(`/certificates/${id}`, data);
    } catch {
      const idx = DEFAULT_DEMO_CERTIFICATES.findIndex(c => c.id === id || c.certificateId === id);
      if (idx !== -1) {
        DEFAULT_DEMO_CERTIFICATES[idx] = { ...DEFAULT_DEMO_CERTIFICATES[idx], ...data };
        return DEFAULT_DEMO_CERTIFICATES[idx];
      }
      return { id, ...data };
    }
  },
  async deleteCertificate(id: string) {
    try {
      const deletedIds = JSON.parse(localStorage.getItem('deletedCertIds') || '[]');
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem('deletedCertIds', JSON.stringify(deletedIds));
      }
      return await api.delete(`/certificates/${id}`);
    } catch {
      return { success: true };
    }
  }
};

export const siteSettingsService = {
  async getSettings() {
    const items = await api.get('/site-settings');
    return items.length > 0 ? items[0] : null;
  },
  async updateSettings(settings: any) {
    const items = await api.get('/site-settings');
    if (items.length > 0) {
      return api.put(`/site-settings/${items[0].id}`, settings);
    }
    return api.post('/site-settings', settings);
  }
};

export const seoSettingsService = {
  async getSettings() {
    const items = await api.get('/seo-settings');
    return items.length > 0 ? items[0] : null;
  },
  async updateSettings(settings: any) {
    const items = await api.get('/seo-settings');
    if (items.length > 0) {
      return api.put(`/seo-settings/${items[0].id}`, settings);
    }
    return api.post('/seo-settings', settings);
  }
};

export const eventService = {
  async getEvent() {
    const items = await api.get('/events');
    return items.length > 0 ? items[0] : null;
  },
  async updateEvent(eventData: any) {
    const items = await api.get('/events');
    if (items.length > 0) {
      return api.put(`/events/${items[0].id}`, eventData);
    }
    return api.post('/events', eventData);
  }
};
