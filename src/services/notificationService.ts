import api from './api';
import type { Notification, PaginatedResponse } from '../types';

export const notificationService = {
  // Get my notifications
  getAll: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get('/notifications', { params });
    console.log('Notifications API response:', response.data);
    // Backend returns { notifications: [], total: number, unreadCount: number }
    const result = response.data?.data || response.data;
    const notifications = result?.notifications || result?.data || [];
    const total = result?.total || notifications.length;
    return {
      data: notifications,
      total,
      page: params?.page || 1,
      limit: params?.limit || 20,
      totalPages: Math.ceil(total / (params?.limit || 20)),
      meta: {
        total,
        page: params?.page || 1,
        limit: params?.limit || 20,
        totalPages: Math.ceil(total / (params?.limit || 20)),
      },
    };
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    // Handle different response formats
    const data = response.data?.data || response.data;
    if (typeof data === 'number') return data;
    if (typeof data?.count === 'number') return data.count;
    if (typeof data?.unreadCount === 'number') return data.unreadCount;
    return 0;
  },

  // Mark as read
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  // Delete notification
  delete: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  // ========== ADMIN ==========

  // Create notification (admin)
  create: async (data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    data?: Record<string, any>;
  }): Promise<Notification> => {
    const response = await api.post('/notifications', data);
    return response.data.data;
  },

  // Get all notifications (admin)
  getAllAdmin: async (params?: {
    page?: number;
    limit?: number;
    userId?: string;
  }): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get('/notifications/admin/all', { params });
    return response.data.data;
  },
};
