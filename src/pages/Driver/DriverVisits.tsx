import React, { useEffect, useState } from 'react';
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CheckIcon,
  PlayIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { driverService } from '../../services';
import toast from 'react-hot-toast';

interface VisitItem {
  id: string;
  patientName: string;
  patientPhone: string;
  address: string;
  time: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  appointmentId: string;
}

export const DriverVisits: React.FC = () => {
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVisit, setActiveVisit] = useState<string | null>(null);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const data = await driverService.getTodayVisits();
      // data is HomeVisit[] directly
      if (data && Array.isArray(data)) {
        setVisits(
          data.map((v: any) => ({
            id: v.id,
            patientName: `${v.patient?.firstName || ''} ${v.patient?.lastName || ''}`.trim() || 'Noma\'lum',
            patientPhone: v.patient?.phone || '',
            address: v.address || 'Manzil ko\'rsatilmagan',
            time: v.scheduledTime || '00:00',
            status: v.status,
            notes: v.notes,
            appointmentId: v.appointmentId,
          }))
        );
        const inProgress = data.find((v: any) => v.status === 'IN_PROGRESS');
        if (inProgress) setActiveVisit(inProgress.id);
      }
    } catch (error) {
      console.error('Failed to load visits:', error);
      // Mock data
      setVisits([
        {
          id: '1',
          patientName: 'Aliyev Jasur',
          patientPhone: '+998901234567',
          address: 'Yunusobod tumani, 4-mavze, 15-uy',
          time: '10:00',
          status: 'ASSIGNED',
          appointmentId: 'APT001',
        },
        {
          id: '2',
          patientName: 'Tosheva Gulnora',
          patientPhone: '+998901234568',
          address: 'Chilonzor tumani, 9-kvartal, 5-uy',
          time: '11:30',
          status: 'IN_PROGRESS',
          appointmentId: 'APT002',
        },
        {
          id: '3',
          patientName: 'Umarov Bekzod',
          patientPhone: '+998901234569',
          address: 'Mirzo Ulug\'bek tumani, 12-uy',
          time: '14:00',
          status: 'ASSIGNED',
          appointmentId: 'APT003',
        },
        {
          id: '4',
          patientName: 'Nazarova Madina',
          patientPhone: '+998901234570',
          address: 'Sergeli tumani, 3-mavze',
          time: '15:30',
          status: 'COMPLETED',
          appointmentId: 'APT004',
        },
      ]);
      setActiveVisit('2');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (visitId: string) => {
    try {
      await driverService.startVisit(visitId);
      toast.success('Tashrif boshlandi');
      setActiveVisit(visitId);
      loadVisits();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleComplete = async (visitId: string) => {
    try {
      await driverService.completeVisit(visitId);
      toast.success('Tashrif yakunlandi');
      setActiveVisit(null);
      loadVisits();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleCancel = async (visitId: string) => {
    try {
      await driverService.cancelVisit(visitId);
      toast.success('Tashrif bekor qilindi');
      loadVisits();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const openMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ASSIGNED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
      IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
      COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
      CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    };
    const labels: Record<string, string> = {
      ASSIGNED: 'Belgilangan',
      IN_PROGRESS: 'Yo\'lda',
      COMPLETED: 'Tugallangan',
      CANCELLED: 'Bekor qilindi',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const pendingVisits = visits.filter((v) => v.status === 'ASSIGNED' || v.status === 'IN_PROGRESS');
  const completedVisits = visits.filter((v) => v.status === 'COMPLETED' || v.status === 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Active Visit Card */}
      {activeVisit && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="animate-pulse w-3 h-3 bg-white rounded-full" />
            <span className="font-medium">Faol tashrif</span>
          </div>
          {visits
            .filter((v) => v.id === activeVisit)
            .map((visit) => (
              <div key={visit.id}>
                <h3 className="text-xl font-bold mb-2">{visit.patientName}</h3>
                <div className="flex items-center gap-2 text-blue-100 mb-3">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{visit.address}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openMaps(visit.address)}
                    className="flex-1 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 flex items-center justify-center gap-2"
                  >
                    <MapPinIcon className="w-5 h-5" />
                    Xaritada ochish
                  </button>
                  <button
                    onClick={() => handleComplete(visit.id)}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <CheckIcon className="w-5 h-5" />
                    Yakunlash
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Pending Visits */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Kutilayotgan tashriflar ({pendingVisits.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
            </div>
          ) : pendingVisits.length > 0 ? (
            pendingVisits.map((visit) => (
              <div
                key={visit.id}
                className={`p-4 ${visit.id === activeVisit ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{visit.patientName}</span>
                      {getStatusBadge(visit.status)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      <span>{visit.time}</span>
                    </div>
                  </div>
                  <a
                    href={`tel:${visit.patientPhone}`}
                    title="Qo'ng'iroq qilish"
                    className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50"
                  >
                    <PhoneIcon className="w-5 h-5" />
                  </a>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{visit.address}</span>
                </div>
                {visit.id !== activeVisit && visit.status === 'ASSIGNED' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStart(visit.id)}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-1"
                    >
                      <PlayIcon className="w-4 h-4" />
                      Boshlash
                    </button>
                    <button
                      onClick={() => handleCancel(visit.id)}
                      title="Bekor qilish"
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              Kutilayotgan tashrif yo'q
            </div>
          )}
        </div>
      </div>

      {/* Completed Visits */}
      {completedVisits.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tugallangan tashriflar ({completedVisits.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {completedVisits.map((visit) => (
              <div key={visit.id} className="p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{visit.patientName}</span>
                      {getStatusBadge(visit.status)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{visit.address}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{visit.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
