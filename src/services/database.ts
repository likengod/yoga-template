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
    return api.put(`/bookings/${id}/status`, { status });
  }
};

export const popupService = {
  async getSettings() {
    const items = await api.get('/popup_settings');
    return items.length > 0 ? items[0] : null;
  },
  async updateSettings(settings: any) {
    const items = await api.get('/popup_settings');
    if (items.length > 0) {
      return api.put(`/popup_settings/${items[0].id}`, settings);
    }
    return api.post('/popup_settings', settings);
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

export interface FileItem {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
}

  export const fileService = {
  async getFiles() {
    return api.get('/files');
  },
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData);
  },
  async deleteFile(id: string) {
    return api.delete(`/files/${id}`);
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
  }
};
