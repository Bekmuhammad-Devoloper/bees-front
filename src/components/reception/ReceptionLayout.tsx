import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';

const menuItems = [
  { name: 'Bugungi qabullar', path: '/reception/today', icon: CalendarDaysIcon },
  { name: 'Statistika', path: '/reception/stats', icon: ChartBarIcon },
  { name: 'Tarix', path: '/reception/history', icon: ClockIcon },
  { name: 'Bemorlar', path: '/reception/patients', icon: UserGroupIcon },
];

export const ReceptionLayout: React.FC = () => {
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
    <div 
      className="min-h-screen bg-white dark:bg-black text-black dark:text-white"
    >
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="Bee's Medical" className="w-12 h-12 object-contain rounded-lg" />
              <div>
                <span className="text-lg font-bold text-black dark:text-white">
                  Bee's Medical
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">Qabulxona</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <img src="/logo.jpg" alt="Bee's Medical" className="w-10 h-10 object-contain rounded-lg mx-auto" />
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg absolute right-2 top-6"
            title="Yig'ish"
          >
            <ChevronLeftIcon
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        <nav className="p-2 mt-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
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
          <h1 className="text-lg font-semibold text-black dark:text-white">
            Bee's Medical
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user?.name || 'Qabulxona xodimi'}</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg relative" title="Bildirishnomalar">
            <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || 'Q'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-20 min-h-screen bg-white dark:bg-black ${
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
