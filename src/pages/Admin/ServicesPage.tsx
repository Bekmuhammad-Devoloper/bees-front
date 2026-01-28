import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  description?: string;
  type: string;
  price: string;
  duration: number;
  durationUnit: string;
  image?: string;
  isActive: boolean;
}

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'medical_monitoring',
    price: 0,
    duration: 30,
    durationUnit: 'minute',
    isActive: true,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services');
      const data = response.data?.data || response.data || [];
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xizmatni o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Xizmat o\'chirildi');
      loadServices();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        price: Number(formData.price),
        duration: Number(formData.duration),
        durationUnit: formData.durationUnit,
      };
      if (editService) {
        await api.patch(`/services/${editService.id}`, payload);
        toast.success('Xizmat yangilandi');
      } else {
        await api.post('/services', payload);
        toast.success('Xizmat qo\'shildi');
      }
      setShowModal(false);
      setEditService(null);
      setFormData({ name: '', description: '', type: 'medical_monitoring', price: 0, duration: 30, durationUnit: 'minute', isActive: true });
      loadServices();
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error);
      const message = error.response?.data?.message || 'Xatolik yuz berdi';
      toast.error(Array.isArray(message) ? message[0] : message);
    }
  };

  const openEditModal = (service: Service) => {
    setEditService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      type: service.type,
      price: Number(service.price),
      duration: service.duration,
      durationUnit: service.durationUnit || 'minute',
      isActive: service.isActive,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditService(null);
    setFormData({ name: '', description: '', type: 'medical_monitoring', price: 0, duration: 30, durationUnit: 'minute', isActive: true });
    setShowModal(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const filteredServices = services.filter((svc) => {
    if (!search) return true;
    return svc.name?.toLowerCase().includes(search.toLowerCase()) ||
           svc.description?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-semibold">Xizmatlar</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Yangi xizmat
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Xizmat qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
        />
      </div>

      {/* Table */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/40 dark:border-gray-700/40 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-black-neon dark:text-gray-200">Yuklanmoqda...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-8 text-center text-black-neon dark:text-gray-200">
            <p>Xizmatlar topilmadi</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-white/30 dark:bg-gray-700/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Nomi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Narxi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Davomiyligi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Holat</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredServices.map((svc) => (
                <tr key={svc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white font-semibold">{svc.name}</p>
                      <p className="text-sm text-black-neon dark:text-gray-200">{svc.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold font-medium">{formatPrice(Number(svc.price))}</td>
                  <td className="px-6 py-4 text-black-neon dark:text-gray-100 font-medium">{svc.duration} {svc.durationUnit === 'day' ? 'kun' : 'daqiqa'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      svc.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-black-neon dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {svc.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(svc)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg" title="Tahrirlash">
                        <PencilIcon className="w-4 h-4 text-black-neon dark:text-gray-200" />
                      </button>
                      <button onClick={() => handleDelete(svc.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg" title="O'chirish">
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-semibold">
                {editService ? 'Xizmatni tahrirlash' : 'Yangi xizmat'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <XMarkIcon className="w-5 h-5 text-black-neon dark:text-gray-200" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomi</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  placeholder="Xizmat nomi"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tavsif</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  placeholder="Xizmat tavsifi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Turi</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                >
                  <option value="medical_monitoring">Tibbiy nazorat</option>
                  <option value="home_care">Uy parvarishi</option>
                  <option value="laboratory">Laboratoriya</option>
                  <option value="consultation">Konsultatsiya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Narxi (so'm)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  placeholder="500000"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Davomiyligi</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                    placeholder="30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Birlik</label>
                  <select
                    value={formData.durationUnit}
                    onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  >
                    <option value="minute">Daqiqa</option>
                    <option value="hour">Soat</option>
                    <option value="day">Kun</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editService ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
