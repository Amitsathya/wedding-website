import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('authToken') 
      : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Authentication
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  logout: () => apiClient.post('/api/auth/logout'),
  me: () => apiClient.get('/api/auth/me'),

  // Guests
  getGuests: () => apiClient.get('/api/guests'),
  importGuests: (formData) => apiClient.post('/api/guests/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // RSVP
  getRsvp: (token) => apiClient.get(`/api/rsvp/${token}`),
  submitRsvp: (token, data) => apiClient.post(`/api/rsvp/${token}/submit`, data),
  getRsvps: () => apiClient.get('/api/rsvps'),
  exportRsvps: () => apiClient.get('/api/rsvps/export', { responseType: 'blob' }),
  
  // Photos
  getPhotos: () => apiClient.get('/api/photos'),
  getUploadUrl: (fileData) => apiClient.post('/api/photos/upload-url', fileData),
  completeUpload: (data) => apiClient.post('/api/photos/complete', data),
  
  // Admin
  getAdminPhotos: () => apiClient.get('/api/admin/photos'),
  getPendingPhotos: () => apiClient.get('/api/admin/photos/pending'),
  approvePhoto: (photoId) => apiClient.patch(`/api/admin/photos/${photoId}/approve`),
  rejectPhoto: (photoId) => apiClient.patch(`/api/admin/photos/${photoId}/reject`),
  deletePhoto: (photoId) => apiClient.delete(`/api/admin/photos/${photoId}`),
  
  
  // Messages
  sendReminders: () => apiClient.post('/api/reminders/send'),
  sendInvites: (guestIds) => apiClient.post('/api/invites/send', { guestIds }),
};