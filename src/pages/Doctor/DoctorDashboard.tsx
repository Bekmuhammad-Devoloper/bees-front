import React, { useEffect, useState } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { doctorService, appointmentService } from '../../services';
import toast from 'react-hot-toast';

interface DoctorStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  todayAppointments: number;
  inProgressAppointments?: number;
  rating: number;
  reviewCount: number;
}

interface TodayAppointment {
  id: string;
  time: string;
  patientName: string;
  patientPhone: string;
  status: string;
  type: string;
}

export const DoctorDashboard: React.FC = () => {
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load statistics from doctor service
      const statsData = await doctorService.getMyStatistics();
      if (statsData) {
        setStats(statsData);
      }
      
      // Load today's appointments from appointment service
      const todayData = await appointmentService.getDoctorTodayStats();
      if (todayData) {
        // todayData may contain stats and/or appointments list
        if (todayData.appointments && Array.isArray(todayData.appointments)) {
          const mapped = todayData.appointments.map((apt: any) => ({
            id: apt.id,
            time: apt.appointmentTime?.substring(0, 5) || apt.startTime?.substring(0, 5) || '',
            patientName: apt.patient?.name || apt.user?.name || 'Noma\'lum',
            patientPhone: apt.patient?.phone || apt.user?.phone || '',
            status: apt.status || 'pending',
            type: apt.reason || apt.service?.name || 'Konsultatsiya',
          }));
          setTodayAppointments(mapped);
        } else if (Array.isArray(todayData)) {
          const mapped = todayData.map((apt: any) => ({
            id: apt.id,
            time: apt.appointmentTime?.substring(0, 5) || apt.startTime?.substring(0, 5) || '',
            patientName: apt.patient?.name || apt.user?.name || 'Noma\'lum',
            patientPhone: apt.patient?.phone || apt.user?.phone || '',
            status: apt.status || 'pending',
            type: apt.reason || apt.service?.name || 'Konsultatsiya',
          }));
          setTodayAppointments(mapped);
        }
        
        // Update stats from today data if available
        if (todayData.stats) {
          setStats(prev => ({
            ...prev,
            ...todayData.stats,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.startAppointment(appointmentId);
      toast.success('Qabul boshlandi');
      loadData();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.completeAppointment(appointmentId);
      toast.success('Qabul tugallandi');
      loadData();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      confirmed: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      in_progress: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      completed: 'bg-green-500/20 text-green-400 border border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    const labels: Record<string, string> = {
      pending: 'Kutilmoqda',
      confirmed: 'Tasdiqlangan',
      in_progress: 'Jarayonda',
      completed: 'Tugallangan',
      cancelled: 'Bekor qilingan',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Bugungi qabullar</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.todayAppointments || todayAppointments.length}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <CalendarDaysIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Kutilmoqda</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{stats?.pendingAppointments || 0}</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <ClockIcon className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tugallangan</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{stats?.completedAppointments || 0}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Bekor qilingan</p>
              <p className="text-3xl font-bold text-red-400 mt-1">{stats?.cancelledAppointments || 0}</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl">
              <XCircleIcon className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-4">Sizning reytingingiz</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <StarIcon className="w-10 h-10 text-yellow-400 fill-yellow-400" />
            <span className="text-4xl font-bold text-yellow-400">{stats?.rating || 0}</span>
          </div>
          <div className="text-gray-400">
            <p className="font-medium text-white">{stats?.reviewCount || 0} ta sharh</p>
            <p className="text-sm">Jami {stats?.totalAppointments || 0} ta qabul</p>
          </div>
        </div>
      </div>
      <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">Bugungi qabullar</h3>
        </div>
        {todayAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarDaysIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Bugun qabullar yoq</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold text-cyan-400">{appointment.time}</div>
                  <div>
                    <p className="font-medium text-white">{appointment.patientName}</p>
                    <p className="text-sm text-gray-400">{appointment.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(appointment.status)}
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <button onClick={() => handleStartAppointment(appointment.id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1">
                      <PlayIcon className="w-4 h-4" />
                      Boshlash
                    </button>
                  )}
                  {appointment.status === 'in_progress' && (
                    <button onClick={() => handleCompleteAppointment(appointment.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1">
                      <StopIcon className="w-4 h-4" />
                      Tugatish
                    </button>
                  )}
                  {appointment.status === 'completed' && (
                    <span className="text-green-400 text-sm">Tugallangan</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
