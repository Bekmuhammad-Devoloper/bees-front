import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  BellIcon, 
  Cog6ToothIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  LanguageIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { Card, Avatar, Button, Badge } from '../../components/ui';
import { useAuthStore, useAppStore } from '../../store';
import { authService, userService } from '../../services';
import toast from 'react-hot-toast';

// Role labels - inglizcha rol nomlari
const roleLabels: Record<string, string> = {
  user: 'User',
  admin: 'Admin',
  doctor: 'Doctor',
  reception: 'Reception',
  driver: 'Driver',
};

// Role panel paths
const rolePanelPaths: Record<string, { path: string; label: string; icon: React.ElementType }> = {
  admin: { path: '/admin', label: 'Admin Panel', icon: BuildingOffice2Icon },
  doctor: { path: '/doctor', label: 'Shifokor Panel', icon: UserGroupIcon },
  reception: { path: '/reception', label: 'Qabulxona Panel', icon: ClipboardDocumentListIcon },
  driver: { path: '/driver', label: 'Haydovchi Panel', icon: TruckIcon },
};

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, setUser } = useAuthStore();
  const { language, setLanguage } = useAppStore();

  // Profil ochilganda user ma'lumotlarini serverdan yangilash
  useEffect(() => {
    const refreshUserData = async () => {
      if (isAuthenticated) {
        try {
          const updatedUser = await userService.getMe();
          if (updatedUser) {
            setUser(updatedUser);
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      }
    };
    refreshUserData();
  }, [isAuthenticated, setUser]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore error
    }
    logout();
    toast.success('Tizimdan chiqdingiz');
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <Card className="text-center py-8">
          <div className="w-20 h-20 bg-gray-500/20 dark:bg-gray-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircleIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-semibold mb-2">
            Tizimga kiring
          </h2>
          <p className="text-black-neon dark:text-gray-200 mb-4">
            Barcha imkoniyatlardan foydalanish uchun tizimga kiring
          </p>
          <Button onClick={() => navigate('/auth/login')}>
            Kirish
          </Button>
        </Card>
      </div>
    );
  }

  // Translations
  const translations = {
    uz: {
      myAppointments: 'Mening qabullarim',
      serviceOrders: 'Xizmat buyurtmalarim',
      notifications: 'Bildirishnomalar',
      settings: 'Sozlamalar',
      language: 'Til',
      logout: 'Tizimdan chiqish',
      goToPanel: "Boshqaruv paneliga o'tish",
    },
    ru: {
      myAppointments: 'Мои записи',
      serviceOrders: 'Мои заказы',
      notifications: 'Уведомления',
      settings: 'Настройки',
      language: 'Язык',
      logout: 'Выйти',
      goToPanel: 'Перейти в панель',
    },
  };
  const t = translations[language] || translations.uz;

  const menuItems = [
    {
      icon: CalendarDaysIcon,
      label: t.myAppointments,
      path: '/appointments',
      badge: null,
    },
    {
      icon: ClipboardDocumentListIcon,
      label: t.serviceOrders,
      path: '/service-orders',
      badge: null,
    },
    {
      icon: BellIcon,
      label: t.notifications,
      path: '/notifications',
      badge: null, // API'dan olinadi
    },
    {
      icon: Cog6ToothIcon,
      label: t.settings,
      path: '/settings',
      badge: null,
    },
  ];

  // Check if user has a special role panel
  const userRole = user?.role || 'user';
  const rolePanel = rolePanelPaths[userRole];

  return (
    <div className="min-h-screen pb-4 bg-transparent">
      {/* User Info Card */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-4 border-b border-white/40 dark:border-gray-700/40">
        <div className="flex items-center">
          <Avatar name={user?.name || user?.phone || 'User'} size="xl" />
          <div className="flex-1 ml-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-semibold">
              {user?.name || 'Ism kiritilmagan'}
            </h2>
            <p className="text-black-neon dark:text-gray-200">
              {user?.phone || 'Telefon kiritilmagan'}
            </p>
            {user?.address && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                📍 {user.address}
              </p>
            )}
            <Badge variant="primary" className="mt-2">
              {roleLabels[userRole] || userRole}
            </Badge>
          </div>
          <button
            onClick={() => navigate('/profile/edit')}
            className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
            title="Sozlamalar"
          >
            <Cog6ToothIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Role Panel Link - Show only for non-user roles */}
      {rolePanel && (
        <Card 
          className="mx-4 mt-4 bg-gradient-to-r from-primary-500 to-primary-600" 
          hover
          onClick={() => navigate(rolePanel.path)}
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <rolePanel.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="font-semibold text-lg">{rolePanel.label}</p>
                <p className="text-primary-100 text-sm">{t.goToPanel}</p>
              </div>
            </div>
            <ChevronRightIcon className="w-6 h-6" />
          </div>
        </Card>
      )}

      {/* Language Switcher */}
      <Card className="mx-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500/20 dark:bg-blue-400/20 rounded-full flex items-center justify-center">
              <LanguageIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <span className="ml-3 font-medium text-gray-900 dark:text-white font-semibold">{t.language}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('uz')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                language === 'uz'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100/50 dark:bg-gray-700/50 text-black-neon dark:text-gray-100 font-medium'
              }`}
            >
              <img src="/uzbekistan-flag-icon.png" alt="UZ" className="w-5 h-4 rounded-sm object-cover" />
              O'zbek
            </button>
            <button
              onClick={() => setLanguage('ru')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                language === 'ru'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100/50 dark:bg-gray-700/50 text-black-neon dark:text-gray-100 font-medium'
              }`}
            >
              <img src="/russia-flag-icon.png" alt="RU" className="w-5 h-4 rounded-sm object-cover" />
              Русский
            </button>
          </div>
        </div>
      </Card>

      {/* Menu Items */}
      <div className="mx-4 mt-4 space-y-2">
        {menuItems.map((item) => (
          <Card
            key={item.path}
            hover
            onClick={() => navigate(item.path)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-500/20 dark:bg-gray-400/20 rounded-full flex items-center justify-center">
                <item.icon className="w-5 h-5 text-black-neon dark:text-gray-100 font-medium" />
              </div>
              <span className="ml-3 font-medium text-gray-900 dark:text-white font-semibold">{item.label}</span>
            </div>
            <div className="flex items-center">
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                  {item.badge}
                </span>
              )}
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        ))}
      </div>

      {/* Logout Button */}
      <div className="mx-4 mt-6">
        <Button
          variant="danger"
          fullWidth
          leftIcon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
          onClick={handleLogout}
        >
          {t.logout}
        </Button>
      </div>

      {/* App Version */}
      <p className="text-center text-gray-400 text-sm mt-6">
        BEES Medical v1.0.0
      </p>
    </div>
  );
};
