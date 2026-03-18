/**
 * API Services - Centralized API calls for all features
 */

import apiClient from './client';

/**
 * Authentication API
 */
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  me: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh')
};

/**
 * JSA (Job Safety Analysis) API
 */
export const jsaAPI = {
  list: (params) => apiClient.get('/jsa', { params }),
  create: (data) => apiClient.post('/jsa', data),
  get: (id) => apiClient.get(`/jsa/${id}`),
  update: (id, data) => apiClient.put(`/jsa/${id}`, data),
  delete: (id) => apiClient.delete(`/jsa/${id}`),
  approve: (id) => apiClient.post(`/jsa/${id}/approve`),
  reject: (id, reason) => apiClient.post(`/jsa/${id}/reject`, { reason }),
  exportPDF: (id) => apiClient.get(`/jsa/${id}/export-pdf`, { responseType: 'blob' })
};

/**
 * LOTO (Lockout/Tagout) API
 */
export const lotoAPI = {
  list: (params) => apiClient.get('/loto', { params }),
  create: (data) => apiClient.post('/loto', data),
  get: (id) => apiClient.get(`/loto/${id}`),
  update: (id, data) => apiClient.put(`/loto/${id}`, data),
  delete: (id) => apiClient.delete(`/loto/${id}`),
  verify: (id, data) => apiClient.post(`/loto/${id}/verify`, data),
  exportPDF: (id) => apiClient.get(`/loto/${id}/export-pdf`, { responseType: 'blob' })
};

/**
 * Injury/Illness Reporting API
 */
export const injuryAPI = {
  list: (params) => apiClient.get('/injury', { params }),
  create: (data) => apiClient.post('/injury', data),
  get: (id) => apiClient.get(`/injury/${id}`),
  update: (id, data) => apiClient.put(`/injury/${id}`, data),
  delete: (id) => apiClient.delete(`/injury/${id}`),
  investigate: (id, data) => apiClient.post(`/injury/${id}/investigate`, data),
  close: (id, data) => apiClient.post(`/injury/${id}/close`, data),
  exportPDF: (id) => apiClient.get(`/injury/${id}/export-pdf`, { responseType: 'blob' })
};

/**
 * Facilities API
 */
export const facilityAPI = {
  list: (params) => apiClient.get('/facilities', { params }),
  create: (data) => apiClient.post('/facilities', data),
  get: (id) => apiClient.get(`/facilities/${id}`),
  update: (id, data) => apiClient.put(`/facilities/${id}`, data),
  delete: (id) => apiClient.delete(`/facilities/${id}`),
  inspections: (id) => apiClient.get(`/facilities/${id}/inspections`)
};

/**
 * Equipment API
 */
export const equipmentAPI = {
  list: (params) => apiClient.get('/equipment', { params }),
  create: (data) => apiClient.post('/equipment', data),
  get: (id) => apiClient.get(`/equipment/${id}`),
  update: (id, data) => apiClient.put(`/equipment/${id}`, data),
  delete: (id) => apiClient.delete(`/equipment/${id}`)
};

/**
 * Action Items API
 */
export const actionItemsAPI = {
  list: (params) => apiClient.get('/action-items', { params }),
  create: (data) => apiClient.post('/action-items', data),
  get: (id) => apiClient.get(`/action-items/${id}`),
  update: (id, data) => apiClient.put(`/action-items/${id}`, data),
  delete: (id) => apiClient.delete(`/action-items/${id}`),
  assign: (id, assigneeId) => apiClient.post(`/action-items/${id}/assign`, { assignee_id: assigneeId }),
  complete: (id) => apiClient.post(`/action-items/${id}/complete`)
};

/**
 * Dashboard/Analytics API
 */
export const dashboardAPI = {
  summary: () => apiClient.get('/dashboard/summary'),
  stats: (period = 'month') => apiClient.get('/dashboard/stats', { params: { period } }),
  recentActivity: (limit = 10) => apiClient.get('/dashboard/recent', { params: { limit } }),
  overallStatus: () => apiClient.get('/dashboard/status')
};

/**
 * File Upload API
 */
export const fileAPI = {
  uploadPhoto: (formData) => apiClient.post('/uploads/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadDocument: (formData) => apiClient.post('/uploads/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default {
  auth: authAPI,
  jsa: jsaAPI,
  loto: lotoAPI,
  injury: injuryAPI,
  facilities: facilityAPI,
  equipment: equipmentAPI,
  actionItems: actionItemsAPI,
  dashboard: dashboardAPI,
  files: fileAPI
};
