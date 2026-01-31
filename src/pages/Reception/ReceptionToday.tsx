import React, { useEffect, useState } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  PlayIcon,
  PhoneIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { receptionService } from '../../services';
import toast from 'react-hot-toast';

interface AppointmentItem {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorSpecialization: string;
  time: string;
  status: 'pending' | 'confirmed' | 'waiting' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  visitId?: string;
}

export const ReceptionToday: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    waiting: 0,
    arrived: 0,
    inProgress: 0,
    completed: 0,
    noShow: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 [ReceptionToday] Loading data...');
      
      const [todayData, statsData] = await Promise.all([
        receptionService.getTodayAppointments(),
        receptionService.getTodayStats(),
      ]);
      
      console.log('📥 [ReceptionToday] todayData received:', todayData);
      console.log('📥 [ReceptionToday] todayData type:', typeof todayData);
      console.log('📥 [ReceptionToday] todayData is array:', Array.isArray(todayData));
      console.log('📥 [ReceptionToday] todayData length:', todayData?.length);
      console.log('📥 [ReceptionToday] statsData received:', statsData);
      
      if (todayData && Array.isArray(todayData) && todayData.length > 0) {
        console.log('✅ [ReceptionToday] Mapping appointments...');
        // Backend'dan kelgan ma'lumotlarni frontend formatiga o'tkazish
        const mappedAppointments: AppointmentItem[] = todayData.map((apt: any, index: number) => {
          console.log(`📋 [ReceptionToday] Appointment ${index}:`, apt);
          return {
            id: apt.id,
            appointmentId: apt.id,
            patientName: apt.patient?.name || 'Noma\'lum bemor',
            patientPhone: apt.patient?.phone || '',
            doctorName: apt.doctor?.fullName || apt.doctor?.user?.name || 'Noma\'lum shifokor',
            doctorSpecialization: apt.doctor?.specialization || '',
            time: apt.appointmentTime?.substring(0, 5) || '',
            status: apt.status || 'pending',
            visitId: apt.visitId,
          };
        });
        console.log('✅ [ReceptionToday] Mapped appointments:', mappedAppointments);
        setAppointments(mappedAppointments);
      } else {
        console.log('⚠️ [ReceptionToday] No appointments or empty array');
      }
      
      if (statsData) {
        console.log('📊 [ReceptionToday] Setting stats:', statsData);
        // Backend'dan kelgan statsni frontendga moslash
        // Backend pending appointmentlarni qaytaradi, shuning uchun total - completed - noShow = pending
        const pendingCount = (statsData.total || 0) - (statsData.completed || 0) - (statsData.noShow || 0) - (statsData.inProgress || 0);
        setStats({
          total: statsData.total || 0,
          pending: pendingCount > 0 ? pendingCount : 0,
          waiting: statsData.waiting || 0,
          arrived: statsData.arrived || 0,
          inProgress: statsData.inProgress || 0,
          completed: statsData.completed || 0,
          noShow: statsData.noShow || 0,
        });
      }
    } catch (error) {
      console.error('❌ [ReceptionToday] Failed to load data:', error);
    } finally {
      setLoading(false);
      console.log('🏁 [ReceptionToday] Loading complete');
    }
  };

  const handleArrival = async (appointmentId: string) => {
    try {
      console.log('📤 [ReceptionToday] Registering arrival for:', appointmentId);
      await receptionService.registerArrival(appointmentId);
      toast.success('Bemor ro\'yxatga olindi');
      loadData();
    } catch (error: any) {
      console.error('❌ [ReceptionToday] Arrival error:', error);
      const message = error.response?.data?.message || error.message || 'Xatolik yuz berdi';
      toast.error(message);
    }
  };

  const handleStartVisit = async (visitId: string) => {
    try {
      console.log('📤 [ReceptionToday] Starting visit:', visitId);
      await receptionService.startVisit(visitId);
      toast.success('Qabul boshlandi');
      loadData();
    } catch (error: any) {
      console.error('❌ [ReceptionToday] Start visit error:', error);
      const message = error.response?.data?.message || error.message || 'Xatolik yuz berdi';
      toast.error(message);
    }
  };

  const handleNoShow = async (appointmentId: string) => {
    try {
      console.log('📤 [ReceptionToday] Marking no-show for:', appointmentId);
      await receptionService.markNoShow(appointmentId);
      toast.success('Bemor kelmadi deb belgilandi');
      loadData();
    } catch (error: any) {
      console.error('❌ [ReceptionToday] No-show error:', error);
      const message = error.response?.data?.message || error.message || 'Xatolik yuz berdi';
      toast.error(message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      waiting: 'bg-yellow-100 text-yellow-800',
      arrived: 'bg-cyan-100 text-cyan-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      pending: 'Kutilmoqda',
      confirmed: 'Tasdiqlangan',
      waiting: 'Kutilmoqda',
      arrived: 'Keldi',
      in_progress: 'Qabulda',
      completed: 'Tugallangan',
      cancelled: 'Bekor qilingan',
      no_show: 'Kelmadi',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-3xl font-bold text-black dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Jami</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center border border-yellow-200 dark:border-yellow-800">
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Kutilmoqda</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.arrived}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Keldi</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-800">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.inProgress}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Qabulda</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tugallangan</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center border border-red-200 dark:border-red-800">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.noShow}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Kelmadi</p>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-black dark:text-white">Bugungi qabullar</h2>
        </div>
        {appointments.length === 0 ? (
          <div className="p-8 text-center">
            <ClockIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Bugun qabullar yo'q</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    Vaqt
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    Bemor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    Shifokor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    Holat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-primary-500">{apt.time}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-black dark:text-white">{apt.patientName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <PhoneIcon className="w-3 h-3" />
                        {apt.patientPhone}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-black dark:text-white">{apt.doctorName}</div>
                      {apt.doctorSpecialization && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{apt.doctorSpecialization}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(apt.status)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {(apt.status === 'pending' || apt.status === 'confirmed' || apt.status === 'waiting') && (
                          <>
                            <button
                              onClick={() => handleArrival(apt.appointmentId)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
                            >
                              <CheckIcon className="w-4 h-4" />
                              Keldi
                            </button>
                            <button
                              onClick={() => handleNoShow(apt.appointmentId)}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 flex items-center gap-1"
                            >
                              <XMarkIcon className="w-4 h-4" />
                              Kelmadi
                            </button>
                          </>
                        )}
                        {apt.status === 'arrived' && (
                          <button
                            onClick={() => handleStartVisit(apt.visitId || apt.appointmentId)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
                          >
                            <PlayIcon className="w-4 h-4" />
                            Boshlash
                          </button>
                        )}
                        {apt.status === 'completed' && (
                          <span className="text-green-400 text-sm">✓ Yakunlangan</span>
                        )}
                        {(apt.status === 'cancelled' || apt.status === 'no_show') && (
                          <span className="text-red-400 text-sm">✗ Bekor qilingan</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
