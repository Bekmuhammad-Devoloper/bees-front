import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BeakerIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { labOrderService } from '../../services/laboratoryService';

export const LaboratoryDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['laboratory-stats'],
    queryFn: () => labOrderService.getStats(),
  });

  const statCards = [
    {
      title: "Kutilayotgan yo'llanmalar",
      value: stats?.pending || 0,
      icon: ClipboardDocumentListIcon,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Jarayonda',
      value: stats?.inProgress || 0,
      icon: ClockIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: "Bugun tugallangan",
      value: stats?.todayCompleted || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Jami tugallangan',
      value: stats?.completed || 0,
      icon: BeakerIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Laboratoriya statistikasi</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-6 border border-gray-100`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {isLoading ? '...' : stat.value}
            </p>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tezkor harakatlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/laboratory/referrals"
            className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <ClipboardDocumentListIcon className="w-6 h-6 text-yellow-600" />
            <span className="font-medium text-gray-900">Yangi yo'llanmalarni ko'rish</span>
          </a>
          <a
            href="/laboratory/in-progress"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ClockIcon className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-gray-900">Jarayondagi tahlillar</span>
          </a>
          <a
            href="/laboratory/results"
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <BeakerIcon className="w-6 h-6 text-green-600" />
            <span className="font-medium text-gray-900">Natijalarni kiritish</span>
          </a>
        </div>
      </div>
    </div>
  );
};
