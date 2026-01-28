import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MagnifyingGlassIcon, 
  BeakerIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { labTestService, LabTest } from '../../services/laboratoryService';
import toast from 'react-hot-toast';

export const LaboratoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: '',
    preparationInfo: '',
  });

  // Fetch lab tests
  const { data: labTests = [], isLoading } = useQuery({
    queryKey: ['admin-lab-tests'],
    queryFn: () => labTestService.getAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<LabTest>) => labTestService.create(data),
    onSuccess: () => {
      toast.success("Tahlil turi qo'shildi");
      queryClient.invalidateQueries({ queryKey: ['admin-lab-tests'] });
      closeModal();
    },
    onError: () => {
      toast.error("Xatolik yuz berdi");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LabTest> }) => labTestService.update(id, data),
    onSuccess: () => {
      toast.success("Tahlil turi yangilandi");
      queryClient.invalidateQueries({ queryKey: ['admin-lab-tests'] });
      closeModal();
    },
    onError: () => {
      toast.error("Xatolik yuz berdi");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => labTestService.delete(id),
    onSuccess: () => {
      toast.success("Tahlil turi o'chirildi");
      queryClient.invalidateQueries({ queryKey: ['admin-lab-tests'] });
    },
    onError: () => {
      toast.error("Xatolik yuz berdi");
    },
  });

  const openModal = (test?: LabTest) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        name: test.name,
        description: test.description || '',
        price: test.price,
        duration: test.duration || '',
        preparationInfo: test.preparationInfo || '',
      });
    } else {
      setEditingTest(null);
      setFormData({ name: '', description: '', price: 0, duration: '', preparationInfo: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTest(null);
    setFormData({ name: '', description: '', price: 0, duration: '', preparationInfo: '' });
  };

  const handleSubmit = () => {
    if (!formData.name || formData.price <= 0) {
      toast.error("Iltimos, nom va narxni kiriting");
      return;
    }
    
    if (editingTest) {
      updateMutation.mutate({ id: editingTest.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (test: LabTest) => {
    if (window.confirm(`"${test.name}" ni o'chirishni xohlaysizmi?`)) {
      deleteMutation.mutate(test.id);
    }
  };

  const filtered = labTests.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price: number) => new Intl.NumberFormat('uz-UZ').format(price);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black-neon drop-shadow-lg">Tahlil turlari</h1>
          <p className="text-black-neon/80">Laboratoriya tahlil turlarini boshqarish</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Yangi tahlil
        </button>
      </div>

      {/* Search */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/40 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tahlil nomini qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/40 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Yuklanmoqda...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <BeakerIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Tahlil turlari topilmadi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/70 dark:bg-gray-800/70 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-black-neon">Nomi</th>
                  <th className="text-left py-3 px-4 font-medium text-black-neon">Tavsif</th>
                  <th className="text-left py-3 px-4 font-medium text-black-neon">Narx</th>
                  <th className="text-left py-3 px-4 font-medium text-black-neon">Muddat</th>
                  <th className="text-center py-3 px-4 font-medium text-black-neon">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((test) => (
                  <tr key={test.id} className="hover:bg-white/50 bg-white/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <BeakerIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="font-medium text-black-neon">{test.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-black-neon/80 max-w-xs truncate">
                      {test.description || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-green-600 font-semibold">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        {formatPrice(test.price)} so'm
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {test.duration ? (
                        <div className="flex items-center gap-1 text-black-neon/80">
                          <ClockIcon className="w-4 h-4" />
                          {test.duration}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openModal(test)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors" 
                          title="Tahrirlash"
                        >
                          <PencilIcon className="w-5 h-5 text-blue-600" />
                        </button>
                        <button 
                          onClick={() => handleDelete(test)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors" 
                          title="O'chirish"
                        >
                          <TrashIcon className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTest ? 'Tahlilni tahrirlash' : "Yangi tahlil qo'shish"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomi *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Qon umumiy tahlili"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tahlil haqida qisqacha ma'lumot"
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Narx (so'm) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="50000"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Muddat</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="1-2 kun"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tayyorgarlik</label>
                <textarea
                  value={formData.preparationInfo}
                  onChange={(e) => setFormData({ ...formData, preparationInfo: e.target.value })}
                  placeholder="Och qoringa topshiring"
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
