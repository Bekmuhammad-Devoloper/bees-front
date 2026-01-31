import React, { useState, useEffect } from 'react';
import {
  PhoneIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  StarIcon,
  PencilIcon,
  CheckIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store';
import { doctorService } from '../../services';
import toast from 'react-hot-toast';
import type { Doctor, DoctorStats } from '../../types';

export const DoctorProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    specialization: '',
    experience: 0,
    education: '',
    consultationFee: 0,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileData, statsData] = await Promise.all([
        doctorService.getMyProfile(),
        doctorService.getMyStatistics(),
      ]);
      
      if (profileData) {
        setProfile(profileData);
        setEditForm({
          bio: profileData.bio || '',
          specialization: profileData.specialization || '',
          experience: profileData.experience || 0,
          education: profileData.education || '',
          consultationFee: profileData.consultationFee || profileData.consultationPrice || 0,
        });
      }
      
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Profil yuklanmadi. Qayta urinib ko\'ring.');
      toast.error('Profil yuklanmadi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProfile = await doctorService.updateMyProfile({
        bio: editForm.bio,
        specialization: editForm.specialization,
        experience: editForm.experience,
        education: editForm.education,
        consultationFee: editForm.consultationFee,
      });
      
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      
      setEditing(false);
      toast.success('Profil yangilandi');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Profilni yangilashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 border border-red-500 text-center">
        <div className="text-red-500 text-lg mb-4">{error || 'Profil topilmadi'}</div>
        <button
          onClick={loadProfile}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-all"
        >
          Qayta yuklash
        </button>
      </div>
    );
  }

  const doctorName = profile?.fullName || profile?.user?.name || 
    `${profile?.user?.firstName || ''} ${profile?.user?.lastName || ''}`.trim() || 
    user?.name || 
    'Shifokor';

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {doctorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white">{doctorName}</h2>
              <p className="text-primary-500">{profile?.specialization || profile?.category?.name || 'Mutaxassis'}</p>
              <div className="flex items-center gap-2 mt-2">
                <StarIcon className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-yellow-500 font-semibold">{profile?.rating ? Number(profile.rating).toFixed(1) : '0.0'}</span>
                <span className="text-gray-500 dark:text-gray-400">({profile?.reviewCount || profile?.reviewsCount || 0} ta sharh)</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            title="Tahrirlash"
          >
            <PencilIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-primary-500">{stats?.totalAppointments || 0}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Jami qabullar</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-green-500">{stats?.completedAppointments || 0}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tugallangan</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-purple-500">{profile?.experience || 0} yil</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tajriba</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-yellow-500">{profile?.patientsCount || 0}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bemorlar</p>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
          Shaxsiy ma'lumotlar
        </h3>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Mutaxassislik</label>
              <input
                type="text"
                value={editForm.specialization}
                onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                placeholder="Masalan: Kardiolog"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Ta'lim</label>
              <input
                type="text"
                value={editForm.education}
                onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                placeholder="Masalan: Toshkent Tibbiyot Akademiyasi"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tajriba (yil)</label>
                <input
                  type="number"
                  value={editForm.experience}
                  onChange={(e) => setEditForm({ ...editForm, experience: parseInt(e.target.value) || 0 })}
                  placeholder="5"
                  min={0}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Konsultatsiya narxi (so'm)</label>
                <input
                  type="number"
                  value={editForm.consultationFee}
                  onChange={(e) => setEditForm({ ...editForm, consultationFee: parseInt(e.target.value) || 0 })}
                  placeholder="100000"
                  min={0}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Bio</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
                placeholder="O'zingiz haqingizda qisqacha ma'lumot..."
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <PhoneIcon className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                <p className="text-black dark:text-white">{profile?.user?.phone || user?.phone || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <AcademicCapIcon className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ta'lim</p>
                <p className="text-black dark:text-white">{profile?.education || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <BriefcaseIcon className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tajriba</p>
                <p className="text-black dark:text-white">{profile?.experience || 0} yil</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <CurrencyDollarIcon className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Konsultatsiya narxi</p>
                <p className="text-black dark:text-white">{formatPrice(profile?.consultationFee || profile?.consultationPrice || 0)}</p>
              </div>
            </div>
            {profile?.clinic && (
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <BuildingOfficeIcon className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Klinika</p>
                  <p className="text-black dark:text-white">{profile.clinic.name}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bio */}
      {!editing && profile?.bio && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
            Haqida
          </h3>
          <p className="text-gray-600 dark:text-gray-300">{profile.bio}</p>
        </div>
      )}

      {/* Schedule Info */}
      {profile?.schedules && profile.schedules.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
            Ish jadvali
          </h3>
          <div className="space-y-2">
            {profile.schedules.filter(s => s.isActive).map((schedule) => (
              <div key={schedule.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-black dark:text-white capitalize">{schedule.dayOfWeek}</span>
                <span className="text-primary-500">{schedule.startTime} - {schedule.endTime}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
