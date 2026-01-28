import api from './api';
import type { Doctor, DoctorSchedule, AvailableSlot, PaginatedResponse, DoctorStats, CreateDoctorDto } from '../types';

export const doctorService = {
  // Get all doctors (paginated)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
  }): Promise<PaginatedResponse<Doctor>> => {
    const response = await api.get('/doctors', { params });
    return response.data.data;
  },

  // Get doctor by ID
  getById: async (id: string): Promise<Doctor> => {
    const response = await api.get(`/doctors/${id}`);
    return response.data.data;
  },

  // Get doctor schedule
  getSchedule: async (id: string): Promise<DoctorSchedule[]> => {
    const response = await api.get(`/doctors/${id}/schedule`);
    return response.data.data;
  },

  // Get available slots for a date
  getAvailableSlots: async (id: string, date: string): Promise<AvailableSlot[]> => {
    const response = await api.get(`/doctors/${id}/available-slots`, {
      params: { date },
    });
    return response.data.data;
  },

  // ========== DOCTOR PANEL ==========

  // Get my profile (for doctors)
  getMyProfile: async (): Promise<Doctor> => {
    const response = await api.get('/doctors/me/profile');
    return response.data.data;
  },

  // Get my statistics (for doctors)
  getMyStatistics: async (): Promise<DoctorStats> => {
    const response = await api.get('/doctors/me/statistics');
    return response.data.data;
  },



  // Update my profile (for doctors)
  updateMyProfile: async (data: Partial<Doctor>): Promise<Doctor> => {
    const response = await api.patch('/doctors/me/profile', data);
    return response.data.data;
  },

  // Update my schedule
  updateMySchedule: async (
    scheduleId: string,
    data: Partial<DoctorSchedule>
  ): Promise<DoctorSchedule> => {
    const response = await api.patch(`/doctors/me/schedule/${scheduleId}`, data);
    return response.data.data;
  },

  // ========== ADMIN ==========

  // Create doctor (admin)
  create: async (data: CreateDoctorDto): Promise<Doctor> => {
    const response = await api.post('/doctors', data);
    return response.data.data;
  },

  // Update doctor (admin)
  update: async (id: string, data: Partial<Doctor>): Promise<Doctor> => {
    const response = await api.patch(`/doctors/${id}`, data);
    return response.data.data;
  },

  // Delete doctor (admin)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/doctors/${id}`);
  },
};
