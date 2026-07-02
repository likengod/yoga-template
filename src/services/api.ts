const API_URL = 'http://localhost:3001/api';

const getHeaders = (hasBody = false) => {
  const token = localStorage.getItem('adminToken');
  const headers: Record<string, string> = {};
  if (hasBody) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error(`GET ${endpoint} failed`);
    return response.json();
  },

  async post(endpoint: string, body: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`POST ${endpoint} failed`);
    return response.json();
  },

  async put(endpoint: string, body: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`PUT ${endpoint} failed`);
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error(`DELETE ${endpoint} failed`);
    return response.json();
  }
};
