import api from './api';
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentDto,
  PaginatedResponse,
} from '../types';

export const appointmentService = {
  // ========== USER ==========

  // Create appointment
  create: async (data: CreateAppointmentDto): Promise<Appointment> => {
    const response = await api.post('/appointments', data);
    return response.data.data;
  },

  // Get my appointments
  getMyAppointments: async (params?: {
    status?: AppointmentStatus;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Appointment>> => {
    const response = await api.get('/appointments/my', { params });
    return response.data.data;
  },

  // Get my appointment by ID
  getMyAppointmentById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/my/${id}`);
    return response.data.data;
  },

  // Cancel my appointment
  cancelMyAppointment: async (id: string, reason?: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/my/${id}/cancel`, { reason });
    return response.data.data;
  },

  // ========== DOCTOR ==========

  // Get doctor appointments
  getDoctorAppointments: async (params?: {
    status?: AppointmentStatus;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Appointment>> => {
    const response = await api.get('/appointments/doctor', { params });
    return response.data.data;
  },

  // Get today's stats
  getDoctorTodayStats: async () => {
    const response = await api.get('/appointments/doctor/today');
    return response.data.data;
  },

  // Get monthly stats
  getDoctorMonthlyStats: async () => {
    const response = await api.get('/appointments/doctor/monthly-stats');
    return response.data.data;
  },

  // Confirm appointment
  confirmAppointment: async (id: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/doctor/${id}/confirm`);
    return response.data.data;
  },

  // Reject appointment
  rejectAppointment: async (id: string, reason: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/doctor/${id}/reject`, { reason });
    return response.data.data;
  },

  // Complete appointment
  completeAppointment: async (id: string, doctorNotes?: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/doctor/${id}/complete`, { doctorNotes });
    return response.data.data;
  },

  // Start appointment (in_progress)
  startAppointment: async (id: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/doctor/${id}/start`);
    return response.data.data;
  },

  // ========== ADMIN/RECEPTION ==========

  // Get all appointments
  getAllAppointments: async (params?: {
    status?: AppointmentStatus;
    doctorId?: string;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Appointment>> => {
    const response = await api.get('/appointments', { params });
    return response.data.data;
  },

  // Get appointment by ID (admin)
  getAppointmentById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data.data;
  },
};
