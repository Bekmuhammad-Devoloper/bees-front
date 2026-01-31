import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDaysIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Card, Badge, PageLoading, EmptyState, Button } from '../../components/ui';
import { Header } from '../../components/layout';
import { serviceService } from '../../services';
import { useAppStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';
import type { ServiceOrder } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const translations = {
  uz: {
    pageTitle: 'Xizmat buyurtmalarim',
    empty: 'Buyurtmalar yo\'q',
    emptyDesc: 'Siz hali xizmat buyurtma qilmagansiz',
    cancel: 'Bekor qilish',
    cancelConfirm: 'Buyurtmani bekor qilishni tasdiqlaysizmi?',
    cancelSuccess: 'Buyurtma bekor qilindi',
    currency: "so'm",
    statuses: {
      pending: 'Kutilmoqda',
      confirmed: 'Tasdiqlangan',
      in_progress: 'Jarayonda',
      completed: 'Bajarildi',
      cancelled: 'Bekor qilindi',
    },
  },
  ru: {
    pageTitle: 'Мои заказы услуг',
    empty: 'Заказов нет',
    emptyDesc: 'Вы еще не заказывали услуги',
    cancel: 'Отменить',
    cancelConfirm: 'Подтвердите отмену заказа?',
    cancelSuccess: 'Заказ отменен',
    currency: 'сум',
    statuses: {
      pending: 'Ожидание',
      confirmed: 'Подтверждено',
      in_progress: 'В процессе',
      completed: 'Завершено',
      cancelled: 'Отменено',
    },
  },
};

const statusColors: Record<string, string> = {
  pending: 'warning',
  confirmed: 'info',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'danger',
};

export const ServiceOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const t = translations[language] || translations.uz;

  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getMyOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm(t.cancelConfirm)) return;
    
    try {
      await serviceService.cancelMyOrder(id);
      toast.success(t.cancelSuccess);
      loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik');
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-black text-black dark:text-white">
      <Header title={t.pageTitle} showBack />

      <div className="p-4">
        {orders.length === 0 ? (
          <EmptyState
            icon={<CalendarDaysIcon className="w-8 h-8" />}
            title={t.empty}
            description={t.emptyDesc}
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white font-semibold">
                      {order.service?.name || 'Xizmat'}
                    </h3>
                    
                    <div className="flex items-center gap-3 mt-2 text-sm text-black-neon dark:text-gray-200">
                      <span className="flex items-center">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        {order.startDate ? format(new Date(order.startDate), 'dd.MM.yyyy') : '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-primary-500">
                        {Math.floor(order.service?.price || 0).toLocaleString('ru-RU')} {t.currency}
                      </span>
                      <Badge variant={statusColors[order.status] as any || 'secondary'}>
                        {t.statuses[order.status as keyof typeof t.statuses] || order.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {order.status === 'pending' && (
                  <div className="mt-3 pt-3 border-t border-gray-100/50 dark:border-gray-700/40">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(order.id)}
                      className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/20"
                    >
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      {t.cancel}
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
