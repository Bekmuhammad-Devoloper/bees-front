import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Card, Avatar, StatusBadge, PageLoading, EmptyState, Button } from '../../components/ui';
import { Header } from '../../components/layout';
import { appointmentService } from '../../services';
import { useAuthStore, useAppStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';
import { format } from 'date-fns';
import { uz, ru } from 'date-fns/locale';
import type { Appointment, AppointmentStatus } from '../../types';

// Translations
const translations = {
  uz: {
    pageTitle: 'Mening qabullarim',
    all: 'Barchasi',
    pending: 'Kutilmoqda',
    confirmed: 'Tasdiqlangan',
    completed: 'Tugallangan',
    cancelled: 'Bekor qilingan',
    noAppointments: "Qabullar yo'q",
    noAppointmentsDesc: 'Hozircha sizda hech qanday qabul mavjud emas',
    findDoctor: 'Shifokor topish',
    doctor: 'Shifokor',
    loadMore: "Ko'proq yuklash",
  },
  ru: {
    pageTitle: 'Мои записи',
    all: 'Все',
    pending: 'Ожидается',
    confirmed: 'Подтверждено',
    completed: 'Завершено',
    cancelled: 'Отменено',
    noAppointments: 'Записей нет',
    noAppointmentsDesc: 'У вас пока нет записей на прием',
    findDoctor: 'Найти врача',
    doctor: 'Врач',
    loadMore: 'Загрузить еще',
  },
};

export const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { language } = useAppStore();
  const t = translations[language] || translations.uz;
  
  const tabs = [
    { key: 'all', label: t.all },
    { key: 'pending', label: t.pending },
    { key: 'confirmed', label: t.confirmed },
    { key: 'completed', label: t.completed },
    { key: 'cancelled', label: t.cancelled },
  ];
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    loadAppointments();
  }, [activeTab, isAuthenticated]);

  const loadAppointments = async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
        setPage(1);
      }
      
      const currentPage = loadMore ? page + 1 : 1;
      const data = await appointmentService.getMyAppointments({
        status: activeTab === 'all' ? undefined : (activeTab as AppointmentStatus),
        page: currentPage,
        limit: 10,
      });
      
      if (loadMore) {
        setAppointments((prev) => [...prev, ...(data.data || [])]);
      } else {
        setAppointments(data.data || []);
      }
      
      setPage(currentPage);
      setHasMore((data.meta?.page || 1) < (data.meta?.totalPages || 1));
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header title={t.pageTitle} showBack />
      
      {/* Tabs */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-white/40 dark:border-gray-700/40 sticky top-14 z-20">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'text-primary-500 border-primary-500'
                  : 'text-black-neon dark:text-gray-200 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <PageLoading />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={<CalendarDaysIcon className="w-8 h-8" />}
            title={t.noAppointments}
            description={t.noAppointmentsDesc}
            action={
              <Button onClick={() => navigate('/doctors')}>
                {t.findDoctor}
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <Card
                key={appointment.id}
                hover
                onClick={() => navigate(`/appointments/${appointment.id}`)}
              >
                <div className="flex items-start">
                  <Avatar name={appointment.doctor?.user?.name || 'Doctor'} size="lg" />
                  <div className="flex-1 ml-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white font-semibold">
                          {appointment.doctor?.user?.name || t.doctor}
                        </p>
                        <p className="text-sm text-black-neon dark:text-gray-200">
                          {appointment.doctor?.specialization}
                        </p>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </div>
                    
                    <div className="flex items-center mt-2 space-x-3 text-sm text-black-neon dark:text-gray-200">
                      <span className="flex items-center">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        {format(new Date(appointment.appointmentDate), 'd MMM yyyy', { locale: language === 'ru' ? ru : uz })}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {appointment.appointmentTime}
                      </span>
                    </div>

                    {appointment.reason && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-1">
                        {appointment.reason}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {hasMore && (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => loadAppointments(true)}
              >
                {t.loadMore}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
