import api from './api';
import type { AuthResponse, LoginDto, RegisterDto, User } from '../types';

export const authService = {
  // Register new user - Step 1: send OTP (user is NOT created yet)
  register: async (data: RegisterDto): Promise<{ message: string; code?: string }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Register new user - Step 2: verify OTP and create user
  verifyRegister: async (data: { phone: string; code: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register-verify', data);
    return response.data;
  },

  // Login with OTP (Step 2: verify OTP and get tokens)
  login: async (data: { phone: string; code: string }): Promise<AuthResponse> => {
    console.log('Login request:', data);
    const response = await api.post('/auth/login', data);
    console.log('Login response:', response.data);
    return response.data;
  },

  // Send OTP for login (existing users)
  sendLoginOtp: async (phone: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/login-otp', { phone });
    return response.data;
  },

  // Send OTP for registration/general
  sendOtp: async (phone: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
  },

  // Reset password with OTP
  resetPassword: async (phone: string, code: string, newPassword: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/reset-password', { phone, code, newPassword });
    return response.data.data;
  },

  // Refresh tokens
  refreshTokens: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  // Validate Telegram WebApp initData
  validateTelegram: async (initData: string): Promise<{ data: AuthResponse | null }> => {
    try {
      const response = await api.post('/auth/telegram', { initData });
      return response.data;
    } catch (error) {
      // If telegram auth endpoint doesn't exist, return null
      return { data: null };
    }
  },
};

