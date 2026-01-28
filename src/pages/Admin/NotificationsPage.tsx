import { useEffect, useState } from 'react';
import { BellIcon, CheckCircleIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    phone: string;
  };
}

interface User {
  id: string;
  name?: string;
  fullName?: string;
  phone: string;
}

const typeColors: Record<string, string> = {
  system: 'bg-blue-100 text-blue-800',
  appointment_created: 'bg-green-100 text-green-800',
  appointment_confirmed: 'bg-green-100 text-green-800',
  appointment_cancelled: 'bg-red-100 text-red-800',
  appointment_reminder: 'bg-yellow-100 text-yellow-800',
  service_order_created: 'bg-purple-100 text-purple-800',
  service_order_confirmed: 'bg-purple-100 text-purple-800',
};

const typeLabels: Record<string, string> = {
  system: 'Tizim',
  appointment_created: 'Qabul yaratildi',
  appointment_confirmed: 'Qabul tasdiqlandi',
  appointment_cancelled: 'Qabul bekor qilindi',
  appointment_reminder: 'Eslatma',
  service_order_created: 'Buyurtma yaratildi',
  service_order_confirmed: 'Buyurtma tasdiqlandi',
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'system'
  });

  useEffect(() => {
    loadNotifications();
    loadUsers();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Admin faqat o'z bildirishnomalarini ko'radi
      const response = await api.get('/notifications');
      console.log('Notifications response:', response.data);
      // API returns { notifications: [], total: number } wrapped in data
      const result = response.data?.data || response.data;
      const data = result?.notifications || result?.data?.notifications || result || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        userId: formData.userId,
        title: formData.title,
        message: formData.message,
        type: formData.type
      };
      console.log('Creating notification:', payload);
      await api.post('/notifications', payload);
      alert('Bildirishnoma muvaffaqiyatli yaratildi!');
      setShowModal(false);
      setFormData({ userId: '', title: '', message: '', type: 'system' });
      loadNotifications();
    } catch (error: unknown) {
      console.error('Failed to create notification:', error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
      alert('Xatolik');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu bildirishnomani o'chirmoqchimisiz?")) return;
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      alert("Bildirishnoma o'chirildi");
    } catch (error) {
      console.error('Failed to delete notification:', error);
      alert("O'chirishda xatolik");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-semibold">Bildirishnomalar</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600"
        >
          <PlusIcon className="w-5 h-5" />
          Yangi bildirishnoma
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <BellIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-black-neon dark:text-gray-200">Bildirishnomalar yo'q</p>
        </div>
      ) : (
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/40 divide-y divide-gray-100/50 dark:divide-gray-700/50">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-4 ${n.isRead ? 'bg-white/30 dark:bg-gray-800/30' : 'bg-amber-50/50 dark:bg-amber-900/20'}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  typeColors[n.type] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                <BellIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white font-semibold">{n.title}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      typeColors[n.type] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {typeLabels[n.type] || n.type}
                  </span>
                  {!n.isRead && <span className="w-2 h-2 bg-amber-500 rounded-full"></span>}
                </div>
                <p className="text-sm text-black-neon dark:text-gray-100 font-medium mt-1">{n.message}</p>
                {n.user && (
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                    Foydalanuvchi: {n.user.name} ({n.user.phone})
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{formatDate(n.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                    title="O'qilgan deb belgilash"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                  title="O'chirish"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Yangi bildirishnoma</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Foydalanuvchi *</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  required
                >
                  <option value="">Tanlang</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.fullName || "Noma'lum"} ({u.phone})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Sarlavha *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  required
                  placeholder="Bildirishnoma sarlavhasi"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Xabar *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  rows={3}
                  required
                  placeholder="Bildirishnoma matni"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Turi</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                >
                  <option value="system">Tizim</option>
                  <option value="appointment_created">Qabul yaratildi</option>
                  <option value="appointment_confirmed">Qabul tasdiqlandi</option>
                  <option value="appointment_cancelled">Qabul bekor qilindi</option>
                  <option value="appointment_reminder">Eslatma</option>
                  <option value="service_order_created">Buyurtma yaratildi</option>
                  <option value="service_order_confirmed">Buyurtma tasdiqlandi</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  Yuborish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
