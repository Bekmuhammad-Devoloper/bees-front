import api from './api';
import type { User, PaginatedResponse, UserRole, DashboardStats, RoleRequest, ReviewRoleRequestDto } from '../types';

export const adminService = {
  // ========== DASHBOARD ==========

  // Get dashboard stats
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },

  // Get appointments by status
  getAppointmentsByStatus: async () => {
    const response = await api.get('/admin/appointments/by-status');
    return response.data.data;
  },

  // Get top doctors
  getTopDoctors: async (limit?: number) => {
    const response = await api.get('/admin/top-doctors', { params: { limit } });
    return response.data.data;
  },

  // Get recent appointments
  getRecentAppointments: async (limit?: number) => {
    const response = await api.get('/admin/recent-appointments', { params: { limit } });
    return response.data.data;
  },

  // Get service order stats
  getServiceOrderStats: async () => {
    const response = await api.get('/admin/service-orders/stats');
    return response.data.data;
  },

  // Get home visit stats
  getHomeVisitStats: async () => {
    const response = await api.get('/admin/home-visits/stats');
    return response.data.data;
  },

  // ========== USER MANAGEMENT ==========

  // Get all users
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
  }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/admin/users', { params });
    return response.data.data;
  },

  // Change user role
  changeUserRole: async (id: string, role: UserRole): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/role?role=${role}`);
    return response.data.data;
  },

  // Toggle user status
  toggleUserStatus: async (id: string): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/toggle-status`);
    return response.data.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    console.log('Deleting user with id:', id);
    const response = await api.delete(`/admin/users/${id}`);
    console.log('Delete response:', response);
  },

  // ========== ROLE REQUESTS ==========

  // Get all role requests
  getRoleRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<RoleRequest>> => {
    console.log('Fetching role requests with params:', params);
    const response = await api.get('/admin/role-requests', { params });
    console.log('Role requests API full response:', response);
    console.log('Role requests API response.data:', response.data);
    console.log('Role requests API response.data.data:', response.data?.data);
    return response.data?.data || response.data;
  },

  // Get pending role requests count
  getPendingRoleRequestsCount: async (): Promise<number> => {
    const response = await api.get('/admin/role-requests/pending-count');
    return response.data.data;
  },

  // Review role request
  reviewRoleRequest: async (id: string, data: ReviewRoleRequestDto): Promise<RoleRequest> => {
    console.log('=== FRONTEND: Sending review request ===');
    console.log('Request ID:', id);
    console.log('Data:', JSON.stringify(data));
    try {
      const response = await api.patch(`/admin/role-requests/${id}/review`, data);
      console.log('Review response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Review request error:', error);
      throw error;
    }
  },
};

