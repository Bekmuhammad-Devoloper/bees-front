import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, BuildingOffice2Icon, PhoneIcon, MapPinIcon, EyeIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  description: string;
  createdAt: string;
}

export const HospitalsPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hospitals');
      setHospitals(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to load hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHospital = async (id: number) => {
    if (!confirm('Haqiqatan ham o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/hospitals/${id}`);
      toast.success('Shifoxona o\'chirildi');
      loadHospitals();
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const filtered = hospitals.filter(h =>
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Shifoxonalar</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusIcon className="w-5 h-5" />
          Yangi qo'shish
        </button>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Shifoxona qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Yuklanmoqda...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-600">
            <BuildingOffice2Icon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Shifoxonalar topilmadi</p>
          </div>
        ) : (
          filtered.map((hospital) => (
            <div key={hospital.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <BuildingOffice2Icon className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded-lg" title="Ko'rish">
                    <EyeIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => deleteHospital(hospital.id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                    title="O'chirish"
                  >
                    <TrashIcon className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{hospital.name}</h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{hospital.description || 'Tavsif mavjud emas'}</p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{hospital.address || 'Manzil ko\'rsatilmagan'}</span>
                </div>
                {hospital.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                    <span>{hospital.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
