import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  CheckCircleIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { driverService } from '../../services';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface Stats {
  todayVisits: number;
  completedVisits: number;
  pendingVisits: number;
  inProgressVisits: number;
}

interface VisitItem {
  id: string;
  patientName: string;
  patientPhone: string;
  address: string;
  time: string;
  status: string;
}

export const DriverDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [nextVisits, setNextVisits] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Parallel API calls
      const [visitsData, statsData] = await Promise.all([
        driverService.getTodayVisits().catch(() => []),
        driverService.getStats().catch(() => null),
      ]);
      
      // Process stats
      if (statsData) {
        setStats({
          todayVisits: statsData.total || statsData.todayVisits || 0,
          completedVisits: statsData.completed || statsData.completedVisits || 0,
          pendingVisits: statsData.pending || statsData.pendingVisits || 0,
          inProgressVisits: statsData.inProgress || statsData.inProgressVisits || 0,
        });
      }
      
      // Process visits
      if (visitsData && Array.isArray(visitsData)) {
        const pending = visitsData.filter((v: any) => 
          v.status === 'ASSIGNED' || v.status === 'IN_PROGRESS' || v.status === 'PENDING'
        );
        setNextVisits(
          pending.slice(0, 5).map((v: any) => ({
            id: v.id,
            patientName: v.patient 
              ? `${v.patient.firstName || ''} ${v.patient.lastName || ''}`.trim() || v.patient.name || 'Noma\'lum'
              : v.user?.name || 'Noma\'lum',
            patientPhone: v.patient?.phone || v.user?.phone || '',
            address: v.address || 'Manzil ko\'rsatilmagan',
            time: v.scheduledTime?.substring(0, 5) || '00:00',
            status: v.status,
          }))
        );
        
        // Update stats from visits if no stats API response
        if (!statsData) {
          setStats({
            todayVisits: visitsData.length,
            completedVisits: visitsData.filter((v: any) => v.status === 'COMPLETED').length,
            pendingVisits: pending.length,
            inProgressVisits: visitsData.filter((v: any) => v.status === 'IN_PROGRESS').length,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleStartVisit = async (visitId: string) => {
    try {
      await driverService.startTrip(visitId);
      toast.success('Yo\'lga chiqdingiz!');
      loadData();
      navigate('/driver/visits');
    } catch (error: any) {
      console.error('Start visit error:', error);
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Xush kelibsiz, {user?.name || user?.firstName || 'Haydovchi'}!
        </h1>
        <p className="text-green-100">Bugungi vazifalaringiz tayyor</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TruckIcon className="w-5 h-5" />
            <span>{stats?.pendingVisits || 0} ta tashrif kutmoqda</span>
          </div>
          {(stats?.inProgressVisits || 0) > 0 && (
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <PlayIcon className="w-4 h-4" />
              <span>{stats?.inProgressVisits} ta yo'lda</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <TruckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.todayVisits || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Jami tashriflar</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.completedVisits || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Bajarilgan</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingVisits || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Kutilmoqda</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <PlayIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.inProgressVisits || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Yo'lda</p>
        </div>
      </div>

      {/* Next Visits */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Keyingi tashriflar</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
            </div>
          ) : nextVisits.length > 0 ? (
            nextVisits.map((visit) => (
              <div key={visit.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{visit.patientName}</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{visit.time}</span>
                      {visit.status === 'IN_PROGRESS' && (
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                          Yo'lda
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm mb-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{visit.address}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                      <PhoneIcon className="w-4 h-4" />
                      <a href={`tel:${visit.patientPhone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                        {visit.patientPhone}
                      </a>
                    </div>
                  </div>
                  {visit.status === 'IN_PROGRESS' ? (
                    <button 
                      onClick={() => navigate('/driver/visits')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-1"
                    >
                      <MapPinIcon className="w-4 h-4" />
                      Ko'rish
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStartVisit(visit.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
                    >
                      <PlayIcon className="w-4 h-4" />
                      Boshlash
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              <TruckIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Hozircha tashrif yo'q</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
