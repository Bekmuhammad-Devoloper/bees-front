import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// Development: proxy orqali, Production: to'g'ridan-to'g'ri
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Telegram WebApp init data if available
    if (window.Telegram?.WebApp?.initData) {
      config.headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Auth endpointlari uchun redirect qilmaslik
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
    
    // Handle 401 errors - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          useAuthStore.getState().setTokens(accessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          // No refresh token - logout
          useAuthStore.getState().logout();
          window.location.href = '/auth/login';
        }
      } catch (refreshError) {
        // Refresh failed - logout and redirect
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 401 on retry - force logout (faqat auth endpoint emas)
    if (error.response?.status === 401 && originalRequest._retry && !isAuthEndpoint) {
      useAuthStore.getState().logout();
      window.location.href = '/auth/login';
    }

    // Handle 403 (forbidden) - user might be deleted or blocked (faqat auth endpoint emas)
    if (error.response?.status === 403 && !isAuthEndpoint) {
      const message = (error.response?.data as any)?.message || '';
      if (message.includes('o\'chirilgan') || message.includes('bloklangan') || message.includes('deleted') || message.includes('blocked')) {
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API helper functions
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string }>;
    return axiosError.response?.data?.message || axiosError.message || 'Xatolik yuz berdi';
  }
  return 'Noma\'lum xatolik';
};
