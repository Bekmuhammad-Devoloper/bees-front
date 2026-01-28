import api from './api';
import type { HomeVisit, Driver, PaginatedResponse, HomeVisitStatus } from '../types';

export const driverService = {
  // ========== DRIVER PANEL ==========

  // Get my visits
  getMyVisits: async (): Promise<HomeVisit[]> => {
    const response = await api.get('/driver/my-visits');
    return response.data.data;
  },

  // Get today's visits
  getTodayVisits: async (): Promise<HomeVisit[]> => {
    const response = await api.get('/driver/today');
    return response.data.data;
  },

  // Get stats
  getStats: async () => {
    const response = await api.get('/driver/stats');
    return response.data.data;
  },

  // Update availability
  updateAvailability: async (isAvailable: boolean, driverId?: string) => {
    const response = await api.patch('/driver/availability', {
      isAvailable,
      driverId,
    });
    return response.data.data;
  },

  // Start trip
  startTrip: async (id: string): Promise<HomeVisit> => {
    const response = await api.patch(`/driver/visit/${id}/start`);
    return response.data.data;
  },

  // Mark arrived
  markArrived: async (id: string): Promise<HomeVisit> => {
    const response = await api.patch(`/driver/visit/${id}/arrived`);
    return response.data.data;
  },

  // Complete visit
  completeVisit: async (id: string): Promise<HomeVisit> => {
    const response = await api.patch(`/driver/visit/${id}/complete`);
    return response.data.data;
  },

  // Start visit
  startVisit: async (id: string): Promise<HomeVisit> => {
    const response = await api.patch(`/driver/visit/${id}/start`);
    return response.data.data;
  },

  // Cancel visit
  cancelVisit: async (id: string): Promise<HomeVisit> => {
    const response = await api.patch(`/driver/visit/${id}/cancel`);
    return response.data.data;
  },

  // Get visit history
  getVisitHistory: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<HomeVisit>> => {
    const response = await api.get('/driver/history', { params });
    return response.data.data;
  },

  // ========== ADMIN/RECEPTION ==========

  // Get available drivers
  getAvailableDrivers: async (): Promise<Driver[]> => {
    const response = await api.get('/driver/available');
    return response.data.data;
  },

  // Get all drivers (admin)
  getAllDrivers: async (): Promise<Driver[]> => {
    const response = await api.get('/driver/all');
    return response.data.data;
  },

  // Get pending home visits
  getPendingHomeVisits: async (): Promise<HomeVisit[]> => {
    const response = await api.get('/driver/home-visits/pending');
    return response.data.data;
  },

  // Create home visit
  createHomeVisit: async (data: {
    userId: string;
    address: string;
    scheduledDate: string;
    scheduledTime: string;
    notes?: string;
  }): Promise<HomeVisit> => {
    const response = await api.post('/driver/home-visits', data);
    return response.data.data;
  },

  // Assign driver
  assignDriver: async (visitId: string, driverId: string): Promise<HomeVisit> => {
    const response = await api.patch(`/driver/home-visits/${visitId}/assign`, {
      driverId,
    });
    return response.data.data;
  },

  // Create driver (admin) - backend CreateDriverDto: userId, carNumber?, carModel?, licenseNumber?
  createDriver: async (data: {
    userId: string;
    carNumber?: string;
    carModel?: string;
    licenseNumber?: string;
  }): Promise<Driver> => {
    const response = await api.post('/driver', data);
    return response.data.data;
  },
};
