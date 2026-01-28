import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  CalendarDaysIcon, 
  BeakerIcon,
  ClockIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Card, Badge, Avatar, CardSkeleton } from '../../components/ui';
import { categoryService, doctorService, appointmentService } from '../../services';
import { useAuthStore, useAppStore } from '../../store';
import type { Category, Doctor, Appointment } from '../../types';

// Translations
const translations = {
  uz: {
    hello: 'Salom',
    welcomeMessage: "Sog'lom kun tilaymiz!",
    searchPlaceholder: 'Shifokor yoki mutaxassislik qidirish...',
    doctors: 'Shifokorlar',
    bookAppointment: 'Qabulga yozilish',
    tests: 'Tahlillar',
    homeVisit: 'Uyga chaqiruv',
    upcomingAppointments: 'Kelgusi qabullar',
    viewAll: 'Barchasi',
    waiting: 'Kutilmoqda',
    specializations: 'Mutaxassisliklar',
    topDoctors: 'Top shifokorlar',
    doctorsCount: 'shifokor',
    yearsExperience: 'yil tajriba',
    doctor: 'Shifokor',
  },
  ru: {
    hello: 'Привет',
    welcomeMessage: 'Желаем здорового дня!',
    searchPlaceholder: 'Поиск врача или специальности...',
    doctors: 'Врачи',
    bookAppointment: 'Записаться',
    tests: 'Анализы',
    homeVisit: 'Вызов на дом',
    upcomingAppointments: 'Предстоящие записи',
    viewAll: 'Все',
    waiting: 'Ожидается',
    specializations: 'Специальности',
    topDoctors: 'Лучшие врачи',
    doctorsCount: 'врачей',
    yearsExperience: 'лет опыта',
    doctor: 'Врач',
  },
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language] || translations.uz;
  const { user, isAuthenticated } = useAuthStore();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [topDoctors, setTopDoctors] = useState<Doctor[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, doctorsData] = await Promise.all([
        categoryService.getAll(),
        doctorService.getAll({ limit: 100 }), // Ko'proq shifokorlar olish
      ]);
      
      const allDoctors = doctorsData.data || [];
      
      // Kategoriyalarni shifokorlar soni bilan yangilash
      const categoriesWithCount = categoriesData.map(cat => {
        // Shifokorlarni categoriya bo'yicha sanash
        const doctorCount = allDoctors.filter(doc => 
          doc.categoryId === cat.id || 
          doc.category?.id === cat.id ||
          doc.specialization?.toLowerCase() === cat.name?.toLowerCase()
        ).length;
        return {
          ...cat,
          doctorCount: doctorCount || cat.doctorCount || 0
        };
      });
      
      setCategories(categoriesWithCount);
      setTopDoctors(allDoctors.slice(0, 4));

      // Load user's upcoming appointments if authenticated
      if (isAuthenticated) {
        const appointmentsData = await appointmentService.getMyAppointments({
          status: 'pending' as any,
          limit: 3,
        });
        setUpcomingAppointments(appointmentsData.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: UserGroupIcon, label: t.doctors, path: '/doctors', color: 'bg-blue-500' },
    { icon: CalendarDaysIcon, label: t.bookAppointment, path: '/doctors', color: 'bg-green-500' },
    { icon: BeakerIcon, label: t.tests, path: '/services', color: 'bg-purple-500' },
    { icon: ClockIcon, label: t.homeVisit, path: '/services', color: 'bg-orange-500' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white">
        <h1 className="text-xl font-bold mb-1">
          {t.hello}{user?.name ? `, ${user.name}` : ''}! 👋
        </h1>
        <p className="text-primary-100 text-sm">
          {t.welcomeMessage}
        </p>
        
        {/* Search Bar */}
        <div className="mt-4 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
            onClick={() => navigate('/doctors')}
            readOnly
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-sm border border-white/40 dark:border-gray-700/40 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center mb-2`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200 text-center leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Upcoming Appointments */}
      {isAuthenticated && upcomingAppointments.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-black-neon dark:text-white">{t.upcomingAppointments}</h2>
            <button 
              onClick={() => navigate('/appointments')}
              className="text-sm text-primary-500 font-medium flex items-center"
            >
              {t.viewAll}
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <Card 
                key={appointment.id} 
                hover 
                onClick={() => navigate(`/appointments/${appointment.id}`)}
              >
                <div className="flex items-center">
                  <Avatar 
                    name={appointment.doctor?.user?.name || 'Doctor'} 
                    size="lg" 
                  />
                  <div className="flex-1 ml-3">
                    <p className="font-medium text-gray-900 dark:text-white font-semibold">
                      {appointment.doctor?.user?.name || t.doctor}
                    </p>
                    <p className="text-sm text-black-neon dark:text-gray-200">
                      {appointment.doctor?.specialization}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-primary-500">
                      <CalendarDaysIcon className="w-4 h-4 mr-1" />
                      {appointment.appointmentDate} • {appointment.appointmentTime}
                    </div>
                  </div>
                  <Badge variant="warning">{t.waiting}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-black-neon">{t.specializations}</h2>
          <button 
            onClick={() => navigate('/categories')}
            className="text-sm text-primary-500 font-medium flex items-center"
          >
            {t.viewAll}
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.slice(0, 6).map((category) => (
              <Card 
                key={category.id} 
                hover 
                onClick={() => navigate(`/doctors?category=${category.id}`)}
                className="flex items-center"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl mr-3 overflow-hidden">
                  {category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
                    <img src={category.icon} alt={category.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <img src="/docrors-category.png" alt={category.name} className="w-8 h-8 object-contain" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white font-semibold text-sm">{language === 'ru' ? (category.nameRu || category.name) : (category.nameUz || category.name)}</p>
                  <p className="text-xs text-black-neon dark:text-gray-200">{category.doctorCount || 0} {t.doctorsCount}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Top Doctors */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-black-neon">{t.topDoctors}</h2>
          <button 
            onClick={() => navigate('/doctors')}
            className="text-sm text-primary-500 font-medium flex items-center"
          >
            {t.viewAll}
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {topDoctors.map((doctor) => (
              <Card 
                key={doctor.id} 
                hover 
                onClick={() => navigate(`/doctors/${doctor.id}`)}
              >
                <div className="flex items-center">
                  <Avatar name={doctor.user?.name || 'Doctor'} size="lg" />
                  <div className="flex-1 ml-3">
                    <p className="font-medium text-gray-900 dark:text-white font-semibold">
                      {doctor.user?.name || t.doctor}
                    </p>
                    <p className="text-sm text-black-neon dark:text-gray-200">
                      {doctor.specialization}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm text-black-neon dark:text-gray-100 font-medium ml-1">
                        {doctor.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600 mx-2">•</span>
                      <span className="text-sm text-black-neon dark:text-gray-200">
                        {doctor.experience} {t.yearsExperience}
                      </span>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
