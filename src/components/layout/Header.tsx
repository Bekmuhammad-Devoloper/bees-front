import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';
import { notificationService } from '../../services';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBack = false, 
  rightAction 
}) => {
  const navigate = useNavigate();
  const { language, setLanguage } = useAppStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count || 0);
    } catch (error) {
      // Xato bo'lsa ham davom etamiz
    }
  };

  const handleBack = () => {
    if (window.Telegram?.WebApp?.BackButton) {
      navigate(-1);
    } else {
      navigate(-1);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'uz' ? 'ru' : 'uz');
  };

  // Show Telegram-style header on inner pages
  if (showBack) {
    return (
      <header className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-white/40 dark:border-gray-700/40 z-30 safe-area-top">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
            title="Orqaga"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
          {title && (
            <h1 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white ml-2">
              {title}
            </h1>
          )}
          {rightAction}
        </div>
      </header>
    );
  }

  // Main header for home page
  return (
    <header className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-white/40 dark:border-gray-700/40 z-30 safe-area-top">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <img src="/logo.jpg" alt="Bee's Medical" className="w-10 h-10 mr-2 rounded-lg object-cover" />
          <span className="font-bold text-lg text-gray-900 dark:text-white">Bee's Medical</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Tilni o'zgartirish"
          >
            <img 
              src={language === 'uz' ? '/uzbekistan-flag-icon.png' : '/russia-flag-icon.png'} 
              alt={language === 'uz' ? 'UZ' : 'RU'} 
              className="w-5 h-4 rounded-sm object-cover" 
            />
            <span>{language === 'uz' ? "O'zbek" : 'Русский'}</span>
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            title="Bildirishnomalar"
          >
            <BellIcon className="w-6 h-6 text-gray-600" />
            {/* Notification badge */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
