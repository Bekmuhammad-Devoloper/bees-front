import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Card, Badge, PageLoading, EmptyState, Button } from '../../components/ui';
import { Header } from '../../components/layout';
import { notificationService } from '../../services';
import { useAuthStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import toast from 'react-hot-toast';
import type { Notification, NotificationType } from '../../types';

const typeColors: Record<NotificationType, string> = {
  appointment: 'bg-blue-500',
  reminder: 'bg-yellow-500',
  system: 'bg-gray-500',
  promotion: 'bg-green-500',
};

const typeIcons: Record<NotificationType, string> = {
  appointment: '📅',
  reminder: '⏰',
  system: '⚙️',
  promotion: '🎉',
};

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { getBackgroundImage } = useThemeStore();
  const backgroundUrl = getBackgroundImage();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    loadNotifications();
  }, [isAuthenticated]);

  const loadNotifications = async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
        setPage(1);
      }
      
      const currentPage = loadMore ? page + 1 : 1;
      const data = await notificationService.getAll({
        page: currentPage,
        limit: 20,
      });
      
      if (loadMore) {
        setNotifications((prev) => [...prev, ...(data.data || [])]);
      } else {
        setNotifications(data.data || []);
      }
      
      setPage(currentPage);
      setHasMore((data.meta?.page || 1) < (data.meta?.totalPages || 1));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('Barcha bildirishnomalar o\'qildi');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('O\'chirildi');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url('${backgroundUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Header 
        title="Bildirishnomalar" 
        showBack 
        rightAction={
          unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-primary-500 font-medium"
            >
              Barchasini o'qish
            </button>
          )
        }
      />

      <div className="p-4">
        {loading ? (
          <PageLoading />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<BellIcon className="w-8 h-8" />}
            title="Bildirishnomalar yo'q"
            description="Yangi bildirishnomalar bu yerda ko'rinadi"
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={!notification.isRead ? 'border-l-4 border-l-primary-500' : ''}
              >
                <div className="flex items-start">
                  <div className={`w-10 h-10 ${typeColors[notification.type]} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-lg">{typeIcons[notification.type]}</span>
                  </div>
                  <div className="flex-1 ml-3">
                    <div className="flex items-start justify-between">
                      <p className={`font-medium ${notification.isRead ? 'text-gray-700 dark:text-gray-400' : 'text-gray-900 dark:text-white font-semibold'}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-sm text-black-neon dark:text-gray-200 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {format(new Date(notification.createdAt), 'd MMM, HH:mm', { locale: uz })}
                      </span>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded"
                            title="O'qildi deb belgilash"
                          >
                            <CheckIcon className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded"
                          title="O'chirish"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {hasMore && (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => loadNotifications(true)}
              >
                Ko'proq yuklash
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
