import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Types
interface LaboratoryTest {
  id: string;
  patientName: string;
  medicalCardNumber: string;
  referralType: 'ordinary' | 'privileged';
  referredFrom: string;
  department: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

// Placeholder API
const getLaboratoryTests = async (params: { status?: string }): Promise<LaboratoryTest[]> => {
  // This would be replaced with actual API call
  return [
    {
      id: '1',
      patientName: 'OZODBEKOV MUHAMMADYUSUF XURSANDBEK O\'G\'LI',
      medicalCardNumber: 'BN1035',
      referralType: 'ordinary',
      referredFrom: '2-sonli Asaka KTMP oilaviy poliklinikasi',
      department: 'Oftalmologiya bo\'limi',
      status: 'pending',
      createdAt: '2025-12-24',
    },
    {
      id: '2',
      patientName: 'LUTFIDDINOVA AFRANUR SHUXRATBEK QIZI',
      medicalCardNumber: 'SO05205',
      referralType: 'ordinary',
      referredFrom: '2-sonli Asaka KTMP oilaviy poliklinikasi',
      department: 'Reanimatsiya bo\'limi',
      status: 'pending',
      createdAt: '2025-12-23',
    },
  ];
};

const startTest = async (id: string) => {
  // Placeholder
  return { success: true };
};

const statusConfig = {
  pending: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'Jarayonda', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Tugallangan', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Bekor qilingan', color: 'bg-red-100 text-red-800' },
};

export const LaboratoryReferrals: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  const { data: tests = [], isLoading } = useQuery({
    queryKey: ['laboratory-tests', statusFilter],
    queryFn: () => getLaboratoryTests({ status: statusFilter }),
  });

  const startMutation = useMutation({
    mutationFn: startTest,
    onSuccess: () => {
      toast.success("Tahlil boshlandi");
      queryClient.invalidateQueries({ queryKey: ['laboratory-tests'] });
    },
  });

  const filteredTests = tests.filter(
    (test) =>
      test.patientName.toLowerCase().includes(search.toLowerCase()) ||
      test.medicalCardNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yo'llanmalar</h1>
        <p className="text-gray-600 mt-1">Laboratoriya tekshiruvlariga yo'llanmalar</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Bemorni qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Status bo'yicha filtr"
            >
              <option value="">Barchasi</option>
              <option value="pending">Kutilmoqda</option>
              <option value="in_progress">Jarayonda</option>
              <option value="completed">Tugallangan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Tibbiy karta
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Bemor ism-sharifi
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Yo'llanma turi
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Dan yuborilgan
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Bo'lim
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Sana
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-600">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-600">
                    Yo'llanmalar topilmadi
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-blue-600 font-medium">{test.medicalCardNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{test.patientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        test.referralType === 'privileged' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-black-neon'
                      }`}>
                        {test.referralType === 'privileged' ? 'Imtiyozli' : 'Oddiy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {test.referredFrom}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {test.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[test.status].color}`}>
                        {statusConfig[test.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(test.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Ko'rish"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {test.status === 'pending' && (
                          <button
                            onClick={() => startMutation.mutate(test.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Boshlash"
                          >
                            <PlayIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
