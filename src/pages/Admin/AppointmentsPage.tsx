import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reason?: string;
  patient?: {
    id: string;
    name: string;
    phone: string;
  };
  doctor?: {
    user?: {
      name: string;
    };
    specialization?: string;
    category?: {
      nameUz: string;
    };
  };
  service?: {
    nameUz: string;
    price: number;
  };
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Kutilmoqda',
  confirmed: 'Tasdiqlangan',
  in_progress: 'Jarayonda',
  completed: 'Yakunlangan',
  cancelled: 'Bekor qilingan',
};

export function AppointmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    loadAppointments();
  }, [activeStatus]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (activeStatus !== 'all') {
        params.status = activeStatus;
      }
      const response = await api.get('/appointments', { params });
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const filteredAppointments = appointments.filter((apt) => {
    const searchLower = search.toLowerCase();
    const patientName = (apt.patient?.name || '').toLowerCase();
    const doctorName = (apt.doctor?.user?.name || '').toLowerCase();
    return patientName.includes(searchLower) || doctorName.includes(searchLower);
  });

  const statusTabs = [
    { key: 'all', label: 'Barchasi', icon: CalendarDaysIcon },
    { key: 'pending', label: 'Kutilmoqda', icon: ClockIcon },
    { key: 'confirmed', label: 'Tasdiqlangan', icon: CheckCircleIcon },
    { key: 'in_progress', label: 'Jarayonda', icon: ClockIcon },
    { key: 'completed', label: 'Yakunlangan', icon: CheckCircleIcon },
    { key: 'cancelled', label: 'Bekor qilingan', icon: XCircleIcon },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Qabullar</h1>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleStatusChange(tab.key)}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ' + (activeStatus === tab.key ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Bemor yoki shifokor nomi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Bemor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Shifokor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Sana</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-600">Qabullar topilmadi</td>
              </tr>
            ) : (
              filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{apt.patient?.name || '-'}</div>
                    <div className="text-sm text-gray-600">{apt.patient?.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{apt.doctor?.user?.name || '-'}</div>
                    <div className="text-sm text-gray-600">{apt.doctor?.specialization || apt.doctor?.category?.nameUz}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('uz-UZ') : '-'}</div>
                    <div className="text-sm text-gray-600">{apt.appointmentTime || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={'px-3 py-1 text-xs font-medium rounded-full ' + (statusColors[apt.status] || 'bg-gray-100 text-black-neon')}>
                      {statusLabels[apt.status] || apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => navigate(`/admin/appointments/${apt.id}`)}
                      className="text-amber-600 hover:text-amber-900 p-2" 
                      title="Ko'rish"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
