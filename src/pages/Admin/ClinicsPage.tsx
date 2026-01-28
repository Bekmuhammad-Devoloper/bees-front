import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  description?: string;
  workingHours?: string;
  isActive: boolean;
}

export function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editClinic, setEditClinic] = useState<Clinic | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', description: '' });

  useEffect(() => { loadClinics(); }, []);

  const loadClinics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clinics');
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setClinics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name: formData.name, address: formData.address, phone: formData.phone || undefined, description: formData.description || undefined };
      if (editClinic) {
        await api.patch('/clinics/' + editClinic.id, payload);
        toast.success('Klinika yangilandi');
      } else {
        await api.post('/clinics', payload);
        toast.success('Klinika yaratildi');
      }
      setShowModal(false);
      setEditClinic(null);
      setFormData({ name: '', address: '', phone: '', description: '' });
      loadClinics();
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error);
      const message = error.response?.data?.message || 'Xatolik yuz berdi';
      toast.error(Array.isArray(message) ? message[0] : message);
    }
  };

  const handleEdit = (clinic: Clinic) => {
    setEditClinic(clinic);
    setFormData({ name: clinic.name, address: clinic.address, phone: clinic.phone || '', description: clinic.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Klinikani ochirmoqchimisiz?')) return;
    try {
      await api.delete('/clinics/' + id);
      toast.success('Klinika ochirildi');
      loadClinics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik');
    }
  };

  const filteredClinics = clinics.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div></div>);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-semibold">Klinikalar</h1>
        <button onClick={() => { setEditClinic(null); setFormData({ name: '', address: '', phone: '', description: '' }); setShowModal(true); }} className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600">
          <PlusIcon className="w-5 h-5" />
          Yangi klinika
        </button>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Klinika qidirish..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" />
      </div>

      {filteredClinics.length === 0 ? (
        <div className="text-center py-12 text-black-neon dark:text-gray-200"><BuildingOfficeIcon className="w-16 h-16 mx-auto mb-2 text-gray-300 dark:text-gray-600" /><p>Klinikalar topilmadi</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClinics.map((clinic) => (
            <div key={clinic.id} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl p-5 border border-white/40 dark:border-gray-700/40 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white font-semibold">{clinic.name}</h3>
                  <p className="text-sm text-black-neon dark:text-gray-200">{clinic.address}</p>
                  {clinic.phone && <p className="text-sm text-gray-400 dark:text-gray-600">{clinic.phone}</p>}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={'px-2.5 py-1 rounded-full text-xs font-medium ' + (clinic.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-black-neon dark:bg-gray-700 dark:text-gray-300')}>
                  {clinic.isActive ? 'Faol' : 'Nofaol'}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(clinic)} className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg" title="Tahrirlash">
                    <PencilIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </button>
                  <button onClick={() => handleDelete(clinic.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg" title="Ochirish">
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">{editClinic ? 'Klinikani tahrirlash' : 'Yangi klinika'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Yopish"><XMarkIcon className="w-5 h-5 dark:text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomi</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" placeholder="Klinika nomi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manzil</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" placeholder="Manzilni kiriting" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" placeholder="+998 XX XXX XX XX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tavsif</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" placeholder="Klinika haqida" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300">Bekor qilish</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">{editClinic ? 'Saqlash' : 'Qo\'shish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
