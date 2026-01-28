import React, { useEffect, useState } from 'react';
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { driverService } from '../../services';

interface HistoryItem {
  id: string;
  patientName: string;
  address: string;
  date: string;
  time: string;
  status: 'COMPLETED' | 'CANCELLED';
  duration?: number;
}

export const DriverHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadHistory();
  }, [page]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await driverService.getVisitHistory({ page, limit: 10 });
      if (response?.data) {
        setHistory(
          response.data.map((v: any) => ({
            id: v.id,
            patientName: `${v.patient?.firstName || ''} ${v.patient?.lastName || ''}`.trim(),
            address: v.address || 'Manzil ko\'rsatilmagan',
            date: v.visitDate,
            time: v.scheduledTime || '00:00',
            status: v.status,
            duration: v.duration,
          }))
        );
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      // Mock data
      setHistory([
        {
          id: '1',
          patientName: 'Aliyev Jasur',
          address: 'Yunusobod tumani, 4-mavze',
          date: '2024-01-15',
          time: '10:00',
          status: 'COMPLETED',
          duration: 45,
        },
        {
          id: '2',
          patientName: 'Tosheva Gulnora',
          address: 'Chilonzor tumani, 9-kvartal',
          date: '2024-01-15',
          time: '11:30',
          status: 'COMPLETED',
          duration: 30,
        },
        {
          id: '3',
          patientName: 'Umarov Bekzod',
          address: 'Mirzo Ulug\'bek tumani',
          date: '2024-01-14',
          time: '14:00',
          status: 'CANCELLED',
        },
        {
          id: '4',
          patientName: 'Rahimov Sardor',
          address: 'Sergeli tumani',
          date: '2024-01-14',
          time: '15:30',
          status: 'COMPLETED',
          duration: 50,
        },
        {
          id: '5',
          patientName: 'Nazarova Madina',
          address: 'Olmazor tumani',
          date: '2024-01-13',
          time: '09:00',
          status: 'COMPLETED',
          duration: 35,
        },
      ]);
      setTotalPages(5);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) =>
    item.patientName.toLowerCase().includes(search.toLowerCase()) ||
    item.address.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    if (status === 'COMPLETED') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          Tugallangan
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
        Bekor qilindi
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
            <FunnelIcon className="w-5 h-5" />
            Filtr
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredHistory.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{item.patientName}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{item.address}</span>
                  </div>
                </div>
                {getStatusBadge(item.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{item.time}</span>
                </div>
                {item.duration && (
                  <span className="text-green-600">{item.duration} daq</span>
                )}
              </div>
            </div>
          ))}
          {filteredHistory.length === 0 && (
            <div className="p-8 text-center text-gray-600">
              Tarix topilmadi
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Sahifa {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
            >
              Oldingi
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
