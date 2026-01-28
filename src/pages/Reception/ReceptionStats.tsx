import React, { useEffect, useState } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { receptionService } from '../../services';

interface StatsData {
  total: number;
  waiting: number;
  inProgress: number;
  completed: number;
  noShow: number;
}

export const ReceptionStats: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await receptionService.getTodayStats();
      console.log('Stats data:', data);
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Mock data
      setStats({
        total: 0,
        waiting: 0,
        inProgress: 0,
        completed: 0,
        noShow: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const completionRate = stats && stats.total > 0
    ? Math.round(((stats.completed + stats.noShow) / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {(['day', 'week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === p
                ? 'bg-gradient-to-r from-cyan-500 to-green-500 text-white shadow-[0_0_15px_rgba(0,255,200,0.3)]'
                : 'bg-black/40 backdrop-blur-md text-gray-300 hover:bg-black/60 border border-white/10'
            }`}
          >
            {p === 'day' ? 'Bugun' : p === 'week' ? 'Hafta' : 'Oy'}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-sm text-gray-400">Jami</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.total || 0}</p>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-sm text-gray-400">Kutilmoqda</span>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{stats?.waiting || 0}</p>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <UsersIcon className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-sm text-gray-400">Qabulda</span>
          </div>
          <p className="text-3xl font-bold text-purple-400">{stats?.inProgress || 0}</p>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-green-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-sm text-gray-400">Tugallangan</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{stats?.completed || 0}</p>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-red-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <UsersIcon className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-sm text-gray-400">Kelmadi</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{stats?.noShow || 0}</p>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-4">
          Bajarilish darajasi
        </h3>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${completionRate * 3.52} 352`}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{completionRate}%</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tugallangan</span>
              <span className="text-green-400 font-medium">{stats?.completed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Jarayonda</span>
              <span className="text-purple-400 font-medium">{stats?.inProgress || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Kutilmoqda</span>
              <span className="text-yellow-400 font-medium">{stats?.waiting || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Kelmadi</span>
              <span className="text-red-400 font-medium">{stats?.noShow || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
