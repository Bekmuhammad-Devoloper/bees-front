import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  BeakerIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';

const menuItems = [
  { name: 'Dashboard', path: '/laboratory', icon: ChartBarIcon, emoji: '📊' },
  { name: "Yo'llanmalar", path: '/laboratory/referrals', icon: ClipboardDocumentListIcon, emoji: '📋' },
  { name: 'Jarayonda', path: '/laboratory/in-progress', icon: ClockIcon, emoji: '⏳' },
  { name: 'Tugallangan', path: '/laboratory/completed', icon: CheckCircleIcon, emoji: '✅' },
  { name: 'Natijalar', path: '/laboratory/results', icon: BeakerIcon, emoji: '🧪' },
  { name: 'Sozlamalar', path: '/laboratory/settings', icon: Cog6ToothIcon, emoji: '⚙️' },
];

export const LaboratoryLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Bee's Medical" className="w-8 h-8 object-contain" />
              <span className="text-lg font-bold text-black dark:text-white">Laboratoriya</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
            title={sidebarCollapsed ? "Menuni ochish" : "Menuni yopish"}
          >
            <ChevronLeftIcon
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/laboratory'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`
              }
            >
              <span className="text-xl flex-shrink-0">{item.emoji}</span>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Header */}
      <header
        className={`fixed top-0 right-0 h-16 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30 transition-all duration-300 flex items-center justify-between px-6 ${
          sidebarCollapsed ? 'left-16' : 'left-64'
        }`}
      >
        <div>
          <h1 className="text-lg font-semibold text-black dark:text-white">Laboratoriya Paneli</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user?.name || user?.firstName || 'Laborant'}</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg relative" title="Bildirishnomalar">
            <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              0
            </span>
          </button>
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || user?.firstName?.charAt(0) || 'L'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`pt-16 min-h-screen transition-all duration-300 bg-white dark:bg-black ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
