import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Card, Avatar, Badge, Input, PageLoading, EmptyState, Button } from '../../components/ui';
import { Header } from '../../components/layout';
import { doctorService, categoryService } from '../../services';
import { useAppStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';
import type { Doctor, Category } from '../../types';

// Translations
const translations = {
  uz: {
    pageTitle: 'Shifokorlar',
    searchPlaceholder: 'Shifokor qidirish...',
    all: 'Barchasi',
    notFoundTitle: 'Shifokorlar topilmadi',
    notFoundDesc: "Boshqa qidiruv so'zini kiriting yoki filtrni o'zgartiring",
    doctor: 'Shifokor',
    available: "Bo'sh",
    busy: 'Band',
    yearsExp: 'yil tajriba',
    currency: "so'm",
    bookAppointment: 'Qabulga yozilish',
    loadMore: "Ko'proq yuklash",
  },
  ru: {
    pageTitle: 'Врачи',
    searchPlaceholder: 'Поиск врача...',
    all: 'Все',
    notFoundTitle: 'Врачи не найдены',
    notFoundDesc: 'Введите другой поисковый запрос или измените фильтр',
    doctor: 'Врач',
    available: 'Свободен',
    busy: 'Занят',
    yearsExp: 'лет опыта',
    currency: 'сум',
    bookAppointment: 'Записаться',
    loadMore: 'Загрузить еще',
  },
};

export const DoctorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useAppStore();
  const t = translations[language] || translations.uz;
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [selectedCategory, search]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadDoctors = async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
        setPage(1);
      }
      
      const currentPage = loadMore ? page + 1 : 1;
      const data = await doctorService.getAll({
        page: currentPage,
        limit: 10,
        categoryId: selectedCategory || undefined,
        search: search || undefined,
      });
      
      if (loadMore) {
        setDoctors((prev) => [...prev, ...(data.data || [])]);
      } else {
        setDoctors(data.data || []);
      }
      
      setPage(currentPage);
      setHasMore((data.meta?.page || 1) < (data.meta?.totalPages || 1));
    } catch (error) {
      console.error('Failed to load doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header title={t.pageTitle} showBack />
      
      <div className="p-4 space-y-4">
        {/* Search */}
        <Input
          placeholder={t.searchPlaceholder}
          leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Categories Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedCategory
                ? 'bg-primary-500 text-white'
                : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg text-black-neon dark:text-gray-100 font-medium border border-white/40 dark:border-gray-700/40'
            }`}
          >
            {t.all}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg text-black-neon dark:text-gray-100 font-medium border border-white/40 dark:border-gray-700/40'
              }`}
            >
              <img 
                src={category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) 
                  ? category.icon 
                  : '/docrors-category.png'} 
                alt="" 
                className="w-5 h-5 object-contain"
              />
              {language === 'ru' ? (category.nameRu || category.name) : (category.nameUz || category.name)}
            </button>
          ))}
        </div>

        {/* Doctors List */}
        {loading ? (
          <PageLoading />
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={<MagnifyingGlassIcon className="w-8 h-8" />}
            title={t.notFoundTitle}
            description={t.notFoundDesc}
          />
        ) : (
          <div className="space-y-3">
            {doctors.map((doctor) => (
              <Card
                key={doctor.id}
                hover
                onClick={() => navigate(`/doctors/${doctor.id}`)}
              >
                <div className="flex items-start">
                  <Avatar name={doctor.user?.name || 'Doctor'} size="lg" />
                  <div className="flex-1 ml-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {doctor.user?.name || t.doctor}
                        </p>
                        <p className="text-sm text-primary-500">
                          {doctor.specialization}
                        </p>
                      </div>
                      {doctor.isAvailable ? (
                        <Badge variant="success">{t.available}</Badge>
                      ) : (
                        <Badge variant="secondary">{t.busy}</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <span className="text-yellow-500 mr-1">⭐</span>
                        {doctor.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{doctor.experience} {t.yearsExp}</span>
                    </div>

                    {doctor.clinic && (
                      <p className="text-sm text-gray-400 mt-1">
                        📍 {doctor.clinic.name}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-lg font-bold text-primary-500">
                          {(doctor.consultationPrice || doctor.consultationFee)?.toLocaleString() || '0'}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">{t.currency}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        {t.bookAppointment}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {hasMore && (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => loadDoctors(true)}
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
