import React, { useState } from 'react';
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  ShieldCheckIcon,
  KeyIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore, useAuthStore } from '../../store';
import toast from 'react-hot-toast';

export const DoctorSettingsPage: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const { language, setLanguage } = useAppStore();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState({
    newAppointment: true,
    appointmentReminder: true,
    messages: true,
    updates: false,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const themes = [
    { key: 'light', label: 'Yorug', icon: SunIcon },
    { key: 'dark', label: 'Qorong\'i', icon: MoonIcon },
    { key: 'system', label: 'Tizim', icon: ComputerDesktopIcon },
  ];

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Sozlamalar saqlandi');
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Parollar mos kelmaydi');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }
    // API call here
    toast.success('Parol muvaffaqiyatli o\'zgartirildi');
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg">
            <MoonIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Mavzu</h3>
            <p className="text-sm text-gray-400">Ilova ko'rinishini sozlang</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key as any)}
              className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                theme === t.key
                  ? 'bg-gradient-to-r from-cyan-500/20 to-green-500/20 border-cyan-500/50 text-cyan-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <t.icon className="w-6 h-6" />
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg">
            <LanguageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Til</h3>
            <p className="text-sm text-gray-400">Ilova tilini tanlang</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setLanguage('uz')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
              language === 'uz'
                ? 'bg-gradient-to-r from-cyan-500/20 to-green-500/20 border-cyan-500/50 text-cyan-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <img src="/uzbekistan-flag-icon.png" alt="UZ" className="w-5 h-5" />
            <span className="font-medium">O'zbek</span>
          </button>
          <button
            onClick={() => setLanguage('ru')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
              language === 'ru'
                ? 'bg-gradient-to-r from-cyan-500/20 to-green-500/20 border-cyan-500/50 text-cyan-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <img src="/russia-flag-icon.png" alt="RU" className="w-5 h-5" />
            <span className="font-medium">Русский</span>
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg">
            <BellIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Bildirishnomalar</h3>
            <p className="text-sm text-gray-400">Bildirishnomalarni sozlang</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'newAppointment', label: 'Yangi qabullar', desc: 'Yangi qabul qo\'shilganda xabar' },
            { key: 'appointmentReminder', label: 'Qabul eslatmalari', desc: 'Qabul vaqti yaqinlashganda' },
            { key: 'messages', label: 'Xabarlar', desc: 'Yangi xabarlar kelganda' },
            { key: 'updates', label: 'Yangilanishlar', desc: 'Ilova yangilanishlari haqida' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="font-medium text-white">{item.label}</p>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
              <button
                onClick={() => handleNotificationChange(item.key as any)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[item.key as keyof typeof notifications]
                    ? 'bg-gradient-to-r from-cyan-500 to-green-500'
                    : 'bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Xavfsizlik</h3>
            <p className="text-sm text-gray-400">Hisobingiz xavfsizligini sozlang</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <KeyIcon className="w-5 h-5 text-cyan-400" />
              <div className="text-left">
                <p className="font-medium text-white">Parolni o'zgartirish</p>
                <p className="text-sm text-gray-400">Yangi parol o'rnatish</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl border border-red-500/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-400">Xavfli zona</h3>
            <p className="text-sm text-gray-400">Qaytarib bo'lmaydigan amallar</p>
          </div>
        </div>

        <button className="px-4 py-2.5 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors">
          Hisobni o'chirish
        </button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-white/10 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-6">Parolni o'zgartirish</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Joriy parol</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Joriy parolingiz"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Yangi parol</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Yangi parol"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Parolni tasdiqlash</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Parolni qayta kiriting"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
              >
                Saqlash
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2.5 bg-white/10 text-gray-400 rounded-lg font-medium hover:bg-white/20 transition-all"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
