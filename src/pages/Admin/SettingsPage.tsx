import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BellIcon, ShieldCheckIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useThemeStore } from '../../store/themeStore';

interface Settings {
  notifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: string;
  twoFactorAuth: boolean;
}

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, setThemeAdmin } = useThemeStore();
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    emailNotifications: true,
    smsNotifications: false,
    language: localStorage.getItem('bees-language') || 'uz',
    twoFactorAuth: false,
  });
  const [loading, setLoading] = useState(false);

  const handleToggle = (key: keyof Settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLanguageChange = (lang: string) => {
    setSettings(prev => ({ ...prev, language: lang }));
    i18n.changeLanguage(lang);
    localStorage.setItem('bees-language', lang);
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      await setThemeAdmin(newTheme);
      toast.success(t('settings.saved'));
    } catch (error) {
      toast.error(t('settings.error'));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // await api.patch('/admin/settings', settings);
      toast.success(t('settings.saved'));
    } catch (error) {
      toast.error(t('settings.error'));
    } finally {
      setLoading(false);
    }
  };

  const SettingRow: React.FC<{
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
    value: boolean;
    onChange: () => void;
  }> = ({ icon: Icon, title, description, value, onChange }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white drop-shadow-lg">{t('settings.title')}</h1>

      {/* Notifications */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/40 dark:border-gray-700/40 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
          <BellIcon className="w-5 h-5" />
          {t('settings.notifications')}
        </h2>
        <div className="space-y-2">
          <SettingRow
            icon={BellIcon}
            title={t('settings.pushNotifications')}
            description={t('settings.pushDesc')}
            value={settings.notifications}
            onChange={() => handleToggle('notifications')}
          />
          <SettingRow
            icon={BellIcon}
            title={t('settings.emailNotifications')}
            description={t('settings.emailDesc')}
            value={settings.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />
          <SettingRow
            icon={BellIcon}
            title={t('settings.smsNotifications')}
            description={t('settings.smsDesc')}
            value={settings.smsNotifications}
            onChange={() => handleToggle('smsNotifications')}
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/40 dark:border-gray-700/40 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5" />
          {t('settings.security')}
        </h2>
        <div className="space-y-2">
          <SettingRow
            icon={ShieldCheckIcon}
            title={t('settings.twoFactor')}
            description={t('settings.twoFactorDesc')}
            value={settings.twoFactorAuth}
            onChange={() => handleToggle('twoFactorAuth')}
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/40 dark:border-gray-700/40 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
          <PaintBrushIcon className="w-5 h-5" />
          {t('settings.appearance')}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={settings.language === 'uz' ? '/uzbekistan-flag-icon.png' : '/russia-flag-icon.png'} 
                  alt={settings.language === 'uz' ? 'UZ' : 'RU'} 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900">{t('settings.language')}</p>
                <p className="text-sm text-gray-600">{t('settings.languageDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLanguageChange('uz')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  settings.language === 'uz' 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src="/uzbekistan-flag-icon.png" alt="UZ" className="w-6 h-6 object-contain" />
                <span className={`text-sm ${settings.language === 'uz' ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>
                  O'zbekcha
                </span>
              </button>
              <button
                onClick={() => handleLanguageChange('ru')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  settings.language === 'ru' 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src="/russia-flag-icon.png" alt="RU" className="w-6 h-6 object-contain" />
                <span className={`text-sm ${settings.language === 'ru' ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>
                  Русский
                </span>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={theme === 'light' ? '/yorug.png' : theme === 'dark' ? '/qorangi.png' : '/tizimli.png'} 
                  alt="Theme" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white font-semibold">{t('settings.theme')}</p>
                <p className="text-sm text-black-neon dark:text-gray-200">{t('settings.themeDesc')}</p>
              </div>
            </div>
          </div>
          
          {/* Theme Cards with Background Images */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                theme === 'light' 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
              }`}
            >
              <div 
                className="h-24 bg-cover bg-center"
                style={{ backgroundImage: "url('/yorug.png')" }}
              />
              <div className={`py-2 text-center text-sm font-medium ${
                theme === 'light' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {t('settings.themeLight')}
              </div>
              {theme === 'light' && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
            
            <button
              onClick={() => handleThemeChange('dark')}
              className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                theme === 'dark' 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
              }`}
            >
              <div 
                className="h-24 bg-cover bg-center"
                style={{ backgroundImage: "url('/qorangi.png')" }}
              />
              <div className={`py-2 text-center text-sm font-medium ${
                theme === 'dark' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {t('settings.themeDark')}
              </div>
              {theme === 'dark' && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
            
            <button
              onClick={() => handleThemeChange('system')}
              className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                theme === 'system' 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
              }`}
            >
              <div 
                className="h-24 bg-cover bg-center"
                style={{ backgroundImage: "url('/tizimli.png')" }}
              />
              <div className={`py-2 text-center text-sm font-medium ${
                theme === 'system' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {t('settings.themeSystem')}
              </div>
              {theme === 'system' && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
