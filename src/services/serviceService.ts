import api from './api';
import type { Service, ServiceOrder, ServiceOrderStatus, ServiceType, PaginatedResponse } from '../types';

export const serviceService = {
  // ========== PUBLIC ==========

  // Get all services
  getAll: async (type?: ServiceType): Promise<Service[]> => {
    const response = await api.get('/services', { params: { type } });
    return response.data?.data || response.data || [];
  },

  // Get service by ID
  getById: async (id: string): Promise<Service> => {
    const response = await api.get(`/services/${id}`);
    return response.data?.data || response.data;
  },

  // ========== USER ==========

  // Create order
  createOrder: async (data: {
    serviceId: string;
    startDate?: string;
    scheduledDate?: string;
    address?: string;
    notes?: string;
  }): Promise<ServiceOrder> => {
    // Backend startDate kutadi
    const payload = {
      serviceId: data.serviceId,
      startDate: data.startDate || data.scheduledDate,
      address: data.address,
      notes: data.notes,
    };
    const response = await api.post('/services/orders', payload);
    return response.data.data;
  },

  // Get my orders
  getMyOrders: async (params?: {
    status?: ServiceOrderStatus;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ServiceOrder>> => {
    const response = await api.get('/services/orders/my', { params });
    return response.data.data;
  },

  // Cancel my order
  cancelMyOrder: async (id: string): Promise<ServiceOrder> => {
    const response = await api.patch(`/services/orders/my/${id}/cancel`);
    return response.data.data;
  },

  // ========== ADMIN ==========

  // Create service (admin)
  create: async (data: Partial<Service>): Promise<Service> => {
    const response = await api.post('/services', data);
    return response.data.data;
  },

  // Update service (admin)
  update: async (id: string, data: Partial<Service>): Promise<Service> => {
    const response = await api.patch(`/services/${id}`, data);
    return response.data.data;
  },

  // Delete service (admin)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },

  // Get all orders (admin)
  getAllOrders: async (params?: {
    status?: ServiceOrderStatus;
    serviceType?: ServiceType;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ServiceOrder>> => {
    const response = await api.get('/services/orders/all', { params });
    return response.data.data;
  },

  // Get order by ID (admin)
  getOrderById: async (id: string): Promise<ServiceOrder> => {
    const response = await api.get(`/services/orders/${id}`);
    return response.data.data;
  },
};
