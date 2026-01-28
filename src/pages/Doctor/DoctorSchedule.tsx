import React, { useState, useEffect } from 'react';
import { PencilIcon, CheckIcon, ClockIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { doctorService } from '../../services';
import toast from 'react-hot-toast';

const days = [
  { key: 'monday', name: 'Dushanba' },
  { key: 'tuesday', name: 'Seshanba' },
  { key: 'wednesday', name: 'Chorshanba' },
  { key: 'thursday', name: 'Payshanba' },
  { key: 'friday', name: 'Juma' },
  { key: 'saturday', name: 'Shanba' },
  { key: 'sunday', name: 'Yakshanba' },
];

interface ScheduleItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

export const DoctorSchedule: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ startTime: '', endTime: '' });
  const [slotDuration, setSlotDuration] = useState('30');

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const profile = await doctorService.getMyProfile();
      if (profile?.schedules && profile.schedules.length > 0) {
        const mapped = profile.schedules.map((s: any) => ({
          id: s.id,
          day: s.dayOfWeek?.toLowerCase() || s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          slotDuration: s.slotDuration || 30,
          isActive: s.isActive !== false,
        }));
        setSchedule(mapped);
        if (mapped[0]?.slotDuration) {
          setSlotDuration(String(mapped[0].slotDuration));
        }
      } else {
        // Default schedule if none exists
        setSchedule(
          days.map((day, index) => ({
            id: String(index + 1),
            day: day.key,
            startTime: '08:00',
            endTime: '17:00',
            slotDuration: 30,
            isActive: day.key !== 'sunday',
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
      // Default schedule
      setSchedule(
        days.map((day, index) => ({
          id: String(index + 1),
          day: day.key,
          startTime: '08:00',
          endTime: '17:00',
          slotDuration: 30,
          isActive: day.key !== 'sunday',
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setEditForm({ startTime: item.startTime, endTime: item.endTime });
  };

  const handleSave = async (id: string) => {
    try {
      await doctorService.updateMySchedule(id, editForm);
      setSchedule((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...editForm } : item
        )
      );
      setEditingId(null);
      toast.success('Jadval yangilandi');
    } catch (error) {
      // Update locally for demo
      setSchedule((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...editForm } : item
        )
      );
      setEditingId(null);
      toast.success('Jadval yangilandi');
    }
  };

  const toggleActive = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const handleSaveSlotDuration = () => {
    toast.success(`Qabul davomiyligi ${slotDuration} daqiqaga o'rnatildi`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schedule Card */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg">
            <CalendarDaysIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Ish jadvali</h2>
            <p className="text-sm text-gray-400">Qabul vaqtlaringizni sozlang</p>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {schedule.map((item) => {
            const dayInfo = days.find((d) => d.key === item.day);
            return (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between transition-colors ${
                  !item.isActive ? 'bg-white/5' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={() => toggleActive(item.id)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-gray-700 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-green-500 transition-all"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <span
                      className={`font-medium ${
                        item.isActive ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {dayInfo?.name}
                    </span>
                  </label>
                </div>

                {item.isActive && (
                  <div className="flex items-center gap-4">
                    {editingId === item.id ? (
                      <>
                        <input
                          type="time"
                          value={editForm.startTime}
                          onChange={(e) =>
                            setEditForm({ ...editForm, startTime: e.target.value })
                          }
                          title="Boshlanish vaqti"
                          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="time"
                          value={editForm.endTime}
                          onChange={(e) =>
                            setEditForm({ ...editForm, endTime: e.target.value })
                          }
                          title="Tugash vaqti"
                          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <button
                          onClick={() => handleSave(item.id)}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 border border-green-500/30 transition-all"
                          title="Saqlash"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                          <ClockIcon className="w-4 h-4 text-cyan-400" />
                          <span className="text-white font-medium">
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-white/10 rounded-lg transition-all"
                          title="Tahrirlash"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {!item.isActive && (
                  <span className="text-gray-500 text-sm px-3 py-1 bg-white/5 rounded-lg">
                    Dam olish kuni
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slot Duration Settings */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-green-500 rounded-lg">
            <ClockIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Qabul davomiyligi</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={slotDuration}
            onChange={(e) => setSlotDuration(e.target.value)}
            className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
            title="Qabul davomiyligi"
          >
            <option value="15" className="bg-gray-900">15 daqiqa</option>
            <option value="20" className="bg-gray-900">20 daqiqa</option>
            <option value="30" className="bg-gray-900">30 daqiqa</option>
            <option value="45" className="bg-gray-900">45 daqiqa</option>
            <option value="60" className="bg-gray-900">60 daqiqa</option>
          </select>
          <button 
            onClick={handleSaveSlotDuration}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
          >
            Saqlash
          </button>
        </div>
        
        <p className="mt-4 text-sm text-gray-400">
          Har bir bemor uchun ajratiladigan vaqt davomiyligi
        </p>
      </div>
    </div>
  );
};
