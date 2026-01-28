import React, { useEffect, useState } from 'react';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { driverService } from '../../services';
import { useAuthStore } from '../../store/authStore';

interface Stats {
  todayVisits: number;
  completedVisits: number;
  pendingVisits: number;
  totalDistance: number;
}

interface VisitItem {
  id: string;
  patientName: string;
  patientPhone: string;
  address: string;
  time: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export const DriverDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [nextVisits, setNextVisits] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [visitsData] = await Promise.all([
        driverService.getTodayVisits(),
        driverService.getVisitHistory(),
      ]);
      
      // Process data for stats - visitsData is HomeVisit[] directly
      if (visitsData && Array.isArray(visitsData)) {
        const pending = visitsData.filter((v: any) => v.status === 'ASSIGNED' || v.status === 'IN_PROGRESS');
        setNextVisits(
          pending.slice(0, 3).map((v: any) => ({
            id: v.id,
            patientName: v.patient?.firstName + ' ' + v.patient?.lastName,
            patientPhone: v.patient?.phone || '',
            address: v.address || 'Manzil ko\'rsatilmagan',
            time: v.scheduledTime || '00:00',
            status: v.status === 'IN_PROGRESS' ? 'in_progress' : 'pending',
          }))
        );
        setStats({
          todayVisits: visitsData.length,
          completedVisits: visitsData.filter((v: any) => v.status === 'COMPLETED').length,
          pendingVisits: pending.length,
          totalDistance: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Mock data
      setStats({
        todayVisits: 8,
        completedVisits: 3,
        pendingVisits: 5,
        totalDistance: 45,
      });
      setNextVisits([
        {
          id: '1',
          patientName: 'Aliyev Jasur',
          patientPhone: '+998901234567',
          address: 'Yunusobod tumani, 4-mavze',
          time: '10:00',
          status: 'pending',
        },
        {
          id: '2',
          patientName: 'Tosheva Gulnora',
          patientPhone: '+998901234568',
          address: 'Chilonzor tumani, 9-kvartal',
          time: '11:30',
          status: 'pending',
        },
        {
          id: '3',
          patientName: 'Umarov Bekzod',
          patientPhone: '+998901234569',
          address: 'Mirzo Ulug\'bek tumani',
          time: '14:00',
          status: 'pending',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Xush kelibsiz, {user?.firstName || 'Haydovchi'}!
        </h1>
        <p className="text-green-100">Bugungi vazifalaringiz tayyor</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TruckIcon className="w-5 h-5" />
            <span>{stats?.pendingVisits || 0} ta tashrif kutmoqda</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TruckIcon className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.todayVisits || 0}</p>
          <p className="text-sm text-gray-600">Jami tashriflar</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.completedVisits || 0}</p>
          <p className="text-sm text-gray-600">Bajarilgan</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ClockIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.pendingVisits || 0}</p>
          <p className="text-sm text-gray-600">Kutilmoqda</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPinIcon className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalDistance || 0}</p>
          <p className="text-sm text-gray-600">km bosib o'tildi</p>
        </div>
      </div>

      {/* Next Visits */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Keyingi tashriflar</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {nextVisits.map((visit) => (
            <div key={visit.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{visit.patientName}</span>
                    <span className="text-sm text-blue-600 font-medium">{visit.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{visit.address}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <PhoneIcon className="w-4 h-4" />
                    <a href={`tel:${visit.patientPhone}`} className="hover:text-blue-600">
                      {visit.patientPhone}
                    </a>
                  </div>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                  Boshlash
                </button>
              </div>
            </div>
          ))}
          {nextVisits.length === 0 && (
            <div className="p-8 text-center text-gray-600">
              Hozircha tashrif yo'q
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
