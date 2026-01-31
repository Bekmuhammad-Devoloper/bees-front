import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, Button } from '../../components/ui';
import { useAppStore, useAuthStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';
import { roleRequestService, categoryService } from '../../services';
import toast from 'react-hot-toast';
import type { Category } from '../../types';

// Translations
const translations = {
  uz: {
    pageTitle: "Rol o'zgartirish",
    subtitle: "Qaysi lavozimda ishlashni xohlaysiz?",
    doctor: 'Shifokor',
    doctorDesc: 'Bemorlarni qabul qilish, davolash',
    reception: 'Qabulxona',
    receptionDesc: 'Bemorlarni ro\'yxatga olish',
    driver: 'Haydovchi',
    driverDesc: 'Uyga chaqiruvlarni bajarish',
    selectRole: 'Rolni tanlang',
    sendRequest: "So'rov yuborish",
    sending: 'Yuborilmoqda...',
    success: "So'rov muvaffaqiyatli yuborildi! Admin tasdiqlagandan so'ng rolingiz o'zgaradi.",
    error: "Xatolik yuz berdi",
    fullName: "To'liq ism",
    phone: "Telefon raqami",
    category: "Kategoriya",
    selectCategory: "Kategoriyani tanlang",
    specialization: 'Mutaxassislik',
    experience: 'Tajriba (yil)',
    consultationPrice: 'Konsultatsiya narxi',
    bio: "O'zingiz haqingizda",
    vehicleNumber: 'Avtomobil raqami',
    vehicleType: 'Avtomobil modeli',
    licenseNumber: 'Haydovchilik guvohnomasi',
    required: 'Majburiy maydon',
  },
  ru: {
    pageTitle: 'Изменить роль',
    subtitle: 'На какой должности хотите работать?',
    doctor: 'Врач',
    doctorDesc: 'Прием и лечение пациентов',
    reception: 'Регистратура',
    receptionDesc: 'Регистрация пациентов',
    driver: 'Водитель',
    driverDesc: 'Выполнение вызовов на дом',
    selectRole: 'Выберите роль',
    sendRequest: 'Отправить заявку',
    sending: 'Отправка...',
    success: 'Заявка успешно отправлена! После подтверждения администратором ваша роль изменится.',
    error: 'Произошла ошибка',
    fullName: 'Полное имя',
    phone: 'Номер телефона',
    category: 'Категория',
    selectCategory: 'Выберите категорию',
    specialization: 'Специализация',
    experience: 'Опыт (лет)',
    consultationPrice: 'Стоимость консультации',
    bio: 'О себе',
    vehicleNumber: 'Номер автомобиля',
    vehicleType: 'Модель автомобиля',
    licenseNumber: 'Водительское удостоверение',
    required: 'Обязательное поле',
  },
};

type RoleType = 'doctor' | 'reception' | 'driver' | null;

export const RoleRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { user } = useAuthStore();
  const t = translations[language] || translations.uz;

  const [selectedRole, setSelectedRole] = useState<RoleType>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Doctor form fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [categoryId, setCategoryId] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationPrice, setConsultationPrice] = useState('');
  const [bio, setBio] = useState('');

  // Driver form fields (backend DTO: carNumber, carModel, licenseNumber)
  const [carNumber, setCarNumber] = useState('');
  const [carModel, setCarModel] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Load categories for doctor
  useEffect(() => {
    if (selectedRole === 'doctor') {
      loadCategories();
    }
  }, [selectedRole]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      console.log('Categories loaded:', data);
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Kategoriyalarni yuklashda xatolik');
    }
  };

  const roles = [
    {
      id: 'doctor' as RoleType,
      icon: UserGroupIcon,
      label: t.doctor,
      description: t.doctorDesc,
      color: 'bg-blue-500',
    },
    {
      id: 'reception' as RoleType,
      icon: ClipboardDocumentListIcon,
      label: t.reception,
      description: t.receptionDesc,
      color: 'bg-green-500',
    },
    {
      id: 'driver' as RoleType,
      icon: TruckIcon,
      label: t.driver,
      description: t.driverDesc,
      color: 'bg-orange-500',
    },
  ];

  const handleSubmit = async () => {
    if (!selectedRole || !user) return;

    // Validatsiya
    if (selectedRole === 'doctor') {
      if (!categoryId) {
        toast.error("Kategoriya tanlanmagan");
        return;
      }
      if (!specialization.trim()) {
        toast.error("Mutaxassislik kiritilmagan");
        return;
      }
    }

    setLoading(true);
    try {
      // Role-request API orqali so'rov yuborish
      const roleMap: Record<string, string> = {
        doctor: 'doctor',
        reception: 'reception',
        driver: 'driver',
      };

      let additionalData: Record<string, any> = {};
      let reason = '';

      if (selectedRole === 'doctor') {
        reason = `Shifokor: ${specialization}`;
        additionalData = {
          fullName: user.name, // User profilidan olinadi
          phone: user.phone,   // User profilidan olinadi
          categoryId,
          specialization: specialization.trim(),
          experience: parseInt(experience) || 0,
          consultationPrice: parseInt(consultationPrice) || 0,
          bio: bio.trim() || undefined,
        };
      } else if (selectedRole === 'driver') {
        reason = 'Haydovchi bo\'lib ishlash';
        additionalData = {
          carNumber: carNumber.trim() || undefined,
          carModel: carModel.trim() || undefined,
          licenseNumber: licenseNumber.trim() || undefined,
        };
      } else if (selectedRole === 'reception') {
        reason = 'Qabulxona xodimi bo\'lib ishlash';
      }

      await roleRequestService.create({
        requestedRole: roleMap[selectedRole] as any,
        reason,
        additionalData: Object.keys(additionalData).length > 0 ? additionalData : undefined,
      });

      toast.success(t.success);
      navigate('/settings');
    } catch (error: any) {
      console.error('Role request failed:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.message;
      if (Array.isArray(message)) {
        message.forEach((msg: string) => toast.error(msg));
      } else {
        toast.error(message || t.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (!selectedRole) return false;
    
    if (selectedRole === 'doctor') {
      return categoryId !== '' && specialization.trim() !== '';
    }
    if (selectedRole === 'driver') {
      // Driver uchun faqat userId kerak, qolgan maydonlar ixtiyoriy
      return true;
    }
    return true; // reception
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

      <div className="p-4">
        <p className="text-black-neon dark:text-gray-200 mb-4">{t.subtitle}</p>

        {/* Role Selection */}
        <div className="space-y-3 mb-6">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all ${
                selectedRole === role.id 
                  ? 'ring-2 ring-primary-500 bg-primary-500/20 dark:bg-primary-400/20' 
                  : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 ${role.color} rounded-full flex items-center justify-center`}>
                  <role.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 ml-4">
                  <p className="font-semibold text-gray-900 dark:text-white font-semibold">{role.label}</p>
                  <p className="text-sm text-black-neon dark:text-gray-200">{role.description}</p>
                </div>
                {selectedRole === role.id && (
                  <CheckCircleIcon className="w-6 h-6 text-primary-500" />
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Doctor Form */}
        {selectedRole === 'doctor' && (
          <Card className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t.doctor}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  value={user?.name || 'Ism kiritilmagan'}
                  disabled
                  title={t.fullName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.phone}
                </label>
                <input
                  type="text"
                  value={user?.phone || 'Telefon kiritilmagan'}
                  disabled
                  title={t.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.category} *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  title={t.category}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">{t.selectCategory}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.specialization} *
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Terapevt, Kardiolog, Nevrolog..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.experience}
                </label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.consultationPrice}
                </label>
                <input
                  type="number"
                  value={consultationPrice}
                  onChange={(e) => setConsultationPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.bio}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tajribangiz, ta'limingiz haqida..."
                />
              </div>
            </div>
          </Card>
        )}

        {/* Driver Form */}
        {selectedRole === 'driver' && (
          <Card className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t.driver}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.vehicleNumber}
                </label>
                <input
                  type="text"
                  value={carNumber}
                  onChange={(e) => setCarNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="01 A 123 AA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.vehicleType}
                </label>
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Chevrolet Cobalt, Nexia..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.licenseNumber}
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="AA1234567"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Reception Info */}
        {selectedRole === 'reception' && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <p className="text-blue-800">
              {language === 'uz' 
                ? "Qabulxona xodimi sifatida so'rov yuboriladi. Admin tasdiqlagandan so'ng rolingiz o'zgaradi."
                : "Будет отправлена заявка на роль регистратора. После подтверждения администратором ваша роль изменится."
              }
            </p>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          className="w-full"
          disabled={!isFormValid() || loading}
          onClick={handleSubmit}
        >
          {loading ? t.sending : t.sendRequest}
        </Button>
      </div>
    </div>
  );
};
