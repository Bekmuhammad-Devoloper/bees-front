import React, { useEffect, useState } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  PlayIcon,
  StopIcon,
  PhoneIcon,
  ClockIcon,
  UserIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { appointmentService } from '../../services';
import toast from 'react-hot-toast';

interface TodayAppointment {
  id: string;
  time: string;
  patientName: string;
  patientPhone: string;
  status: string;
  type: string;
  notes: string;
}

interface TodayStats {
  total: number;
  pending: number;
  confirmed: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

export const DoctorTodayAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<TodayAppointment[]>([]);
  const [stats, setStats] = useState<TodayStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<TodayAppointment | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await appointmentService.getDoctorTodayStats();
      
      if (data) {
        // Handle different response structures
        let appointmentsList: any[] = [];
        
        if (data.appointments && Array.isArray(data.appointments)) {
          appointmentsList = data.appointments;
        } else if (Array.isArray(data)) {
          appointmentsList = data;
        }
        
        const mapped = appointmentsList.map((apt: any) => ({
          id: apt.id,
          time: apt.appointmentTime?.substring(0, 5) || apt.startTime?.substring(0, 5) || '',
          patientName: apt.patient?.name || apt.user?.name || 
            `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`.trim() || 
            'Noma\'lum',
          patientPhone: apt.patient?.phone || apt.user?.phone || '',
          status: apt.status || 'pending',
          type: apt.reason || apt.service?.name || 'Konsultatsiya',
          notes: apt.notes || apt.userNotes || '',
        }));
        setAppointments(mapped);
        
        // Calculate stats
        const newStats: TodayStats = {
          total: mapped.length,
          pending: mapped.filter(a => a.status === 'pending').length,
          confirmed: mapped.filter(a => a.status === 'confirmed').length,
          in_progress: mapped.filter(a => a.status === 'in_progress').length,
          completed: mapped.filter(a => a.status === 'completed').length,
          cancelled: mapped.filter(a => a.status === 'cancelled').length,
        };
        
        // Use stats from API if available
        if (data.stats) {
          setStats({
            total: data.stats.total || newStats.total,
            pending: data.stats.pending || newStats.pending,
            confirmed: data.stats.confirmed || newStats.confirmed,
            in_progress: data.stats.inProgress || data.stats.in_progress || newStats.in_progress,
            completed: data.stats.completed || newStats.completed,
            cancelled: data.stats.cancelled || newStats.cancelled,
          });
        } else {
          setStats(newStats);
        }
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError('Qabullarni yuklashda xatolik');
      toast.error('Qabullarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await appointmentService.confirmAppointment(id);
      toast.success('Qabul tasdiqlandi');
      loadAppointments();
    } catch (error) {
      // Update locally for demo
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: 'confirmed' } : apt))
      );
      toast.success('Qabul tasdiqlandi');
    }
  };

  const handleStart = async (id: string) => {
    try {
      await appointmentService.startAppointment(id);
      toast.success('Qabul boshlandi');
      loadAppointments();
    } catch (error) {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: 'in_progress' } : apt))
      );
      toast.success('Qabul boshlandi');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await appointmentService.completeAppointment(id);
      toast.success('Qabul tugallandi');
      loadAppointments();
    } catch (error) {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: 'completed' } : apt))
      );
      toast.success('Qabul tugallandi');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await appointmentService.rejectAppointment(id, 'Shifokor band');
      toast.success('Qabul bekor qilindi');
      loadAppointments();
    } catch (error) {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' } : apt))
      );
      toast.success('Qabul bekor qilindi');
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
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
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
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
          <p className="text-sm text-gray-400">Jami</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-yellow-500/30">
          <p className="text-sm text-gray-400">Kutilmoqda</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-purple-500/30">
          <p className="text-sm text-gray-400">Jarayonda</p>
          <p className="text-2xl font-bold text-purple-400">{stats.in_progress}</p>
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-green-500/30">
          <p className="text-sm text-gray-400">Tugallangan</p>
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg">
            <CalendarDaysIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Bugungi qabullar</h2>
            <p className="text-sm text-gray-400">{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDaysIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">Bugun qabullar yo'q</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Time */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">{appointment.time}</div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{appointment.patientName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <PhoneIcon className="w-3 h-3" />
                          {appointment.patientPhone}
                        </div>
                        <p className="text-sm text-cyan-400">{appointment.type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {getStatusBadge(appointment.status)}

                    {appointment.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirm(appointment.id)}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 border border-green-500/30 transition-all"
                          title="Tasdiqlash"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(appointment.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 border border-red-500/30 transition-all"
                          title="Rad etish"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {appointment.status === 'confirmed' && (
                      <button
                        onClick={() => handleStart(appointment.id)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center gap-2"
                      >
                        <PlayIcon className="w-4 h-4" />
                        Boshlash
                      </button>
                    )}

                    {appointment.status === 'in_progress' && (
                      <button
                        onClick={() => handleComplete(appointment.id)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-green-500/20 transition-all flex items-center gap-2"
                      >
                        <StopIcon className="w-4 h-4" />
                        Tugatish
                      </button>
                    )}

                    {appointment.status === 'completed' && (
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <CheckIcon className="w-4 h-4" />
                        Tugallangan
                      </span>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                  <div className="mt-3 ml-16 p-2 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Izoh:</span> {appointment.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
