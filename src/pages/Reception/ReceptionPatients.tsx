import React, { useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  ChevronRightIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

interface Patient {
  id: string;
  name: string;
  phone: string;
  address?: string;
  createdAt?: string;
}

interface NewPatientForm {
  name: string;
  phone: string;
  address: string;
}

export const ReceptionPatients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newPatient, setNewPatient] = useState<NewPatientForm>({
    name: '',
    phone: '+998',
    address: '',
  });

  useEffect(() => {
    loadPatients();
  }, [page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadPatients();
      } else {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users', {
        params: { page, search: search || undefined, limit: 20 },
      });
      console.log('Patients response:', response.data);
      
      if (response.data) {
        // Backend: { success, message, data: { data: [...], total, page, limit } }
        const responseData = response.data.data || response.data;
        const patientsList = Array.isArray(responseData) ? responseData : (responseData.data || []);
        const totalCount = responseData.total || patientsList.length;
        
        setPatients(
          patientsList.map((u: any) => ({
            id: u.id,
            name: u.name || 'Noma\'lum',
            phone: u.phone || '',
            address: u.address || '',
            createdAt: u.createdAt,
          }))
        );
        setTotal(totalCount);
        setTotalPages(Math.ceil(totalCount / 20) || 1);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async () => {
    // Validatsiya
    if (!newPatient.name.trim()) {
      setError('Ism kiritilishi shart');
      return;
    }
    if (!newPatient.phone.match(/^\+998[0-9]{9}$/)) {
      setError('Telefon raqami noto\'g\'ri formatda (+998XXXXXXXXX)');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const response = await api.post('/users', {
        name: newPatient.name.trim(),
        phone: newPatient.phone,
        address: newPatient.address.trim() || undefined,
      });
      
      console.log('New patient created:', response.data);
      
      // Modal yopish va ro'yxatni yangilash
      setShowModal(false);
      setNewPatient({ name: '', phone: '+998', address: '' });
      loadPatients();
    } catch (error: any) {
      console.error('Failed to create patient:', error);
      const message = error.response?.data?.message || 'Xatolik yuz berdi';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Bemorlar
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Jami: {total} ta bemor</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Yangi bemor
        </button>
      </div>

      {/* Search */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Ism yoki telefon raqami bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-black dark:text-white truncate">{patient.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <PhoneIcon className="w-3 h-3" />
                  {patient.phone}
                </div>
                {patient.address && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{patient.address}</p>
                )}
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-500 group-hover:text-primary-500 transition-colors" />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500">Ro'yxatdan o'tgan</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
                <CalendarIcon className="w-3 h-3" />
                {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('uz-UZ') : 'Noma\'lum'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {patients.length === 0 && !loading && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
          <UserIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Bemorlar topilmadi</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Qidiruv bo'yicha hech narsa topilmadi</p>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Yangi bemor qo'shish
          </button>
        </div>
      )}

      {/* Pagination */}
      {patients.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sahifa {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Oldingi
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Keyingi
            </button>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-black dark:text-white">
                Yangi bemor qo'shish
              </h2>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setError('');
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                title="Yopish"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Ism *</label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="Bemor ismi"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Telefon raqami *</label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  placeholder="+998901234567"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Manzil</label>
                <input
                  type="text"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  placeholder="Toshkent, Chilonzor"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleAddPatient}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5" />
                    Qo'shish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
