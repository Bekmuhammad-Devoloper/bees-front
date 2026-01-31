import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  LanguageIcon,
  ChevronRightIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui';
import { useAuthStore, useAppStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';

// Translations
const translations = {
  uz: {
    pageTitle: 'Sozlamalar',
    editProfile: 'Profilni tahrirlash',
    editProfileDesc: 'Ism, telefon, manzil',
    notifications: 'Bildirishnomalar',
    notificationsDesc: 'Push bildirishnomalar sozlamalari',
    privacy: 'Maxfiylik',
    privacyDesc: 'Maxfiylik sozlamalari',
    language: 'Til',
    languageDesc: 'Ilova tili',
    currentLang: "O'zbek",
    roleRequest: "Rol o'zgartirish",
    roleRequestDesc: "Shifokor, qabul yoki haydovchi bo'lish",
  },
  ru: {
    pageTitle: 'Настройки',
    editProfile: 'Редактировать профиль',
    editProfileDesc: 'Имя, телефон, адрес',
    notifications: 'Уведомления',
    notificationsDesc: 'Настройки push-уведомлений',
    privacy: 'Конфиденциальность',
    privacyDesc: 'Настройки конфиденциальности',
    language: 'Язык',
    languageDesc: 'Язык приложения',
    currentLang: 'Русский',
    roleRequest: 'Изменить роль',
    roleRequestDesc: 'Стать врачом, регистратором или водителем',
  },
};

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { language, setLanguage } = useAppStore();
  const t = translations[language] || translations.uz;

  // Admin dan boshqa barcha rollar uchun rol so'rovi ko'rsatiladi
  const showRoleRequest = user?.role !== 'admin';

  const settingsItems = [
    {
      icon: UserCircleIcon,
      label: t.editProfile,
      description: t.editProfileDesc,
      onClick: () => navigate('/profile/edit'),
    },
    {
      icon: BellIcon,
      label: t.notifications,
      description: t.notificationsDesc,
      onClick: () => navigate('/notifications'),
    },
    ...(showRoleRequest ? [{
      icon: UserPlusIcon,
      label: t.roleRequest,
      description: t.roleRequestDesc,
      onClick: () => navigate('/settings/role-request'),
    }] : []),
    {
      icon: ShieldCheckIcon,
      label: t.privacy,
      description: t.privacyDesc,
      onClick: () => navigate('/settings/privacy'),
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-white/40 dark:border-gray-700/40 sticky top-0 z-10">
        <div className="flex items-center px-4 py-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
            title={t.pageTitle}
          >
            <ArrowLeftIcon className="w-5 h-5 text-black-neon dark:text-gray-100 font-medium" />
          </button>
          <h1 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white font-semibold">{t.pageTitle}</h1>
        </div>
      </div>

      {/* Settings List */}
      <div className="p-4 space-y-3">
        {settingsItems.map((item, index) => (
          <Card 
            key={index}
            className="cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
            onClick={item.onClick}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-500/20 dark:bg-primary-400/20 rounded-full flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 ml-3">
                <p className="font-medium text-gray-900 dark:text-white font-semibold">{item.label}</p>
                <p className="text-sm text-black-neon dark:text-gray-200">{item.description}</p>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        ))}

        {/* Language Selector */}
        <Card>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-500/20 dark:bg-primary-400/20 rounded-full flex items-center justify-center">
              <LanguageIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 ml-3">
              <p className="font-medium text-gray-900 dark:text-white font-semibold">{t.language}</p>
              <p className="text-sm text-black-neon dark:text-gray-200">{t.languageDesc}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('uz')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  language === 'uz'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100/50 dark:bg-gray-700/50 text-black-neon dark:text-gray-100 font-medium hover:bg-gray-200/50'
                }`}
              >
                <img src="/uzbekistan-flag-icon.png" alt="UZ" className="w-4 h-4" />
                O'zbek
              </button>
              <button
                onClick={() => setLanguage('ru')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  language === 'ru'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100/50 dark:bg-gray-700/50 text-black-neon dark:text-gray-100 font-medium hover:bg-gray-200/50'
                }`}
              >
                <img src="/russia-flag-icon.png" alt="RU" className="w-4 h-4" />
                Русский
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
