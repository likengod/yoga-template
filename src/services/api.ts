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

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 4000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const api = {
  async get(endpoint: string) {
    try {
      const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
        headers: getHeaders()
      }, 4000);
      if (!response.ok) {
        handleAuthError(response.status);
        throw new Error(`GET ${endpoint} failed`);
      }
      const data = await response.json();
      try {
        localStorage.setItem(`cache_${endpoint}`, JSON.stringify(data));
      } catch {}
      return data;
    } catch (err) {
      try {
        const cached = localStorage.getItem(`cache_${endpoint}`);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {}
      throw err;
    }
  },

  async post(endpoint: string, body: any) {
    const isFormData = body instanceof FormData;
    const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: isFormData ? getHeaders(false) : getHeaders(true),
      body: isFormData ? body : JSON.stringify(body)
    }, 6000);
    if (!response.ok) {
      handleAuthError(response.status);
      let errorMsg = `POST ${endpoint} failed`;
      try {
        const errJson = await response.json();
        if (errJson?.error) {
          errorMsg = errJson.error;
          if (Array.isArray(errJson?.details) && errJson.details[0]?.message) {
            errorMsg = errJson.details[0].message;
          }
        }
      } catch {}
      throw new Error(errorMsg);
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
      let errorMsg = `PUT ${endpoint} failed`;
      try {
        const errJson = await response.json();
        if (errJson?.error) errorMsg = errJson.error;
      } catch {}
      throw new Error(errorMsg);
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
      let errorMsg = `DELETE ${endpoint} failed`;
      try {
        const errJson = await response.json();
        if (errJson?.error) errorMsg = errJson.error;
      } catch {}
      throw new Error(errorMsg);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : { success: true };
  }
};
