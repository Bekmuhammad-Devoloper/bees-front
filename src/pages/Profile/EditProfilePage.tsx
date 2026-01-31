import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Card, Button } from '../../components/ui';
import { useAuthStore, useAppStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';
import { userService } from '../../services';
import toast from 'react-hot-toast';

// Translations
const translations = {
  uz: {
    pageTitle: 'Profilni tahrirlash',
    name: 'Ism',
    phone: 'Telefon raqami',
    address: 'Manzil',
    save: 'Saqlash',
    saving: 'Saqlanmoqda...',
    success: "Ma'lumotlar saqlandi",
    error: 'Xatolik yuz berdi',
    namePlaceholder: 'Ismingizni kiriting',
    addressPlaceholder: 'Manzilingizni kiriting',
  },
  ru: {
    pageTitle: 'Редактировать профиль',
    name: 'Имя',
    phone: 'Номер телефона',
    address: 'Адрес',
    save: 'Сохранить',
    saving: 'Сохранение...',
    success: 'Данные сохранены',
    error: 'Произошла ошибка',
    namePlaceholder: 'Введите ваше имя',
    addressPlaceholder: 'Введите ваш адрес',
  },
};

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuthStore();
  const { language } = useAppStore();
  const t = translations[language] || translations.uz;

  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error(language === 'uz' ? 'Ism kiritilishi shart' : 'Имя обязательно');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await userService.updateMe({
        name: name.trim(),
        address: address.trim() || undefined,
      });
      
      // Update user in store
      if (updatedUser) {
        const accessToken = localStorage.getItem('accessToken') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';
        login(updatedUser, accessToken, refreshToken);
      }
      
      toast.success(t.success);
      navigate(-1);
    } catch (error: any) {
      console.error('Update profile failed:', error);
      toast.error(error.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Card>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.name} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
                placeholder={t.namePlaceholder}
              />
            </div>

            {/* Phone (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.phone}
              </label>
              <input
                type="text"
                value={user?.phone || ''}
                disabled
                title={t.phone}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.address}
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={t.addressPlaceholder}
              />
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !name.trim()}
        >
          {loading ? t.saving : t.save}
        </Button>
      </form>
    </div>
  );
};
