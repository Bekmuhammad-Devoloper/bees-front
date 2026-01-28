import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeftIcon,
  PencilIcon,
  StarIcon,
  PhoneIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { doctorService } from '../../services';
import type { Doctor, DoctorSchedule } from '../../types';

export const DoctorProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');

  // Mock data for demonstration
  const mockDoctor = {
    id: '1',
    name: "SULTANOV ZAHIRIDDIN FAXRITDIN O'G'LI",
    role: 'Shifokor',
    specialization: 'Bolalar pulmonologi',
    jshshir: '31101904220043',
    cabinet: '-',
    birthDate: '11.01.1990',
    phone: '+998939109969',
    status: '-',
    position: '-',
    rating: 0.0,
    photo: null,
  };

  const mockSchedule = [
    { day: 'Dushanba', time: '08:00 - 21:00' },
    { day: 'Seshanba', time: '08:00 - 21:00' },
    { day: 'Chorshanba', time: '08:00 - 21:00' },
    { day: 'Payshanba', time: '08:00 - 21:00' },
    { day: 'Juma', time: '08:00 - 21:00' },
    { day: 'Shanba', time: '08:00 - 21:00' },
    { day: 'Yakshanba', time: '08:00 - 21:00' },
  ];

  useEffect(() => {
    loadDoctor();
  }, [id]);

  const loadDoctor = async () => {
    try {
      setLoading(false);
      // API call would go here
    } catch (error) {
      console.error('Failed to load doctor:', error);
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'schedule', name: "Ish jadvali va yo'qligi" },
    { id: 'profile', name: 'Profil' },
    { id: 'referrals', name: "Yo'llanmalar" },
    { id: 'commissions', name: 'Komissiyalar' },
    { id: 'payments', name: "To'lanmagan hisoblar" },
    { id: 'documents', name: 'Hujjatlar' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button
          onClick={() => navigate('/admin/doctors/list')}
          className="flex items-center gap-1 hover:text-blue-600"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Shifokorlar
        </button>
        <span>/</span>
        <span className="text-gray-900">{mockDoctor.name}</span>
      </div>

      {/* Doctor Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-6">{mockDoctor.name}</h1>

        <div className="flex gap-8">
          {/* Photo */}
          <div className="w-32 h-40 bg-gray-200 rounded-xl flex items-center justify-center">
            <span className="text-4xl text-gray-400">👤</span>
          </div>

          {/* Info Grid */}
          <div className="flex-1 grid grid-cols-4 gap-x-8 gap-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rol</p>
              <p className="font-medium text-gray-900">{mockDoctor.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Mutaxassisligi</p>
              <p className="font-medium text-gray-900">{mockDoctor.specialization}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">JSHSHIR</p>
              <p className="font-medium text-gray-900">{mockDoctor.jshshir}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Kabinet raqami</p>
              <p className="font-medium text-gray-900">{mockDoctor.cabinet}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tug'ilgan sana</p>
              <p className="font-medium text-gray-900">{mockDoctor.birthDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Telefon raqami</p>
              <p className="font-medium text-gray-900">{mockDoctor.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Holati</p>
              <p className="font-medium text-gray-900">{mockDoctor.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Lavozimi</p>
              <p className="font-medium text-gray-900">{mockDoctor.position}</p>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-1">Reyting</p>
          <div className="flex items-center gap-1">
            <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-gray-900">{mockDoctor.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-white bg-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Work Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ish jadvali</h3>
                <div className="grid grid-cols-7 gap-4">
                  {mockSchedule.map((schedule, index) => (
                    <div key={index} className="text-center">
                      <p className="text-sm text-gray-600 mb-2">{schedule.day}</p>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm font-medium text-gray-900">{schedule.time}</span>
                        <button className="p-1 hover:bg-gray-100 rounded" title="Tahrirlash">
                          <PencilIcon className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Absence Schedule */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Yo'qlik jadvali</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Qo'shish
                  </button>
                </div>
                <div className="text-center py-8 text-gray-600">
                  Yo'qlik jadvali bo'sh
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="text-center py-8 text-gray-600">
              Profil ma'lumotlari
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="text-center py-8 text-gray-600">
              Yo'llanmalar ro'yxati
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
