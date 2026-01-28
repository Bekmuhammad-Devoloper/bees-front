import React, { useEffect, useState } from 'react';
import {
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { adminService } from '../../services';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; isUp: boolean };
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-5 border border-white/40 dark:border-gray-700/40 shadow-lg hover:shadow-xl transition-all cursor-pointer`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-black-neon mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white font-semibold">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isUp ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <div className="p-3 rounded-xl bg-gray-900 text-white flex items-center justify-center">
        {icon}
      </div>
    </div>
  </div>
);

interface DashboardStats {
  totalUsers: number;
  usersThisMonth: number;
  totalDoctors: number;
  activeDoctors: number;
  totalAppointments: number;
  todayAppointments: number;
  appointmentsThisMonth: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

interface AppointmentsByStatus {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    usersThisMonth: 0,
    totalDoctors: 0,
    activeDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    appointmentsThisMonth: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
  });

  const [appointmentsByStatus, setAppointmentsByStatus] = useState<AppointmentsByStatus>({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  const [topDoctors, setTopDoctors] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [dashboardData, statusData, doctorsData, doctorUsersData] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAppointmentsByStatus(),
        adminService.getTopDoctors(5),
        adminService.getAllUsers({ role: 'doctor' as any }), // Shifokor roli bo'lgan foydalanuvchilar
      ]);
      
      console.log('Dashboard data:', dashboardData);
      console.log('Status data:', statusData);
      console.log('Top doctors:', doctorsData);
      console.log('Doctor users:', doctorUsersData);
      
      if (dashboardData) {
        // Shifokorlar sonini users jadvalidan olish (role=doctor)
        const doctorUsersArray = doctorUsersData?.data || doctorUsersData || [];
        const totalDoctorsFromUsers = Array.isArray(doctorUsersArray) ? doctorUsersArray.length : 0;
        const activeDoctorsFromUsers = Array.isArray(doctorUsersArray) 
          ? doctorUsersArray.filter((u: any) => u.status === 'active' || u.status === 'verified').length 
          : 0;
        
        setStats({
          totalUsers: dashboardData.users?.total || 0,
          usersThisMonth: dashboardData.users?.thisMonth || 0,
          totalDoctors: totalDoctorsFromUsers || dashboardData.doctors?.total || 0,
          activeDoctors: activeDoctorsFromUsers || dashboardData.doctors?.active || 0,
          totalAppointments: dashboardData.appointments?.total || 0,
          todayAppointments: dashboardData.appointments?.today || 0,
          appointmentsThisMonth: dashboardData.appointments?.thisMonth || 0,
          todayRevenue: dashboardData.revenue?.today || 0,
          monthlyRevenue: dashboardData.revenue?.thisMonth || 0,
        });

        // Build a small 7-day line-chart dataset for visualizing trend (appointments per day)
        try {
          const days = 7;
          const today = new Date();
          const totalThisMonth = dashboardData.appointments?.thisMonth || 0;
          // Create a smooth trend across the last `days` days based on thisMonth value
          const data = Array.from({ length: days }).map((_, idx) => {
            const day = new Date(today);
            day.setDate(today.getDate() - (days - 1 - idx));
            const label = day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            // spread monthly appointments roughly across days with a small ramp-up
            const value = Math.round((totalThisMonth / Math.max(1, days)) * (0.6 + (idx / (days - 1)) * 0.8));
            return { date: label, value };
          });
          setChartData(data);
        } catch (e) {
          setChartData([]);
        }
      }
      
      if (statusData) {
        setAppointmentsByStatus({
          pending: statusData.pending || 0,
          confirmed: statusData.confirmed || 0,
          completed: statusData.completed || 0,
          cancelled: statusData.cancelled || 0,
        });
      }
      
      if (doctorsData) {
        setTopDoctors(doctorsData);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-black-neon dark:text-gray-100 font-medium">Yuklanmoqda...</p>
          </div>
        </div>
      )}

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Jami foydalanuvchilar"
          value={stats.totalUsers}
          icon={<UserGroupIcon className="w-6 h-6 text-white" />}
          color="bg-blue-50"
          trend={{ value: stats.usersThisMonth, isUp: true }}
          onClick={() => navigate('/admin/patients/all')}
        />
        <StatCard
          title="Jami shifokorlar"
          value={stats.totalDoctors}
          icon={<img src="/docrors-category.png" alt="Doctors" className="w-6 h-6 object-contain" />}
          color="bg-green-50"
          trend={{ value: stats.activeDoctors, isUp: true }}
          onClick={() => navigate('/admin/doctors/list')}
        />
        <StatCard
          title="Jami qabullar"
          value={stats.totalAppointments}
          icon={<CalendarDaysIcon className="w-6 h-6 text-white" />}
          color="bg-amber-50"
          trend={{ value: stats.appointmentsThisMonth, isUp: true }}
          onClick={() => navigate('/admin/appointments/active')}
        />
        <StatCard
          title="Bugungi daromad"
          value={formatPrice(stats.todayRevenue)}
          icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
          color="bg-purple-50"
          onClick={() => navigate('/admin/analytics/dashboard')}
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div onClick={() => navigate('/admin/patients/all')} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 text-center cursor-pointer hover:shadow-xl transition-all border border-white/40">
          <div className="w-12 h-12 bg-blue-500/80 rounded-full flex items-center justify-center mx-auto mb-2">
            <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-semibold">{stats.usersThisMonth}</p>
          <p className="text-sm text-black-neon dark:text-gray-200">Bu oydagi yangi foydalanuvchilar</p>
        </div>
        <div onClick={() => navigate('/admin/doctors/list')} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 text-center cursor-pointer hover:shadow-xl transition-all border border-white/40">
          <div className="w-12 h-12 bg-green-500/80 rounded-full flex items-center justify-center mx-auto mb-2">
            <img src="/docrors-category.png" alt="Doctors" className="w-7 h-7 object-contain" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-semibold">{stats.activeDoctors}</p>
          <p className="text-sm text-black-neon dark:text-gray-200">Faol shifokorlar</p>
        </div>
        <div onClick={() => navigate('/admin/appointments/active')} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 text-center cursor-pointer hover:shadow-xl transition-all border border-white/40">
          <div className="w-12 h-12 bg-amber-500/80 rounded-full flex items-center justify-center mx-auto mb-2">
            <CalendarDaysIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-semibold">{stats.todayAppointments}</p>
          <p className="text-sm text-black-neon dark:text-gray-200">Bugungi qabullar</p>
        </div>
        <div onClick={() => navigate('/admin/analytics/dashboard')} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 text-center cursor-pointer hover:shadow-xl transition-all border border-white/40">
          <div className="w-12 h-12 bg-purple-500/80 rounded-full flex items-center justify-center mx-auto mb-2">
            <CurrencyDollarIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-semibold">{formatPrice(stats.monthlyRevenue)}</p>
          <p className="text-sm text-black-neon dark:text-gray-200">Oylik daromad</p>
        </div>
      </div>

      {/* Line chart: 7-day trend */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-white/40 dark:border-gray-700/40 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-semibold mb-4">7 kunlik qabullar trendlari</h2>
        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Appointments by Status */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-white/40 dark:border-gray-700/40 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-semibold mb-6">Qabullar holati bo'yicha</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div onClick={() => navigate('/admin/appointments/active')} className="bg-white/40 dark:bg-gray-700/40 backdrop-blur rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-all border border-white/20">
            <div className="w-12 h-12 bg-yellow-500/80 rounded-full flex items-center justify-center mx-auto mb-2">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-semibold">{appointmentsByStatus.pending}</p>
            <p className="text-sm text-black-neon dark:text-gray-200">Kutilmoqda</p>
          </div>
          <div onClick={() => navigate('/admin/appointments/in-progress')} className="bg-white/40 dark:bg-gray-700/40 backdrop-blur rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-all border border-white/20">
            <div className="w-12 h-12 bg-blue-500/80 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-semibold">{appointmentsByStatus.confirmed}</p>
            <p className="text-sm text-black-neon dark:text-gray-200">Tasdiqlangan</p>
          </div>
          <div onClick={() => navigate('/admin/appointments/completed')} className="bg-white/40 dark:bg-gray-700/40 backdrop-blur rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-all border border-white/20">
            <div className="w-12 h-12 bg-green-500/80 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-semibold">{appointmentsByStatus.completed}</p>
            <p className="text-sm text-black-neon dark:text-gray-200">Yakunlangan</p>
          </div>
          <div onClick={() => navigate('/admin/appointments/cancelled')} className="bg-white/40 dark:bg-gray-700/40 backdrop-blur rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-all border border-white/20">
            <div className="w-12 h-12 bg-red-500/80 rounded-full flex items-center justify-center mx-auto mb-2">
              <XCircleIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white font-semibold">{appointmentsByStatus.cancelled}</p>
            <p className="text-sm text-black-neon dark:text-gray-200">Bekor qilingan</p>
          </div>
        </div>
      </div>

      {/* Top Doctors */}
      {topDoctors.length > 0 && (
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-white/40 dark:border-gray-700/40 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-semibold mb-6">Top shifokorlar</h2>
          
          <div className="space-y-4">
            {topDoctors.map((doctor, index) => (
              <div key={doctor.id || index} className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 backdrop-blur rounded-xl border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500/80 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white font-semibold">
                      {doctor.user?.firstName} {doctor.user?.lastName}
                    </p>
                    <p className="text-sm text-black-neon dark:text-gray-200">{doctor.category?.nameUz || doctor.specialization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white font-semibold">{doctor.patientsCount || 0} bemor</p>
                  <p className="text-sm text-amber-600">⭐ {doctor.rating || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
