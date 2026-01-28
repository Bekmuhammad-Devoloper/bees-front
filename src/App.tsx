import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './components/layout';
import { AdminLayout } from './components/admin';
import { DoctorLayout } from './components/doctor/DoctorLayout';
import { ReceptionLayout } from './components/reception/ReceptionLayout';
import { DriverLayout } from './components/driver/DriverLayout';
import {
  HomePage,
  DoctorsPage,
  DoctorDetailPage,
  AppointmentsPage,
  AppointmentDetailPage,
  ServicesPage,
  ServiceDetailPage,
  ServiceOrdersPage,
  ProfilePage,
  EditProfilePage,
  PrivacyPage,
  NotificationsPage,
  SettingsPage,
  RoleRequestPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  Tahlillar,
} from './pages';
import RegisterPageNew from './pages/Auth/RegisterPageNew';
import {
  AdminDashboard,
  DoctorProfilePage,
  HospitalReferralsPage,
  AdminUsersPage,
  AdminRoleRequestsPage,
  AppointmentsPage as AdminAppointmentsPage,
  DoctorsPage as AdminDoctorsPage,
  CategoriesPage,
  ServicesPage as AdminServicesPage,
  ClinicsPage,
  NotificationsPage as AdminNotificationsPage,
  PatientsPage,
  LaboratoryPage as AdminLaboratoryPage,
  PatronagePage,
  HospitalsPage,
  DocumentsPage,
  AnalyticsPage,
  SettingsPage as AdminSettingsPage,
} from './pages/Admin';
import {
  DoctorDashboard,
  DoctorAppointments,
  DoctorSchedule,
  DoctorProfilePage as DoctorProfilePageNew,
  DoctorSettingsPage,
  DoctorTodayAppointments,
} from './pages/Doctor';
import {
  ReceptionToday,
  ReceptionStats,
  ReceptionHistory,
  ReceptionPatients,
} from './pages/Reception';
import {
  DriverDashboard,
  DriverVisits,
  DriverHistory,
} from './pages/Driver';
import {
  LaboratoryDashboard,
  LaboratoryReferrals,
} from './pages/Laboratory';
import { LaboratoryLayout } from './components/laboratory';
import { useAuthStore, useAppStore, useThemeStore } from './store';
import { authService } from './services';
import { UserRole } from './types';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
};

// Role-based Route wrapper
const RoleRoute: React.FC<{ children: React.ReactNode; allowedRoles: UserRole[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (user && !allowedRoles.includes(user.role as UserRole)) {
    // Redirect to appropriate panel based on role
    const roleRoutes: Record<string, string> = {
      admin: '/admin',
      super_admin: '/admin',
      doctor: '/doctor',
      reception: '/reception',
      driver: '/driver',
      lab_technician: '/laboratory',
      patient: '/',
    };
    return <Navigate to={roleRoutes[user.role] || '/'} replace />;
  }
  
  return <>{children}</>;
};

// Public Route wrapper (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  console.log('PublicRoute check:', { isAuthenticated, user, userRole: user?.role });
  
  if (isAuthenticated && user) {
    // Redirect to appropriate panel based on role
    const roleRoutes: Record<string, string> = {
      admin: '/admin',
      super_admin: '/admin',
      doctor: '/doctor',
      reception: '/reception',
      driver: '/driver',
      lab_technician: '/laboratory',
      patient: '/',
      user: '/',  // user role uchun ham qo'shildi
    };
    const redirectTo = roleRoutes[user.role] || '/';
    console.log('PublicRoute redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { login, logout } = useAuthStore();
  const { setTelegramUser, setLoading } = useAppStore();
  const { fetchThemeFromServer } = useThemeStore();

  useEffect(() => {
    const init = async () => {
      // Initialize Telegram WebApp
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        
        // Set Telegram user
        if (tg.initDataUnsafe?.user) {
          setTelegramUser(tg.initDataUnsafe.user);
        }
        
        // Try to authenticate with Telegram data
        if (tg.initData) {
          await authenticateWithTelegram(tg.initData);
        }
      }
      
      // Serverdan mavzuni olish (admin o'rnatgan mavzu)
      await fetchThemeFromServer();
      
      setLoading(false);
    };
    
    init();
  }, []);

  const authenticateWithTelegram = async (initData: string) => {
    try {
      const response = await authService.validateTelegram(initData);
      if (response.data) {
        login(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
      }
    } catch (error) {
      console.log('Telegram auth failed, user needs to login manually');
    }
  };

  return (
    <Routes>
      {/* Auth routes - har doim ochiq */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

      {/* Main layout routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/doctors"
          element={
            <ProtectedRoute>
              <DoctorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <ServicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tahlillar"
          element={
            <ProtectedRoute>
              <Tahlillar />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Full page routes (without bottom nav) */}
      <Route
        path="/doctors/:id"
        element={
          <ProtectedRoute>
            <DoctorDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services/:id"
        element={
          <ProtectedRoute>
            <ServiceDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/:id"
        element={
          <ProtectedRoute>
            <AppointmentDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-orders"
        element={
          <ProtectedRoute>
            <ServiceOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/role-request"
        element={
          <ProtectedRoute>
            <RoleRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/privacy"
        element={
          <ProtectedRoute>
            <PrivacyPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Panel Routes */}
      <Route 
        path="/admin" 
        element={
          <RoleRoute allowedRoles={['admin', 'super_admin']}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics/dashboard" element={<AdminDashboard />} />
        <Route path="analytics/reports" element={<AdminDashboard />} />
        
        {/* Appointments */}
        <Route path="appointments" element={<AdminAppointmentsPage />} />
        <Route path="appointments/:id" element={<AppointmentDetailPage />} />
        <Route path="appointments/active" element={<AdminAppointmentsPage />} />
        <Route path="appointments/in-progress" element={<AdminAppointmentsPage />} />
        <Route path="appointments/completed" element={<AdminAppointmentsPage />} />
        <Route path="appointments/cancelled" element={<AdminAppointmentsPage />} />
        <Route path="appointments/calendar" element={<AdminAppointmentsPage />} />
        <Route path="appointments/examinations" element={<AdminAppointmentsPage />} />
        
        {/* Doctors */}
        <Route path="doctors" element={<AdminDoctorsPage />} />
        <Route path="doctors/list" element={<AdminDoctorsPage />} />
        <Route path="doctors/add" element={<AdminDoctorsPage />} />
        <Route path="doctors/:id" element={<DoctorProfilePage />} />
        
        {/* Patients */}
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/all" element={<PatientsPage />} />
        <Route path="patients/:id" element={<PatientsPage />} />
        <Route path="patients/my" element={<PatientsPage />} />
        <Route path="patients/prescriptions" element={<PatientsPage />} />
        <Route path="patients/treatment" element={<PatientsPage />} />
        
        {/* Hospitals */}
        <Route path="hospitals" element={<HospitalsPage />} />
        <Route path="hospital/main" element={<HospitalsPage />} />
        <Route path="hospital/referrals" element={<HospitalReferralsPage />} />
        <Route path="hospital/stationary" element={<HospitalReferralsPage />} />
        
        {/* Patronage */}
        <Route path="patronage" element={<PatronagePage />} />
        <Route path="patronage/home-visits" element={<PatronagePage />} />
        <Route path="patronage/drivers" element={<PatronagePage />} />
        
        {/* Laboratory */}
        <Route path="laboratory" element={<AdminLaboratoryPage />} />
        <Route path="laboratory/tests" element={<AdminLaboratoryPage />} />
        <Route path="laboratory/in-progress" element={<AdminLaboratoryPage />} />
        <Route path="laboratory/completed" element={<AdminLaboratoryPage />} />
        <Route path="laboratory/cancelled" element={<AdminLaboratoryPage />} />
        <Route path="laboratory/results" element={<AdminLaboratoryPage />} />
        
        {/* Services & Categories */}
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="services/list" element={<AdminServicesPage />} />
        <Route path="services/orders" element={<AdminServicesPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        
        {/* Clinics */}
        <Route path="clinics" element={<ClinicsPage />} />
        
        {/* Documents */}
        <Route path="documents" element={<DocumentsPage />} />
        
        {/* Users */}
        <Route path="users/role-requests" element={<AdminRoleRequestsPage />} />
        <Route path="users/list" element={<AdminUsersPage />} />
        <Route path="users/:id" element={<AdminUsersPage />} />
        
        {/* Notifications */}
        <Route path="notifications" element={<AdminNotificationsPage />} />
        
        {/* Analytics */}
        <Route path="analytics" element={<AnalyticsPage />} />
        
        {/* Settings */}
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Doctor Panel Routes */}
      <Route 
        path="/doctor" 
        element={
          <RoleRoute allowedRoles={['doctor']}>
            <DoctorLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="today" element={<DoctorTodayAppointments />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="schedule" element={<DoctorSchedule />} />
        <Route path="profile" element={<DoctorProfilePageNew />} />
        <Route path="settings" element={<DoctorSettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Reception Panel Routes */}
      <Route 
        path="/reception" 
        element={
          <RoleRoute allowedRoles={['reception']}>
            <ReceptionLayout />
          </RoleRoute>
        }
      >
        <Route index element={<ReceptionToday />} />
        <Route path="today" element={<ReceptionToday />} />
        <Route path="stats" element={<ReceptionStats />} />
        <Route path="history" element={<ReceptionHistory />} />
        <Route path="patients" element={<ReceptionPatients />} />
      </Route>

      {/* Driver Panel Routes */}
      <Route 
        path="/driver" 
        element={
          <RoleRoute allowedRoles={['driver']}>
            <DriverLayout />
          </RoleRoute>
        }
      >
        <Route index element={<DriverDashboard />} />
        <Route path="visits" element={<DriverVisits />} />
        <Route path="history" element={<DriverHistory />} />
        <Route path="map" element={<DriverVisits />} />
      </Route>

      {/* Laboratory Panel Routes */}
      <Route 
        path="/laboratory" 
        element={
          <RoleRoute allowedRoles={['lab_technician']}>
            <LaboratoryLayout />
          </RoleRoute>
        }
      >
        <Route index element={<LaboratoryDashboard />} />
        <Route path="referrals" element={<LaboratoryReferrals />} />
        <Route path="in-progress" element={<LaboratoryReferrals />} />
        <Route path="completed" element={<LaboratoryReferrals />} />
        <Route path="results" element={<LaboratoryReferrals />} />
        <Route path="settings" element={<LaboratoryDashboard />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
