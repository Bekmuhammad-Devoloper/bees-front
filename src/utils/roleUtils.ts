import { UserRole } from '../types';

// Rolga qarab bosh sahifa
export const getRoleHomePage = (role?: UserRole): string => {
  switch (role) {
    case 'admin':
    case 'super_admin':
      return '/admin/analytics/dashboard';
    case 'doctor':
      return '/doctor/dashboard';
    case 'reception':
      return '/reception/today';
    case 'driver':
      return '/driver/dashboard';
    case 'user':
    default:
      return '/';
  }
};

// Rolga mos panel nomi
export const getRolePanelName = (role?: UserRole): string => {
  switch (role) {
    case 'admin':
    case 'super_admin':
      return 'Admin Panel';
    case 'doctor':
      return 'Shifokor Paneli';
    case 'reception':
      return 'Qabulxona Paneli';
    case 'driver':
      return 'Haydovchi Paneli';
    case 'user':
    default:
      return 'Bemor Paneli';
  }
};

// Rol tekshirish
export const hasAdminAccess = (role?: UserRole): boolean => {
  return role === 'admin' || role === 'super_admin';
};

export const hasDoctorAccess = (role?: UserRole): boolean => {
  return role === 'doctor' || role === 'admin' || role === 'super_admin';
};

export const hasReceptionAccess = (role?: UserRole): boolean => {
  return role === 'reception' || role === 'admin' || role === 'super_admin';
};

export const hasDriverAccess = (role?: UserRole): boolean => {
  return role === 'driver' || role === 'admin' || role === 'super_admin';
};
