import api from './api';

export const receptionService = {
  // Get today's appointments
  getTodayAppointments: async () => {
    console.log('📡 [ReceptionService] Calling GET /reception/today...');
    try {
      const response = await api.get('/reception/today');
      console.log('📡 [ReceptionService] Full response:', response);
      console.log('📡 [ReceptionService] response.data:', response.data);
      console.log('📡 [ReceptionService] response.data.data:', response.data?.data);
      
      // TransformInterceptor response format: { success, message, data }
      const result = response.data?.data || response.data || [];
      console.log('📡 [ReceptionService] Final result:', result);
      return result;
    } catch (error: any) {
      console.error('❌ [ReceptionService] Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get today's stats
  getTodayStats: async () => {
    console.log('📡 [ReceptionService] Calling GET /reception/stats...');
    try {
      const response = await api.get('/reception/stats');
      console.log('📡 [ReceptionService] Stats response:', response.data);
      return response.data?.data || response.data || {};
    } catch (error: any) {
      console.error('❌ [ReceptionService] Stats Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Register patient arrival
  registerArrival: async (appointmentId: string) => {
    const response = await api.post(`/reception/arrival/${appointmentId}`);
    return response.data.data;
  },

  // Start visit
  startVisit: async (visitId: string) => {
    const response = await api.patch(`/reception/visit/${visitId}/start`);
    return response.data.data;
  },

  // Complete visit
  completeVisit: async (visitId: string) => {
    const response = await api.patch(`/reception/visit/${visitId}/complete`);
    return response.data.data;
  },

  // Mark as no show
  markNoShow: async (appointmentId: string) => {
    const response = await api.patch(`/reception/no-show/${appointmentId}`);
    return response.data.data;
  },

  // Get visit history
  getHistory: async (params?: { page?: number; limit?: number; dateFrom?: string; dateTo?: string }) => {
    const response = await api.get('/reception/history', { params });
    return response.data.data;
  },
};
