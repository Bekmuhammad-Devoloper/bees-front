import { useEffect, useState } from 'react';
import {
  CalendarDaysIcon,
  UsersIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

interface DashboardStats {
  users: { total: number; thisMonth: number };
  doctors: { total: number; active: number };
  appointments: { total: number; today: number; thisMonth: number };
  revenue: { today: number; thisMonth: number };
}

interface AppointmentsByStatus {
  [key: string]: number;
}

interface CategoryStat {
  name: string;
  doctorsCount: number;
  color: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Kutilmoqda',
  confirmed: 'Tasdiqlangan',
  completed: 'Tugallangan',
  cancelled: 'Bekor qilingan',
  rejected: 'Rad etilgan',
};

export function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointmentsByStatus, setAppointmentsByStatus] = useState<{ name: string; value: number; color: string }[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [dashboardRes, statusRes, categoriesRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/appointments/by-status'),
        api.get('/categories/admin/all'),
      ]);
      
      // Dashboard stats
      const dashData = dashboardRes.data?.data || dashboardRes.data || {};
      setStats(dashData);
      
      // Appointments by status for pie chart
      const statusData: AppointmentsByStatus = statusRes.data?.data || statusRes.data || {};
      const statusChartData = Object.entries(statusData).map(([status, count], index) => ({
        name: STATUS_LABELS[status] || status,
        value: count as number,
        color: COLORS[index % COLORS.length],
      }));
      setAppointmentsByStatus(statusChartData);
      
      // Categories for bar chart
      const categories = categoriesRes.data?.data || categoriesRes.data || [];
      if (Array.isArray(categories)) {
        const catWithColors = categories.slice(0, 8).map((cat: { nameUz?: string; name?: string; doctorsCount?: number }, index: number) => ({
          name: cat.nameUz || cat.name || `Kategoriya ${index + 1}`,
          doctorsCount: cat.doctorsCount || 0,
          color: COLORS[index % COLORS.length],
        }));
        setCategoryStats(catWithColors);
      }
      
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('uz-UZ').format(value) + " so'm";
  };

  // Calculate total doctors for percentage
  const totalDoctors = categoryStats.reduce((sum, cat) => sum + cat.doctorsCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Analitika</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Jami qabullar</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.appointments?.total || 0}</p>
              <p className="text-sm text-blue-600 mt-2">Bugun: {stats?.appointments?.today || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
              <CalendarDaysIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Jami bemorlar</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
              <p className="text-sm text-green-600 mt-2">Bu oy: +{stats?.users?.thisMonth || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100 text-green-600">
              <UsersIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Shifokorlar</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.doctors?.total || 0}</p>
              <p className="text-sm text-purple-600 mt-2">Faol: {stats?.doctors?.active || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600">
              <UserGroupIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Oylik daromad</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.revenue?.thisMonth || 0)}</p>
              <p className="text-sm text-yellow-600 mt-2">Bugun: {formatCurrency(stats?.revenue?.today || 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-100 text-yellow-600">
              <CurrencyDollarIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Status - Pie Chart */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/40">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Qabullar holati bo'yicha</h3>
          {appointmentsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {appointmentsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Ma'lumot topilmadi
            </div>
          )}
        </div>

        {/* Categories Bar Chart */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/40">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategoriyalar bo'yicha shifokorlar</h3>
          {categoryStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={100} />
                <Tooltip />
                <Bar dataKey="doctorsCount" fill="#10B981" radius={[0, 4, 4, 0]} name="Shifokorlar" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Kategoriyalar topilmadi
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Details */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/40">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Qabullar tafsilotlari</h3>
          <div className="space-y-4">
            {appointmentsByStatus.length > 0 ? appointmentsByStatus.map((item) => {
              const total = appointmentsByStatus.reduce((sum, i) => sum + i.value, 0);
              const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="flex-1 text-gray-700">{item.name}</span>
                  <span className="font-medium text-gray-900">{item.value}</span>
                  <span className="text-sm text-gray-500">({percentage}%)</span>
                  <div className="w-20 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${percentage}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500">Ma'lumot topilmadi</p>
            )}
          </div>
        </div>

        {/* Category Details */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/40">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategoriya tafsilotlari</h3>
          <div className="space-y-4">
            {categoryStats.length > 0 ? categoryStats.map((cat) => {
              const percentage = totalDoctors > 0 ? Math.round((cat.doctorsCount / totalDoctors) * 100) : 0;
              return (
                <div key={cat.name} className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="flex-1 text-gray-700">{cat.name}</span>
                  <span className="font-medium text-gray-900">{cat.doctorsCount}</span>
                  <span className="text-sm text-gray-500">({percentage}%)</span>
                  <div className="w-20 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500">Kategoriyalar topilmadi</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
