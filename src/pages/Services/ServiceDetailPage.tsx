import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClockIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  PhoneIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { Card, Button, PageLoading } from '../../components/ui';
import { Header } from '../../components/layout';
import { serviceService } from '../../services';
import { useAppStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';
import type { Service } from '../../types';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { uz } from 'date-fns/locale';

const translations = {
  uz: {
    pageTitle: 'Xizmat',
    price: 'Narxi',
    duration: 'Davomiyligi',
    minutes: 'daqiqa',
    currency: "so'm",
    order: 'Buyurtma berish',
    description: 'Tavsif',
    notFound: 'Xizmat topilmadi',
    orderSuccess: 'Buyurtma muvaffaqiyatli qabul qilindi!',
    orderError: 'Xatolik yuz berdi',
    features: 'Xususiyatlari',
    contactUs: 'Bog\'lanish',
    phone: '+998 90 123 45 67',
    selectDate: 'Sanani tanlang',
    notes: 'Izoh (ixtiyoriy)',
    notesPlaceholder: 'Qo\'shimcha ma\'lumot...',
  },
  ru: {
    pageTitle: 'Услуга',
    price: 'Цена',
    duration: 'Длительность',
    minutes: 'минут',
    currency: 'сум',
    order: 'Заказать',
    description: 'Описание',
    notFound: 'Услуга не найдена',
    orderSuccess: 'Заказ успешно принят!',
    orderError: 'Произошла ошибка',
    features: 'Особенности',
    contactUs: 'Связаться',
    phone: '+998 90 123 45 67',
    selectDate: 'Выберите дату',
    notes: 'Примечание (необязательно)',
    notesPlaceholder: 'Дополнительная информация...',
  },
};

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language] || translations.uz;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [notes, setNotes] = useState('');

  // Generate date options for next 7 days
  const dateOptions = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

  useEffect(() => {
    if (id) {
      loadService();
    }
  }, [id]);

  const loadService = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getById(id!);
      setService(data);
    } catch (error) {
      console.error('Failed to load service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!service) return;

    try {
      setOrderLoading(true);
      await serviceService.createOrder({
        serviceId: service.id,
        scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
        notes: notes || undefined,
      });
      toast.success(t.orderSuccess);
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.orderError);
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        <Header title={t.pageTitle} showBack />
        <div className="p-4 text-center">
          <p className="text-gray-600">{t.notFound}</p>
        </div>
      </div>
    );
  }

  const serviceName = language === 'ru' 
    ? (service.nameRu || service.name) 
    : (service.nameUz || service.name);

  const serviceDescription = language === 'ru'
    ? (service.descriptionRu || service.description)
    : (service.descriptionUz || service.description);

  return (
    <div className="min-h-screen pb-24 bg-white dark:bg-black text-black dark:text-white">
      <Header title={t.pageTitle} showBack />

      {/* Service Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-4 border-b border-white/40 dark:border-gray-700/40">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white font-semibold">{serviceName}</h1>
        
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center text-primary-500">
            <CurrencyDollarIcon className="w-5 h-5 mr-1" />
            <span className="font-bold text-lg">
              {Math.floor(service.price || 0).toLocaleString('ru-RU')} {t.currency}
            </span>
          </div>
          
          {service.duration && (
            <div className="flex items-center text-black-neon dark:text-gray-200">
              <ClockIcon className="w-5 h-5 mr-1" />
              <span>{service.duration} {t.minutes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {serviceDescription && (
        <Card className="mx-4 mt-4">
          <h3 className="font-semibold text-gray-900 dark:text-white font-semibold mb-2">{t.description}</h3>
          <p className="text-black-neon dark:text-gray-100 font-medium text-sm leading-relaxed">{serviceDescription}</p>
        </Card>
      )}

      {/* Date Selection */}
      <div className="px-4 mt-4">
        <h3 className="font-semibold text-gray-900 dark:text-white font-semibold mb-3 flex items-center">
          <CalendarDaysIcon className="w-5 h-5 mr-2" />
          {t.selectDate}
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {dateOptions.map((date) => {
            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center p-3 rounded-xl min-w-[70px] transition-colors ${
                  isSelected
                    ? 'bg-primary-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-700'
                }`}
              >
                <span className="text-xs font-medium">
                  {format(date, 'EEE', { locale: uz })}
                </span>
                <span className="text-lg font-bold mt-1">
                  {format(date, 'd')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <Card className="mx-4 mt-4">
        <h3 className="font-semibold text-gray-900 mb-2">{t.notes}</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.notesPlaceholder}
          rows={3}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
        />
      </Card>

      {/* Features */}
      <Card className="mx-4 mt-4">
        <h3 className="font-semibold text-gray-900 mb-3">{t.features}</h3>
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm">Professional xizmat</span>
          </div>
          <div className="flex items-center text-gray-600">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm">Malakali mutaxassislar</span>
          </div>
          <div className="flex items-center text-gray-600">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm">Zamonaviy uskunalar</span>
          </div>
        </div>
      </Card>

      {/* Contact */}
      <Card className="mx-4 mt-4">
        <h3 className="font-semibold text-gray-900 mb-3">{t.contactUs}</h3>
        <a 
          href={`tel:${t.phone}`}
          className="flex items-center text-primary-500"
        >
          <PhoneIcon className="w-5 h-5 mr-2" />
          <span>{t.phone}</span>
        </a>
      </Card>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-area-bottom">
        <Button
          fullWidth
          size="lg"
          loading={orderLoading}
          onClick={handleOrder}
        >
          {t.order}
        </Button>
      </div>
    </div>
  );
};
