import axios from 'axios';

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

// Response interceptor to handle errors consistently
api.interceptors.response.use(
  (response) => {
    // For successful responses (2xx), always return as success
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    
    // Only convert to error if success is explicitly false
    if (response.data && response.data.success === false) {
      return Promise.reject({
        response: {
          data: {
            error: response.data.error || response.data.message || 'Operation failed'
          }
        }
      });
    }
    return response;
  },
  (error) => {
    // Pass through the original error object
    return Promise.reject(error);
  }
);

// Account API
export const accountService = {
  deleteAccount: () => api.delete('/auth/me'),
};

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

  getDocument: (id: string | number) => {
    // Ensure id is a number
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      throw new Error('Invalid document ID');
    }
    return api.get(`/documents/${numericId}`);
  },

  createDocument: (data: { title: string; content: string; isPublic: boolean }) =>
    api.post('/documents', data),

  updateDocument: (id: string | number, data: { title?: string; content?: string; isPublic?: boolean }) => {
    // Ensure id is a number
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      throw new Error('Invalid document ID');
    }
    return api.put(`/documents/${numericId}`, data);
  },

  deleteDocument: (id: string | number) => {
    // Ensure id is a number
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      throw new Error('Invalid document ID');
    }
    return api.delete(`/documents/${numericId}`);
  },

  searchDocuments: (query: string, params?: { page?: number; limit?: number }) =>
    api.get('/documents', { params: { search: query, ...params } }),

  shareDocument: (id: string | number, data: { userId: string; permission: 'VIEW' | 'EDIT' }) => {
    // Ensure id is a number
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      throw new Error('Invalid document ID');
    }
    return api.post(`/documents/${numericId}/share`, data);
  },

  removeShare: (id: string | number, userId: string) => {
    // Ensure id is a number
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      throw new Error('Invalid document ID');
    }
    return api.delete(`/documents/${numericId}/share`, { data: { userId } });
  },

  getVersions: (id: string | number) => {
    // Ensure id is a number
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      throw new Error('Invalid document ID');
    }
    return api.get(`/documents/${numericId}/versions`);
  },

  getVersion: (id: string | number, versionId: string) => {
    // Ensure id is a number
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      throw new Error('Invalid document ID');
    }
    return api.get(`/documents/${numericId}/versions/${versionId}`);
  },
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