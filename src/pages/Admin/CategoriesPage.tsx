import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  description?: string;
  isActive: boolean;
  doctorsCount?: number;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ nameUz: '', nameRu: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories/admin/all');
      const data = response.data?.data || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.nameUz, // API uchun name field kerak
        nameUz: formData.nameUz,
        nameRu: formData.nameRu,
        description: formData.description || undefined,
      };
      if (editCategory) {
        await api.patch(`/categories/${editCategory.id}`, payload);
        toast.success('Kategoriya yangilandi');
      } else {
        await api.post('/categories', payload);
        toast.success('Kategoriya yaratildi');
      }
      setShowModal(false);
      setEditCategory(null);
      setFormData({ nameUz: '', nameRu: '', description: '' });
      loadCategories();
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error);
      const message = error.response?.data?.message || 'Xatolik yuz berdi';
      toast.error(Array.isArray(message) ? message[0] : message);
    }
  };

  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setFormData({
      nameUz: category.nameUz,
      nameRu: category.nameRu,
      description: category.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Kategoriyani o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Kategoriya o\'chirildi');
      loadCategories();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/categories/${id}/toggle`);
      toast.success('Holat o\'zgartirildi');
      loadCategories();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (!search) return true;
    return cat.nameUz?.toLowerCase().includes(search.toLowerCase()) ||
           cat.nameRu?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-semibold">Kategoriyalar</h1>
        <button 
          onClick={() => { setEditCategory(null); setFormData({ nameUz: '', nameRu: '', description: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Yangi kategoriya
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Kategoriya qidirish..."
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
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-black-neon dark:text-gray-200">
            <p>Kategoriyalar topilmadi</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-white/30 dark:bg-gray-700/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Nomi (UZ)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Nomi (RU)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Shifokorlar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Holat</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white font-semibold">{cat.nameUz}</td>
                  <td className="px-6 py-4 text-black-neon dark:text-gray-100 font-medium">{cat.nameRu}</td>
                  <td className="px-6 py-4 text-black-neon dark:text-gray-100 font-medium">{cat.doctorsCount || 0}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(cat.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        cat.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-black-neon dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {cat.isActive ? 'Faol' : 'Nofaol'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(cat)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg" title="Tahrirlash">
                        <PencilIcon className="w-4 h-4 text-black-neon dark:text-gray-200" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg" title="O'chirish">
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
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              {editCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomi (UZ)</label>
                <input
                  type="text"
                  value={formData.nameUz}
                  onChange={(e) => setFormData({ ...formData, nameUz: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomi (RU)</label>
                <input
                  type="text"
                  value={formData.nameRu}
                  onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  rows={3}
                  placeholder="Kategoriya tavsifi"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
