import api from './api';
import type { User, PaginatedResponse } from '../types';

export const userService = {
  // Get my profile
  getMe: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data.data;
  },

  // Update my profile
  updateMe: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch('/users/me', data);
    return response.data.data;
  },

  // ========== ADMIN ==========

  // Get all users (admin)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params });
    return response.data.data;
  },

  // Get user by ID (admin)
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  // Update user (admin)
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data.data;
  },

  // Delete user (admin)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
