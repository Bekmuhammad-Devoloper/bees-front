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
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
            Bemorlar
          </h1>
          <p className="text-gray-400">Jami: {total} ta bemor</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-lg hover:opacity-90 flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,200,0.3)]"
        >
          <PlusIcon className="w-5 h-5" />
          Yangi bemor
        </button>
      </div>

      {/* Search */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Ism yoki telefon raqami bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(0,255,200,0.3)]">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{patient.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                  <PhoneIcon className="w-3 h-3" />
                  {patient.phone}
                </div>
                {patient.address && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{patient.address}</p>
                )}
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500">Ro'yxatdan o'tgan</p>
              <p className="text-sm text-gray-300 flex items-center gap-1 mt-1">
                <CalendarIcon className="w-3 h-3" />
                {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('uz-UZ') : 'Noma\'lum'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {patients.length === 0 && !loading && (
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-12 border border-white/10 text-center">
          <UserIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Bemorlar topilmadi</h3>
          <p className="text-gray-400 mb-4">Qidiruv bo'yicha hech narsa topilmadi</p>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-lg hover:opacity-90"
          >
            Yangi bemor qo'shish
          </button>
        </div>
      )}

      {/* Pagination */}
      {patients.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Sahifa {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-sm text-gray-300 hover:bg-white/10 disabled:opacity-50"
            >
              Oldingi
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-sm text-gray-300 hover:bg-white/10 disabled:opacity-50"
            >
              Keyingi
            </button>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
                Yangi bemor qo'shish
              </h2>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setError('');
                }}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Ism *</label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="Bemor ismi"
                  className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Telefon raqami *</label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  placeholder="+998901234567"
                  className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Manzil</label>
                <input
                  type="text"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  placeholder="Toshkent, Chilonzor"
                  className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-white/10">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                }}
                className="flex-1 px-4 py-3 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleAddPatient}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
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
