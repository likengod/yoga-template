import { api } from '@/services/api';
import { SEED_ARTICLES } from '@/utils/seedData';

export const articlesApi = {
  // GET all published articles (MySQL → fallback to seed)
  async getAll() {
    try {
      const data = await api.get('/articles');
      return Array.isArray(data) ? data : SEED_ARTICLES;
    } catch {
      return SEED_ARTICLES;
    }
  },

  // GET single article by id (MySQL → fallback to seed)
  async getById(id: string) {
    try {
      const data = await api.get(`/articles/${id}`);
      return data;
    } catch {
      const seed = (SEED_ARTICLES as any[]).find(a => a.id === id);
      return seed || null;
    }
  },

  // POST create article
  async create(article: any) {
    return api.post('/articles', article);
  },

  // PUT update article
  async update(id: string, article: any) {
    return api.put(`/articles/${id}`, article);
  },

  // DELETE article
  async remove(id: string) {
    return api.delete(`/articles/${id}`);
  },

  // POST increment view count (non-fatal)
  async incrementViews(id: string) {
    try {
      await api.post(`/articles/${id}/view`, {});
    } catch {
      // non-fatal
    }
  },

  // POST seed articles into MySQL
  async seed(articles: any[]) {
    return api.post('/articles/seed', { articles });
  }
};

export const productsApi = {
  async getAll() {
    try {
      return await api.get('/products');
    } catch {
      return [];
    }
  },
  async create(product: any) {
    return api.post('/products', product);
  },
  async update(id: string, product: any) {
    return api.put(`/products/${id}`, product);
  },
  async remove(id: string) {
    return api.delete(`/products/${id}`);
  },
  async seed(products: any[]) {
    return api.post('/products/seed', { products });
  }
};

export const instructorsApi = {
  async getAll() {
    try {
      const data = await api.get('/instructors');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
  async create(instructor: any) {
    return api.post('/instructors', instructor);
  },
  async update(id: string, instructor: any) {
    return api.put(`/instructors/${id}`, instructor);
  },
  async remove(id: string) {
    return api.delete(`/instructors/${id}`);
  }
};

export const classesApi = {
  async getAll() {
    try {
      const data = await api.get('/classes');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
  async create(onlineClass: any) {
    return api.post('/classes', onlineClass);
  },
  async update(id: string, onlineClass: any) {
    return api.put(`/classes/${id}`, onlineClass);
  },
  async remove(id: string) {
    return api.delete(`/classes/${id}`);
  }
};

export const usersApi = {
  async getAll() {
    try {
      const data = await api.get('/users');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
  async create(user: any) {
    return api.post('/users', user);
  },
  async update(id: string, user: any) {
    return api.put(`/users/${id}`, user);
  },
  async remove(id: string) {
    return api.delete(`/users/${id}`);
  }
};
