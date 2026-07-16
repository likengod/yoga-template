const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = (hasBody = false) => {
  const token = localStorage.getItem('adminToken');
  const headers: Record<string, string> = {};
  if (hasBody) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleAuthError = (status: number) => {
  if (status === 401 || status === 403) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminToken');
    if (window.location.pathname.startsWith('/admin') || window.location.pathname.includes('admin')) {
      window.location.href = '/?session=expired';
    }
  }
};

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      handleAuthError(response.status);
      throw new Error(`GET ${endpoint} failed`);
    }
    return response.json();
  },

  async post(endpoint: string, body: any) {
    const isFormData = body instanceof FormData;
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: isFormData ? getHeaders(false) : getHeaders(true),
      body: isFormData ? body : JSON.stringify(body)
    });
    if (!response.ok) {
      handleAuthError(response.status);
      throw new Error(`POST ${endpoint} failed`);
    }
    return response.json();
  },

  async put(endpoint: string, body: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      handleAuthError(response.status);
      throw new Error(`PUT ${endpoint} failed`);
    }
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) {
      handleAuthError(response.status);
      throw new Error(`DELETE ${endpoint} failed`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : { success: true };
  }
};
