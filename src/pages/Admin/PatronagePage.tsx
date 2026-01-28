import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, HomeIcon, TruckIcon, UserIcon, MapPinIcon, EyeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

interface HomeVisit {
  id: string;
  patient?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  address: string;
  driver?: {
    user?: {
      firstName: string;
      lastName: string;
    };
  };
  status: string;
  scheduledDate?: string;
  createdAt: string;
  notes?: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-700' },
  assigned: { label: 'Tayinlangan', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'Yo\'lda', color: 'bg-purple-100 text-purple-700' },
  arrived: { label: 'Yetib keldi', color: 'bg-indigo-100 text-indigo-700' },
  completed: { label: 'Bajarildi', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Bekor qilingan', color: 'bg-red-100 text-red-700' },
};

export function PatronagePage() {
  const [visits, setVisits] = useState<HomeVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');

  useEffect(() => {
    loadVisits();
  }, [status]);

  const loadVisits = async () => {
    try {
      setLoading(true);
      // Admin uchun barcha chaqiruvlarni olish
      const response = await api.get('/driver/my-visits');
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      let visitsList = Array.isArray(data) ? data : [];
      
      // Status bo'yicha filter
      if (status !== 'all') {
        visitsList = visitsList.filter((v: HomeVisit) => v.status === status);
      }
      
      setVisits(visitsList);
    } catch (error) {
      console.error('Failed to load home visits:', error);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (visit: HomeVisit) => {
    if (visit.patient) {
      return `${visit.patient.firstName || ''} ${visit.patient.lastName || ''}`.trim() || 'Noma\'lum';
    }
    return 'Noma\'lum';
  };

  const getDriverName = (visit: HomeVisit) => {
    if (visit.driver?.user) {
      return `${visit.driver.user.firstName || ''} ${visit.driver.user.lastName || ''}`.trim();
    }
    return null;
  };

  const filtered = visits.filter(v => {
    const patientName = getPatientName(v).toLowerCase();
    const address = v.address?.toLowerCase() || '';
    const searchLower = search.toLowerCase();
    return patientName.includes(searchLower) || address.includes(searchLower);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Patronaj (Uyga chiqish)</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Bemor yoki manzil qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'assigned', 'in_progress', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                status === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'Barchasi' : statusMap[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Yuklanmoqda...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-600">
            <HomeIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Uyga chiqish so'rovlari topilmadi</p>
          </div>
        ) : (
          filtered.map((visit) => (
            <div key={visit.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <HomeIcon className="w-5 h-5 text-orange-600" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusMap[visit.status]?.color || 'bg-gray-100 text-gray-600'
                }`}>
                  {statusMap[visit.status]?.label || visit.status}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{getPatientName(visit)}</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="truncate">{visit.address || 'Manzil ko\'rsatilmagan'}</span>
                </div>
                {getDriverName(visit) && (
                  <div className="flex items-center gap-2">
                    <TruckIcon className="w-4 h-4" />
                    <span>{getDriverName(visit)}</span>
                  </div>
                )}
                {visit.patient?.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{visit.patient.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {visit.scheduledDate ? new Date(visit.scheduledDate).toLocaleDateString('uz-UZ') : new Date(visit.createdAt).toLocaleDateString('uz-UZ')}
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-lg" title="Ko'rish">
                  <EyeIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
