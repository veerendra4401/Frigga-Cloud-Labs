import axios from 'axios';
// Account API
export const accountService = {
  deleteAccount: () => api.delete('/auth/me'),
};

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authService = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  getCurrentUser: () => api.get('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

// Documents API
export const documentService = {
  getDocuments: (page = 1, limit = 10, search = '') =>
    api.get('/documents', { params: { page, limit, search } }),

  getDocument: (id: string) => api.get(`/documents/${id}`),

  createDocument: (data: { title: string; content: string; isPublic: boolean }) =>
    api.post('/documents', data),

  updateDocument: (id: string, data: { title?: string; content?: string; isPublic?: boolean }) =>
    api.put(`/documents/${id}`, data),

  deleteDocument: (id: string) => api.delete(`/documents/${id}`),

  searchDocuments: (query: string, params?: { page?: number; limit?: number }) =>
    api.get('/documents', { params: { search: query, ...params } }),

  shareDocument: (id: string, data: { userId: string; permission: 'VIEW' | 'EDIT' }) =>
    api.post(`/documents/${id}/share`, data),

  removeShare: (id: string, userId: string) =>
    api.delete(`/documents/${id}/share`, { data: { userId } }),

  getVersions: (id: string) => api.get(`/documents/${id}/versions`),

  getVersion: (id: string, versionId: string) =>
    api.get(`/documents/${id}/versions/${versionId}`),
};

// Users API
export const userService = {
  getUsers: () => api.get('/users'),

  getUser: (id: string) => api.get(`/users/${id}`),

  updateProfile: (data: { name?: string; email?: string }) =>
    api.put('/users/profile', data),

  getNotifications: () => api.get('/users/notifications'),

  markNotificationRead: (id: string) =>
    api.put(`/users/notifications/${id}/read`),
};

// Legacy exports for backward compatibility
export const authAPI = authService;
export const documentsAPI = documentService;
export const usersAPI = userService;