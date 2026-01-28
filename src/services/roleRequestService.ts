import api from './api';
import type { RoleRequest, CreateRoleRequestDto, ReviewRoleRequestDto, PaginatedResponse } from '../types';

export const roleRequestService = {
  // ========== USER ==========

  // Create a role request
  create: async (data: CreateRoleRequestDto): Promise<RoleRequest> => {
    const response = await api.post('/role-requests', data);
    return response.data.data;
  },

  // Get my role requests
  getMyRequests: async (): Promise<RoleRequest[]> => {
    const response = await api.get('/role-requests/my');
    return response.data.data;
  },

  // Cancel my pending request
  cancel: async (id: string): Promise<void> => {
    await api.delete(`/role-requests/${id}`);
  },

  // ========== ADMIN ==========

  // Get all role requests (admin)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<RoleRequest>> => {
    const response = await api.get('/admin/role-requests', { params });
    return response.data.data;
  },

  // Get pending role requests count
  getPendingCount: async (): Promise<number> => {
    const response = await api.get('/admin/role-requests/pending-count');
    return response.data.data;
  },

  // Review a role request (approve/reject)
  review: async (id: string, data: ReviewRoleRequestDto): Promise<RoleRequest> => {
    const response = await api.patch(`/admin/role-requests/${id}/review`, data);
    return response.data.data;
  },

  // Get role request by id
  getById: async (id: string): Promise<RoleRequest> => {
    const response = await api.get(`/admin/role-requests/${id}`);
    return response.data.data;
  },
};
