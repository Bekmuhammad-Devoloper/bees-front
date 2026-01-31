import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  XMarkIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui';
import { useAppStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';

// Translations
const translations = {
  uz: {
    pageTitle: 'Maxfiylik',
    dataProtection: "Ma'lumotlar himoyasi",
    dataProtectionDesc: "Sizning shaxsiy ma'lumotlaringiz xavfsiz saqlanadi",
    encryption: 'Shifrlash',
    encryptionDesc: "Barcha ma'lumotlar shifrlanadi",
    privacy: 'Maxfiylik siyosati',
    privacyDesc: 'Maxfiylik siyosatimiz bilan tanishing',
    terms: 'Foydalanish shartlari',
    termsDesc: "Ilova foydalanish shartlari",
  },
  ru: {
    pageTitle: 'Конфиденциальность',
    dataProtection: 'Защита данных',
    dataProtectionDesc: 'Ваши личные данные надежно защищены',
    encryption: 'Шифрование',
    encryptionDesc: 'Все данные шифруются',
    privacy: 'Политика конфиденциальности',
    privacyDesc: 'Ознакомьтесь с нашей политикой',
    terms: 'Условия использования',
    termsDesc: 'Условия использования приложения',
  },
};

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language] || translations.uz;
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  // Content for each section
  const privacyContent = {
    uz: [
      {
        title: "Ma'lumotlar himoyasi",
        content: `Biz sizning shaxsiy ma'lumotlaringizni himoya qilish uchun zamonaviy xavfsizlik texnologiyalaridan foydalanamiz.

• Shaxsiy ma'lumotlaringiz maxfiy saqlanadi
• Ma'lumotlar faqat tibbiy xizmatlar uchun ishlatiladi
• Uchinchi tomonlarga ma'lumot berilmaydi
• Ma'lumotlarni o'chirish huquqiga egasiz`
      },
      {
        title: "Shifrlash",
        content: `Barcha ma'lumotlar SSL/TLS protokoli orqali shifrlanadi.

• 256-bit AES shifrlash
• Xavfsiz serverlar
• Muntazam xavfsizlik tekshiruvlari
• HTTPS protokoli`
      },
      {
        title: "Maxfiylik siyosati",
        content: `Maxfiylik siyosatimiz sizning huquqlaringizni himoya qiladi.

• Ma'lumotlarni yig'ish va saqlash qoidalari
• Foydalanuvchi huquqlari
• Ma'lumotlarni o'chirish tartibi
• Aloqa ma'lumotlari`
      },
      {
        title: "Foydalanish shartlari",
        content: `Ilovadan foydalanish shartlari:

• Xizmatlardan foydalanish qoidalari
• Foydalanuvchi majburiyatlari
• Javobgarlik chegaralari
• Nizolarni hal qilish tartibi`
      }
    ],
    ru: [
      {
        title: "Защита данных",
        content: `Мы используем современные технологии безопасности для защиты ваших личных данных.

• Ваши личные данные хранятся конфиденциально
• Данные используются только для медицинских услуг
• Данные не передаются третьим лицам
• Вы имеете право на удаление данных`
      },
      {
        title: "Шифрование",
        content: `Все данные шифруются по протоколу SSL/TLS.

• 256-битное AES шифрование
• Безопасные серверы
• Регулярные проверки безопасности
• Протокол HTTPS`
      },
      {
        title: "Политика конфиденциальности",
        content: `Наша политика конфиденциальности защищает ваши права.

• Правила сбора и хранения данных
• Права пользователей
• Порядок удаления данных
• Контактная информация`
      },
      {
        title: "Условия использования",
        content: `Условия использования приложения:

• Правила пользования услугами
• Обязанности пользователя
• Ограничения ответственности
• Порядок разрешения споров`
      }
    ]
  };

  const content = privacyContent[language] || privacyContent.uz;

  const privacyItems = [
    {
      icon: ShieldCheckIcon,
      label: t.dataProtection,
      description: t.dataProtectionDesc,
      color: 'bg-green-500',
    },
    {
      icon: LockClosedIcon,
      label: t.encryption,
      description: t.encryptionDesc,
      color: 'bg-blue-500',
    },
    {
      icon: EyeSlashIcon,
      label: t.privacy,
      description: t.privacyDesc,
      color: 'bg-purple-500',
    },
    {
      icon: DocumentTextIcon,
      label: t.terms,
      description: t.termsDesc,
      color: 'bg-orange-500',
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

      <div className="p-4 space-y-3">
        {privacyItems.map((item, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
            onClick={() => setSelectedItem(index)}
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 ml-3">
                <p className="font-medium text-gray-900 dark:text-white font-semibold">{item.label}</p>
                <p className="text-sm text-black-neon dark:text-gray-200">{item.description}</p>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        ))}

        {/* Info Card */}
        <Card className="bg-blue-500/20 dark:bg-blue-400/20 border-blue-200/50 dark:border-blue-500/30 mt-6">
          <div className="text-center">
            <ShieldCheckIcon className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-3" />
            <p className="text-blue-800 dark:text-blue-300 font-medium">
              {language === 'uz' 
                ? "Sizning xavfsizligingiz biz uchun muhim!"
                : "Ваша безопасность важна для нас!"
              }
            </p>
            <p className="text-blue-600 text-sm mt-1">
              {language === 'uz'
                ? "Biz sizning ma'lumotlaringizni uchinchi tomonlarga bermaymiz"
                : "Мы не передаем ваши данные третьим лицам"
              }
            </p>
          </div>
        </Card>
      </div>

      {/* Modal */}
      {selectedItem !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/40">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-semibold">
                {content[selectedItem].title}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                title={language === 'uz' ? 'Yopish' : 'Закрыть'}
              >
                <XMarkIcon className="w-5 h-5 text-black-neon dark:text-gray-200" />
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className={`w-12 h-12 ${privacyItems[selectedItem].color} rounded-full flex items-center justify-center mb-4`}>
                {React.createElement(privacyItems[selectedItem].icon, { className: "w-6 h-6 text-white" })}
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {content[selectedItem].content}
              </p>
            </div>
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/40">
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                {language === 'uz' ? 'Tushundim' : 'Понятно'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
