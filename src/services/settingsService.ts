import api from './api';

export interface GlobalSettings {
  theme: 'light' | 'dark' | 'system';
  language?: string;
}

export const settingsService = {
  // Global sozlamalarni olish (Public)
  getGlobalSettings: async (): Promise<GlobalSettings> => {
    const response = await api.get('/settings/global');
    return response.data.data;
  },

  // Temani olish (Public)
  getTheme: async (): Promise<string> => {
    const response = await api.get('/settings/theme');
    return response.data.data.theme;
  },

  // Global sozlamalarni saqlash (Admin)
  saveGlobalSettings: async (settings: GlobalSettings): Promise<GlobalSettings> => {
    const response = await api.patch('/settings/global', settings);
    return response.data.data;
  },

  // Temani o'zgartirish (Admin)
  setTheme: async (theme: string): Promise<string> => {
    const response = await api.post('/settings/theme', { theme });
    return response.data.data.theme;
  },
};
