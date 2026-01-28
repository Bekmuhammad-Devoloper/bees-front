import api from './api';
import type { Category } from '../types';

export const categoryService = {
  // Get all active categories (public)
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data.data;
  },

  // Get category by ID
  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data;
  },

  // ========== ADMIN ==========

  // Get all categories including inactive (admin)
  getAllAdmin: async (): Promise<Category[]> => {
    const response = await api.get('/categories/admin/all');
    return response.data.data;
  },

  // Create category (admin)
  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data.data;
  },

  // Update category (admin)
  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data.data;
  },

  // Toggle category active status (admin)
  toggleActive: async (id: string): Promise<Category> => {
    const response = await api.patch(`/categories/${id}/toggle`);
    return response.data.data;
  },

  // Delete category (admin)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
