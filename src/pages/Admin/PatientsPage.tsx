import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, UserIcon, PhoneIcon, EyeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  role: string;
  status: string;
  createdAt: string;
}

export function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      // Foydalanuvchilarni olish va faqat 'user' rolini filter qilish (bemorlar)
      const response = await api.get('/admin/users');
      const allUsers = response.data?.data?.data || response.data?.data || response.data || [];
      // Faqat 'user' roli bilan bo'lganlar - bemorlar
      const usersOnly = Array.isArray(allUsers) ? allUsers.filter((u: Patient) => u.role === 'user') : [];
      setPatients(usersOnly);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const searchLower = search.toLowerCase();
    const fullName = (p.firstName || '') + ' ' + (p.lastName || '');
    return fullName.toLowerCase().includes(searchLower) || p.phone?.toLowerCase().includes(searchLower);
  });

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('uz-UZ') : '-';
  const getGender = (g?: string) => g === 'male' ? 'Erkak' : g === 'female' ? 'Ayol' : '-';

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Bemorlar</h1>
        <div className="text-sm text-gray-600">
          Jami: <span className="font-semibold text-gray-900">{patients.length}</span> ta
        </div>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Bemor ismi yoki telefon..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Bemor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Telefon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tugilgan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Jinsi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Royxatdan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-600">Bemorlar topilmadi</td></tr>
            ) : (
              filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</div>
                        {p.address && <div className="text-xs text-gray-600">{p.address}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                      {p.phone || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                      {formatDate(p.birthDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={'px-3 py-1 text-xs font-medium rounded-full ' + (p.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800')}>
                      {getGender(p.gender)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(p.createdAt)}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => navigate(`/admin/users/${p.id}`)}
                      className="text-amber-600 hover:text-amber-900 p-2" 
                      title="Ko'rish"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
