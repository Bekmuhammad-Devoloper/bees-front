import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  BellIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';

const menuItems = [
  { name: 'Dashboard', path: '/doctor/dashboard', icon: ChartBarIcon },
  { name: 'Bugungi qabullar', path: '/doctor/today', icon: CalendarDaysIcon },
  { name: 'Barcha qabullar', path: '/doctor/appointments', icon: ClockIcon },
  { name: 'Ish jadvali', path: '/doctor/schedule', icon: CalendarDaysIcon },
  { name: 'Profil', path: '/doctor/profile', icon: UserIcon },
  { name: 'Sozlamalar', path: '/doctor/settings', icon: Cog6ToothIcon },
];

export const DoctorLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, getBackgroundImage } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url('${getBackgroundImage()}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-black/40 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-40 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Bee's Medical" className="w-8 h-8 object-contain rounded-lg" />
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">Shifokor</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Yig'ish"
          >
            <ChevronLeftIcon
              className={`w-5 h-5 text-gray-400 transition-transform ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-2 flex-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-green-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
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

        {/* Logout Button */}
        <div className="p-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">Chiqish</span>
            )}
          </button>
        </div>
      </aside>

      {/* Header */}
      <header
        className={`fixed top-0 right-0 h-16 bg-black/40 backdrop-blur-xl border-b border-white/10 z-30 transition-all duration-300 flex items-center justify-between px-6 ${
          sidebarCollapsed ? 'left-16' : 'left-64'
        }`}
      >
        <div>
          <h1 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">Shifokor Paneli</h1>
          <p className="text-sm text-gray-400">{user?.name || 'Shifokor'}</p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/doctor/notifications')}
            className="p-2 hover:bg-white/10 rounded-lg relative transition-colors" 
            title="Bildirishnomalar"
          >
            <BellIcon className="w-6 h-6 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full text-[10px] text-white flex items-center justify-center">
              3
            </span>
          </button>
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || 'D'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-20 min-h-screen ${
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
