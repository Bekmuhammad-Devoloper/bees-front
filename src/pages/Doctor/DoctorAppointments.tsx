import React, { useEffect, useState } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  PhoneIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { appointmentService } from '../../services';
import type { Appointment } from '../../types';
import toast from 'react-hot-toast';

export const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getDoctorAppointments({
        status: filter === 'all' ? undefined : filter as any,
      });
      setAppointments(data.data || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      setAppointments([]);
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
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await appointmentService.rejectAppointment(id, 'Shifokor band');
      toast.success('Qabul rad etildi');
      loadAppointments();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await appointmentService.completeAppointment(id);
      toast.success('Qabul tugallandi');
      loadAppointments();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const filterTabs = [
    { key: 'all', label: 'Barchasi' },
    { key: 'pending', label: 'Kutilmoqda' },
    { key: 'confirmed', label: 'Tasdiqlangan' },
    { key: 'completed', label: 'Tugallangan' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'confirmed':
        return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Kutilmoqda';
      case 'confirmed':
        return 'Tasdiqlangan';
      case 'completed':
        return 'Tugallangan';
      case 'cancelled':
        return 'Bekor qilingan';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-2 flex gap-2 border border-white/10">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === tab.key
                ? 'bg-gradient-to-r from-cyan-500 to-green-500 text-white shadow-lg shadow-cyan-500/20'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 border border-white/10">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <span className="ml-3 text-gray-400">Yuklanmoqda...</span>
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-12 border border-white/10 text-center">
          <CalendarIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">Qabullar topilmadi</p>
          <p className="text-gray-600 text-sm mt-2">Hozircha bu filter bo'yicha qabullar yo'q</p>
        </div>
      ) : (
        /* Appointments List */
        <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sana/Vaqt
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Bemor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Xizmat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Izoh
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Holat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="font-medium text-white">
                            {appointment.appointmentDate || appointment.date || '-'}
                          </div>
                          <div className="text-sm text-cyan-400 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {appointment.appointmentTime?.substring(0, 5) || appointment.time || appointment.startTime?.substring(0, 5) || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {appointment.patient?.name || appointment.user?.name || 
                             `${appointment.patient?.firstName || appointment.user?.firstName || ''} ${appointment.patient?.lastName || appointment.user?.lastName || ''}`.trim() || 
                             'Noma\'lum'}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center gap-1">
                            <PhoneIcon className="w-3 h-3" />
                            {appointment.patient?.phone || appointment.user?.phone || 'Noma\'lum'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-300">{appointment.reason || appointment.service?.name || 'Konsultatsiya'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-400 text-sm max-w-[200px] truncate block">
                        {appointment.userNotes || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {appointment.status === 'pending' && (
                          <>
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
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleComplete(appointment.id)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                          >
                            Tugatish
                          </button>
                        )}
                        {appointment.status === 'completed' && (
                          <span className="text-green-400 text-sm">✓ Tugallangan</span>
                        )}
                        {appointment.status === 'cancelled' && (
                          <span className="text-red-400 text-sm">✕ Bekor qilingan</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
