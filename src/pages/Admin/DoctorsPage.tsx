import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import api from '../../services/api';

interface Doctor {
  id: string;
  userId?: string;
  fullName: string;
  phone: string;
  specialization: string;
  user?: { id: string; name: string; phone: string };
  categoryId?: string;
  category?: { id: string; name: string; icon?: string };
  clinicId?: string;
  clinic?: { id: string; name: string };
  experience: number;
  bio?: string;
  rating?: number;
  isActive: boolean;
  createdAt: string;
}

interface Category { id: string; name: string; nameUz?: string; nameRu?: string }
interface Clinic { id: string; name: string }
interface User { id: string; fullName?: string; name?: string; phone: string; role?: string }

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({ 
    userId: '', 
    fullName: '',
    phone: '',
    categoryId: '', 
    clinicId: '', 
    specialization: '',
    experience: '0', 
    bio: '' 
  });

  useEffect(() => { loadDoctors(); loadCategories(); loadClinics(); loadUsers(); }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      
      // 1. Shifokor roli bo'lgan foydalanuvchilarni olish
      const usersResponse = await api.get('/admin/users', { params: { role: 'doctor' } });
      const usersData = usersResponse.data?.data?.data || usersResponse.data?.data || usersResponse.data || [];
      
      // 2. Doctors jadvalidan ma'lumotlarni olish
      let doctorsData: any[] = [];
      try {
        const doctorsResponse = await api.get('/doctors');
        doctorsData = doctorsResponse.data?.data?.data || doctorsResponse.data?.data || doctorsResponse.data || [];
        if (!Array.isArray(doctorsData)) doctorsData = [];
      } catch (e) {
        console.log('Doctors endpoint failed, using only users data');
      }
      
      // 3. Ma'lumotlarni birlashtirish - har bir shifokor foydalanuvchi uchun
      const combinedDoctors = Array.isArray(usersData) ? usersData.map((user: any) => {
        // Bu foydalanuvchi uchun doctors jadvalida ma'lumot bormi?
        const doctorInfo = doctorsData.find((d: any) => 
          d.userId === user.id || d.user?.id === user.id || d.user?.phone === user.phone
        );
        
        // Ism uchun barcha mumkin bo'lgan fieldlarni tekshirish
        let fullName = 'Noma\'lum';
        if (user.name) {
          fullName = user.name;
        } else if (user.fullName) {
          fullName = user.fullName;
        } else if (user.firstName || user.lastName) {
          fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Noma\'lum';
        }
        
        return {
          id: doctorInfo?.id || user.id,
          userId: user.id,
          fullName: fullName,
          phone: user.phone || '-',
          specialization: doctorInfo?.specialization || '-',
          user: user,
          categoryId: doctorInfo?.categoryId,
          category: doctorInfo?.category,
          clinicId: doctorInfo?.clinicId,
          clinic: doctorInfo?.clinic,
          experience: doctorInfo?.experience || 0,
          bio: doctorInfo?.bio || '',
          rating: doctorInfo?.rating || 0,
          isActive: user.status === 'active' || user.status === 'verified',
          createdAt: user.createdAt,
          hasDoctorProfile: !!doctorInfo, // Doctor jadvalida bor-yo'qligini belgilash
        };
      }) : [];
      
      console.log('Combined doctors data:', combinedDoctors);
      setDoctors(combinedDoctors);
    } catch (error) { 
      console.error('Error loading doctors:', error); 
      setDoctors([]);
    }
    finally { setLoading(false); }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) { console.error('Error:', error); }
  };

  const loadClinics = async () => {
    try {
      const response = await api.get('/clinics');
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setClinics(Array.isArray(data) ? data : []);
    } catch (error) { console.error('Error:', error); }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) { console.error('Error:', error); }
  };

  const handleUserSelect = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setFormData({
        ...formData,
        userId: userId,
        fullName: selectedUser.fullName || '',
        phone: selectedUser.phone || ''
      });
    } else {
      setFormData({ ...formData, userId: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        // Update - userId kerak emas
        const updatePayload: Record<string, unknown> = {
          fullName: formData.fullName,
          phone: formData.phone,
          categoryId: formData.categoryId,
          specialization: formData.specialization,
          experience: parseInt(formData.experience) || 0
        };
        if (formData.clinicId) updatePayload.clinicId = formData.clinicId;
        if (formData.bio) updatePayload.bio = formData.bio;

        console.log('Update payload:', updatePayload);
        await api.patch('/doctors/' + editingDoctor.id, updatePayload);
      } else {
        // Create - userId kerak
        const createPayload: Record<string, unknown> = {
          userId: formData.userId,
          fullName: formData.fullName,
          phone: formData.phone,
          categoryId: formData.categoryId,
          specialization: formData.specialization,
          experience: parseInt(formData.experience) || 0
        };
        if (formData.clinicId) createPayload.clinicId = formData.clinicId;
        if (formData.bio) createPayload.bio = formData.bio;

        console.log('Create payload:', createPayload);
        await api.post('/doctors', createPayload);
      }

      setShowModal(false);
      setEditingDoctor(null);
      setFormData({ userId: '', fullName: '', phone: '', categoryId: '', clinicId: '', specialization: '', experience: '0', bio: '' });
      loadDoctors();
      alert(editingDoctor ? 'Muvaffaqiyatli yangilandi!' : 'Muvaffaqiyatli yaratildi!');
    } catch (error: unknown) {
      console.error('Error:', error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      userId: doctor.userId || doctor.user?.id || '',
      fullName: doctor.fullName || doctor.user?.name || '',
      phone: doctor.phone || doctor.user?.phone || '',
      categoryId: doctor.categoryId || doctor.category?.id || '',
      clinicId: doctor.clinicId || doctor.clinic?.id || '',
      specialization: doctor.specialization || doctor.category?.name || '',
      experience: doctor.experience?.toString() || '0',
      bio: doctor.bio || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Shifokorni o'chirmoqchimisiz?")) return;
    try { 
      console.log('Deleting doctor with ID:', id);
      await api.delete('/doctors/' + id); 
      alert("Muvaffaqiyatli o'chirildi!");
      loadDoctors(); 
    }
    catch (error: unknown) { 
      console.error('Delete error:', error); 
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "O'chirishda xatolik yuz berdi"); 
    }
  };

  const openAddModal = () => {
    setEditingDoctor(null);
    setFormData({ userId: '', fullName: '', phone: '', categoryId: '', clinicId: '', specialization: '', experience: '0', bio: '' });
    setShowModal(true);
  };

  const filteredDoctors = doctors.filter(d =>
    d.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black-neon dark:text-white">Shifokorlar</h1>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"><FaPlus /> Qo'shish</button>
      </div>
      <div className="mb-4 relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Qidirish..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" />
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg shadow-lg border border-white/40 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-white/30 dark:bg-gray-700/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Shifokor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Mutaxassislik</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Klinika</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Tajriba</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Reyting</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 font-medium uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredDoctors.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium dark:text-white">{doctor.fullName || doctor.user?.name || '-'}</div>
                  <div className="text-sm text-black-neon dark:text-gray-200">{doctor.phone || doctor.user?.phone || '-'}</div>
                </td>
                <td className="px-6 py-4 text-sm dark:text-gray-300">{doctor.specialization || doctor.category?.name || '-'}</td>
                <td className="px-6 py-4 text-sm dark:text-gray-300">{doctor.clinic?.name || '-'}</td>
                <td className="px-6 py-4 text-sm dark:text-gray-300">{doctor.experience || 0} yil</td>
                <td className="px-6 py-4 text-sm dark:text-gray-300">{doctor.rating || 0}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEdit(doctor)} className="text-blue-600 mr-3" title="Tahrirlash"><FaEdit /></button>
                  <button onClick={() => handleDelete(doctor.id)} className="text-red-600" title="O'chirish"><FaTrash /></button>
                </td>
              </tr>
            ))}
            {filteredDoctors.length === 0 && <tr><td colSpan={6} className="px-6 py-4 text-center text-black-neon dark:text-gray-200">Topilmadi</td></tr>}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white">{editingDoctor ? 'Tahrirlash' : "Yangi shifokor"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Foydalanuvchi *</label>
                <select value={formData.userId} onChange={(e) => handleUserSelect(e.target.value)} className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" required disabled={!!editingDoctor}>
                  <option value="">Tanlang</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.phone})</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">To'liq ism *</label>
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" required placeholder="Shifokor ismi" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Telefon *</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" required placeholder="+998901234567" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Kategoriya *</label>
                <select value={formData.categoryId} onChange={(e) => {
                  const cat = categories.find(c => c.id.toString() === e.target.value);
                  setFormData({...formData, categoryId: e.target.value, specialization: cat?.nameUz || cat?.name || ''});
                }} className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" required>
                  <option value="">Tanlang</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nameUz || c.name}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Mutaxassislik *</label>
                <input type="text" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" required placeholder="Masalan: Kardiolog" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Klinika</label>
                <select value={formData.clinicId} onChange={(e) => setFormData({...formData, clinicId: e.target.value})} className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold">
                  <option value="">Tanlang (ixtiyoriy)</option>
                  {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tajriba (yil)</label>
                <input type="number" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" min="0" placeholder="0" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Bio</label>
                <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold" rows={3} placeholder="Shifokor haqida qisqacha ma'lumot" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg">Bekor qilish</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">{editingDoctor ? 'Saqlash' : "Qo'shish"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
