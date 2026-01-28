import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BeakerIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { labTestService, LabTest } from '../services/laboratoryService';
import { Card, Badge } from '../components/ui';
import { useAppStore } from '../store';

export const Tahlillar: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const [search, setSearch] = useState('');

  // Translations
  const t = {
    uz: {
      title: 'Tahlillar',
      subtitle: 'Laboratoriya tahlil turlari',
      search: 'Qidirish...',
      duration: 'Muddat',
      price: 'Narx',
      preparation: "Tayyorgarlik",
      order: 'Buyurtma berish',
      noTests: 'Tahlil turlari topilmadi',
      sum: "so'm",
    },
    ru: {
      title: 'Анализы',
      subtitle: 'Виды лабораторных анализов',
      search: 'Поиск...',
      duration: 'Срок',
      price: 'Цена',
      preparation: 'Подготовка',
      order: 'Заказать',
      noTests: 'Анализы не найдены',
      sum: 'сум',
    },
  };
  const tr = t[language] || t.uz;

  // Fetch lab tests
  const { data: labTests = [], isLoading } = useQuery({
    queryKey: ['lab-tests'],
    queryFn: () => labTestService.getAll(),
  });

  // Filter tests
  const filteredTests = labTests.filter((test) =>
    test.name.toLowerCase().includes(search.toLowerCase()) ||
    test.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 pt-8">
        <div className="flex items-center gap-3 mb-2">
          <BeakerIcon className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">{tr.title}</h1>
            <p className="text-primary-100">{tr.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 -mt-5">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={tr.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl shadow-lg border-0 focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Lab Tests List */}
      <div className="p-4 space-y-4">
        {filteredTests.length === 0 ? (
          <Card className="text-center py-8">
            <BeakerIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{tr.noTests}</p>
          </Card>
        ) : (
          filteredTests.map((test) => (
            <Card
              key={test.id}
              hover
              onClick={() => navigate(`/lab-tests/${test.id}`)}
              className="cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BeakerIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{test.name}</h3>
                  {test.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {test.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {test.duration && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4" />
                        <span>{test.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary-600">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span>{formatPrice(test.price)} {tr.sum}</span>
                    </div>
                  </div>
                  {test.preparationInfo && (
                    <div className="mt-2 flex items-start gap-1 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                      <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{test.preparationInfo}</span>
                    </div>
                  )}
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Tahlillar;
