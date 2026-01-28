import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BellIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  PlayCircleIcon,
  PaperAirplaneIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { notificationService } from '../../services';

interface AdminHeaderProps {
  sidebarCollapsed: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ sidebarCollapsed }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);
  
  const currentLang = i18n.language || 'uz';
  
  useEffect(() => {
    loadUnreadCount();
    // Har 30 sekundda yangilash
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };
  
  const toggleLanguage = () => {
    const newLang = currentLang === 'uz' ? 'ru' : 'uz';
    i18n.changeLanguage(newLang);
    localStorage.setItem('bees-language', newLang);
  };
  
  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      <div className="h-full flex items-center justify-between px-4">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Bemor"
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-full w-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
            <IdentificationIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Med ID skaneri</span>
          </button>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <PhoneIcon className="w-4 h-4" />
            <span className="text-sm font-medium">+998 71 202-50-00</span>
            <span className="text-xs text-gray-400">{t('common.support')}</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Telegram">
            <PaperAirplaneIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          <button 
            onClick={() => navigate('/admin/notifications')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative" 
            title="Bildirishnomalar"
          >
            <BellIcon className="w-5 h-5 text-red-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <PlayCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm dark:text-gray-200">{t('common.education')}</span>
          </button>

          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <img 
              src={currentLang === 'uz' ? '/uzbekistan-flag-icon.png' : '/russia-flag-icon.png'} 
              alt={currentLang === 'uz' ? 'UZ' : 'RU'} 
              className="w-5 h-5 object-contain" 
            />
            <span className="text-sm dark:text-gray-200">{currentLang === 'uz' ? "O'zbekcha" : 'Русский'}</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.name || user?.firstName || 'Admin'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role === 'admin' ? 'Administrator' : 
                 user?.role === 'super_admin' ? 'Super Admin' : 
                 user?.role || 'Admin'}
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {(user?.name || user?.firstName || 'A')[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
