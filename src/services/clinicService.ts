import api from './api';
import type { Clinic, PaginatedResponse } from '../types';

export const clinicService = {
  // Get all clinics (public)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Clinic>> => {
    const response = await api.get('/clinics', { params });
    return response.data.data;
  },

  // Get clinic by ID
  getById: async (id: string): Promise<Clinic> => {
    const response = await api.get(`/clinics/${id}`);
    return response.data.data;
  },

  // ========== ADMIN ==========

  // Create clinic (admin)
  create: async (data: Partial<Clinic>): Promise<Clinic> => {
    const response = await api.post('/clinics', data);
    return response.data.data;
  },

  // Update clinic (admin)
  update: async (id: string, data: Partial<Clinic>): Promise<Clinic> => {
    const response = await api.patch(`/clinics/${id}`, data);
    return response.data.data;
  },

  // Delete clinic (admin)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/clinics/${id}`);
  },
};
