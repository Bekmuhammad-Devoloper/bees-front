import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BeakerIcon, 
  HomeModernIcon, 
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Card, Badge, PageLoading, EmptyState } from '../../components/ui';
import { Header } from '../../components/layout';
import { serviceService } from '../../services';
import { useAppStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';
import type { Service } from '../../types';
import { ServiceType } from '../../types';

const serviceTypeIcons: Record<ServiceType, React.ElementType> = {
  laboratory: BeakerIcon,
  diagnostic: ClipboardDocumentCheckIcon,
  home_visit: HomeModernIcon,
  consultation: ChatBubbleLeftRightIcon,
};

// Translations
const translations = {
  uz: {
    pageTitle: 'Xizmatlar',
    notFoundTitle: 'Xizmatlar topilmadi',
    notFoundDesc: 'Bu turdagi xizmatlar hozircha mavjud emas',
    currency: "so'm",
    minutes: 'daqiqa',
    serviceTypes: {
      laboratory: 'Laboratoriya',
      diagnostic: 'Diagnostika',
      home_visit: 'Uyga chaqiruv',
      consultation: 'Konsultatsiya',
    } as Record<string, string>,
  },
  ru: {
    pageTitle: 'Услуги',
    notFoundTitle: 'Услуги не найдены',
    notFoundDesc: 'Услуги данного типа пока недоступны',
    currency: 'сум',
    minutes: 'минут',
    serviceTypes: {
      laboratory: 'Лаборатория',
      diagnostic: 'Диагностика',
      home_visit: 'Вызов на дом',
      consultation: 'Консультация',
    } as Record<string, string>,
  },
};

const serviceTypeColors: Record<ServiceType, string> = {
  laboratory: 'bg-purple-500',
  diagnostic: 'bg-blue-500',
  home_visit: 'bg-orange-500',
  consultation: 'bg-green-500',
};

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language] || translations.uz;
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log('ServicesPage rendering, loading:', loading, 'services:', services.length);

  useEffect(() => {
    console.log('ServicesPage useEffect, selectedType:', selectedType);
    loadServices();
  }, [selectedType]);

  const loadServices = async () => {
    try {
      console.log('Loading services...');
      setLoading(true);
      setError(null);
      const data = await serviceService.getAll(selectedType || undefined);
      console.log('Loaded services:', data);
      setServices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load services:', err);
      // Backend xatolik xabarini ko'rsatish
      const status = err.response?.status;
      if (status === 500) {
        setError(language === 'uz' 
          ? 'Server xatoligi. Iltimos, keyinroq urinib ko\'ring.' 
          : 'Ошибка сервера. Пожалуйста, попробуйте позже.');
      } else {
        setError(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
      }
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const serviceTypes: ServiceType[] = [ServiceType.LABORATORY, ServiceType.DIAGNOSTIC, ServiceType.HOME_VISIT, ServiceType.CONSULTATION];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header title={t.pageTitle} showBack />
      
      {/* Type Filter */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-white/40 dark:border-gray-700/40 p-4">
        <div className="grid grid-cols-2 gap-3">
          {serviceTypes.map((type) => {
            const Icon = serviceTypeIcons[type];
            const isSelected = selectedType === type;
            
            return (
              <button
                key={type}
                onClick={() => setSelectedType(isSelected ? null : type)}
                className={`flex items-center p-3 rounded-xl transition-colors ${
                  isSelected
                    ? 'bg-primary-50/80 dark:bg-primary-900/50 border-2 border-primary-500'
                    : 'bg-white/50 dark:bg-gray-700/50 border-2 border-transparent'
                }`}
              >
                <div className={`w-10 h-10 ${serviceTypeColors[type]} rounded-full flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {t.serviceTypes[type] || type}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <PageLoading />
        ) : services.length === 0 ? (
          <EmptyState
            icon={<BeakerIcon className="w-8 h-8" />}
            title={t.notFoundTitle}
            description={t.notFoundDesc}
          />
        ) : (
          <div className="space-y-3">
            {services.map((service) => {
              const Icon = serviceTypeIcons[service.type] || BeakerIcon;
              
              return (
                <Card
                  key={service.id}
                  hover
                  onClick={() => navigate(`/services/${service.id}`)}
                >
                  <div className="flex items-start">
                    <div className={`w-12 h-12 ${serviceTypeColors[service.type] || 'bg-gray-500'} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 ml-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {language === 'ru' ? (service.nameRu || service.name) : (service.nameUz || service.name)}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {t.serviceTypes[service.type] || service.type}
                          </Badge>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {service.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-lg font-bold text-primary-500">
                            {Math.floor(service.price || 0).toLocaleString('ru-RU')}
                          </span>
                          <span className="text-sm text-gray-600 ml-1">{t.currency}</span>
                        </div>
                        {service.duration && (
                          <span className="text-sm text-gray-400">
                            ⏱ {service.duration} {t.minutes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
