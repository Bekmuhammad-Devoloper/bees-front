import React, { useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { receptionService } from '../../services';

interface HistoryItem {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
  duration: number;
}

export const ReceptionHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadHistory();
  }, [page, dateFrom, dateTo]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await receptionService.getHistory({ page, limit: 20, dateFrom, dateTo });
      console.log('History response:', response);
      
      if (response) {
        // Backend PatientVisit[] formatini HistoryItem[] ga o'girish
        const items = (response.data || response || []).map((visit: any) => ({
          id: visit.id,
          patientName: visit.appointment?.patient?.name || visit.appointment?.patient?.fullName || 'Noma\'lum',
          patientPhone: visit.appointment?.patient?.phone || '',
          doctorName: visit.appointment?.doctor?.user?.name || visit.appointment?.doctor?.user?.fullName || 'Noma\'lum',
          date: visit.appointment?.appointmentDate?.split('T')[0] || visit.createdAt?.split('T')[0] || '',
          time: visit.appointment?.appointmentTime || '',
          status: visit.status || 'unknown',
          duration: visit.completedAt && visit.startedAt 
            ? Math.round((new Date(visit.completedAt).getTime() - new Date(visit.startedAt).getTime()) / 60000)
            : 0,
        }));
        
        setHistory(items);
        setTotalPages(Math.ceil((response.total || items.length) / 20));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      setHistory([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      confirmed: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      waiting: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      in_progress: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      completed: 'bg-green-500/20 text-green-400 border border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
      no_show: 'bg-white/10 text-gray-300 border border-white/20',
    };
    const labels: Record<string, string> = {
      pending: 'Kutilmoqda',
      confirmed: 'Tasdiqlangan',
      waiting: 'Kutilmoqda',
      in_progress: 'Qabulda',
      completed: 'Tugallangan',
      cancelled: 'Bekor qilindi',
      no_show: 'Kelmadi',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-white/10 text-gray-300'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredHistory = history.filter(
    (item) =>
      item.patientName.toLowerCase().includes(search.toLowerCase()) ||
      item.doctorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              title="Boshlanish sanasi"
              placeholder="Dan"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <input
              type="date"
              title="Tugash sanasi"
              placeholder="Gacha"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <button 
              onClick={() => loadHistory()}
              className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 flex items-center gap-2 border border-cyan-500/30"
            >
              <FunnelIcon className="w-5 h-5" />
              Filtr
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Sana
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Vaqt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Bemor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Shifokor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Holat
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Davomiylik
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-white/5">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-300">{item.date}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-cyan-400 font-medium">{item.time}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{item.patientName}</div>
                        <div className="text-sm text-gray-400">{item.patientPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-300">{item.doctorName}</td>
                  <td className="px-4 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-4 py-4 text-gray-300">
                    {item.duration > 0 ? `${item.duration} daq` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Sahifa {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-black/40 border border-white/20 rounded-lg text-sm text-gray-300 hover:bg-white/10 disabled:opacity-50"
            >
              Oldingi
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-black/40 border border-white/20 rounded-lg text-sm text-gray-300 hover:bg-white/10 disabled:opacity-50"
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
