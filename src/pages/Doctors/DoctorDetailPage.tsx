import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Card, Avatar, Badge, Button, PageLoading, Modal } from '../../components/ui';
import { Header } from '../../components/layout';
import { doctorService, appointmentService } from '../../services';
import { useAuthStore } from '../../store';
import { useThemeStore } from '../../store/themeStore';
import { format, addDays, startOfDay } from 'date-fns';
import { uz } from 'date-fns/locale';
import toast from 'react-hot-toast';
import type { Doctor, DoctorSchedule, AvailableSlot, DayOfWeek } from '../../types';

const dayOfWeekMap: Record<string, DayOfWeek> = {
  '0': 'sunday' as DayOfWeek,
  '1': 'monday' as DayOfWeek,
  '2': 'tuesday' as DayOfWeek,
  '3': 'wednesday' as DayOfWeek,
  '4': 'thursday' as DayOfWeek,
  '5': 'friday' as DayOfWeek,
  '6': 'saturday' as DayOfWeek,
};

const dayNames: Record<string, string> = {
  monday: 'Dushanba',
  tuesday: 'Seshanba',
  wednesday: 'Chorshanba',
  thursday: 'Payshanba',
  friday: 'Juma',
  saturday: 'Shanba',
  sunday: 'Yakshanba',
};

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { getBackgroundImage } = useThemeStore();
  const backgroundUrl = getBackgroundImage();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedule, setSchedule] = useState<DoctorSchedule[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (id) {
      loadDoctor();
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedDate) {
      loadAvailableSlots();
    }
  }, [id, selectedDate]);

  const loadDoctor = async () => {
    try {
      setLoading(true);
      const [doctorData, scheduleData] = await Promise.all([
        doctorService.getById(id!),
        doctorService.getSchedule(id!),
      ]);
      setDoctor(doctorData);
      setSchedule(scheduleData);
    } catch (error) {
      console.error('Failed to load doctor:', error);
      toast.error('Shifokor ma\'lumotlari yuklanmadi');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const slots = await doctorService.getAvailableSlots(id!, dateStr);
      // Backend string array qaytaradi, uni AvailableSlot formatiga o'tkazamiz
      const formattedSlots: AvailableSlot[] = (slots as unknown as string[]).map(time => ({
        time,
        isAvailable: true
      }));
      setAvailableSlots(formattedSlots);
      setSelectedTime(null);
    } catch (error) {
      console.error('Failed to load slots:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      toast.error('Iltimos, avval tizimga kiring');
      navigate('/auth/login');
      return;
    }

    if (!selectedTime) {
      toast.error('Vaqtni tanlang');
      return;
    }

    try {
      setBookingLoading(true);
      await appointmentService.create({
        doctorId: id!,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        appointmentTime: selectedTime,
        reason,
      });
      
      toast.success('Qabul muvaffaqiyatli yaratildi!');
      setShowBookingModal(false);
      navigate('/appointments');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setBookingLoading(false);
    }
  };

  // Generate date options for next 7 days
  const dateOptions = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  if (loading) {
    return <PageLoading />;
  }

  if (!doctor) {
    return (
      <div 
        className="min-h-screen bg-transparent"
        style={{
          backgroundImage: `url('${backgroundUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <Header title="Shifokor" showBack />
        <div className="p-4 text-center">
          <p className="text-gray-600">Shifokor topilmadi</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pb-24 bg-transparent"
      style={{
        backgroundImage: `url('${backgroundUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Header title="Shifokor" showBack />
      
      {/* Doctor Info Card */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-4 border-b border-white/40 dark:border-gray-700/40">
        <div className="flex items-start">
          <Avatar name={doctor.user?.name || 'Doctor'} size="xl" />
          <div className="flex-1 ml-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white font-semibold">
              {doctor.user?.name}
            </h1>
            <p className="text-primary-500 font-medium">
              {doctor.specialization}
            </p>
            
            <div className="flex items-center mt-2 space-x-4 text-sm text-black-neon dark:text-gray-200">
              <span className="flex items-center">
                <StarIconSolid className="w-4 h-4 text-yellow-400 mr-1" />
                {doctor.rating?.toFixed(1) || '0.0'} ({doctor.reviewCount || 0})
              </span>
              <span>{doctor.experience} yil tajriba</span>
            </div>

            {doctor.clinic && (
              <p className="flex items-center mt-2 text-sm text-black-neon dark:text-gray-200">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {doctor.clinic.name}
              </p>
            )}
          </div>
        </div>

        {/* Consultation Fee */}
        <div className="mt-4 p-3 bg-primary-500/20 dark:bg-primary-400/20 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-black-neon dark:text-gray-100 font-medium">Konsultatsiya narxi</span>
            <div>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {(doctor.consultationPrice || doctor.consultationFee)?.toLocaleString() || '0'}
              </span>
              <span className="text-black-neon dark:text-gray-200 ml-1">so'm</span>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      {doctor.bio && (
        <Card className="mx-4 mt-4">
          <h3 className="font-semibold text-gray-900 dark:text-white font-semibold mb-2">Shifokor haqida</h3>
          <p className="text-black-neon dark:text-gray-100 font-medium text-sm">{doctor.bio}</p>
        </Card>
      )}

      {/* Education */}
      {doctor.education && (
        <Card className="mx-4 mt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Ta'lim</h3>
          <p className="text-gray-600 text-sm">{doctor.education}</p>
        </Card>
      )}

      {/* Schedule */}
      <Card className="mx-4 mt-4">
        <h3 className="font-semibold text-gray-900 mb-3">Ish jadvali</h3>
        <div className="space-y-2">
          {schedule.filter(s => s.isActive).map((s) => (
            <div key={s.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{dayNames[s.dayOfWeek]}</span>
              <span className="font-medium text-gray-900">
                {s.startTime} - {s.endTime}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Date Selection */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold text-gray-900 mb-3">Sanani tanlang</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {dateOptions.map((date) => {
            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const dayOfWeek = dayOfWeekMap[date.getDay().toString()];
            const scheduleForDay = schedule.find(s => s.dayOfWeek === dayOfWeek && s.isActive);
            const isAvailable = !!scheduleForDay;

            return (
              <button
                key={date.toISOString()}
                onClick={() => isAvailable && setSelectedDate(date)}
                disabled={!isAvailable}
                className={`flex flex-col items-center p-3 rounded-xl min-w-[70px] transition-colors ${
                  isSelected
                    ? 'bg-primary-500 text-white'
                    : isAvailable
                    ? 'bg-white border border-gray-200 text-gray-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="text-xs font-medium">
                  {format(date, 'EEE', { locale: uz })}
                </span>
                <span className="text-lg font-bold mt-1">
                  {format(date, 'd')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold text-gray-900 mb-3">Vaqtni tanlang</h3>
        {schedule.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-800 text-sm">⚠️ Shifokorning ish jadvali hali kiritilmagan. Iltimos, keyinroq qayta urinib ko'ring.</p>
          </div>
        ) : availableSlots.length === 0 ? (
          <p className="text-gray-600 text-sm">Bu sanada bo'sh vaqt yo'q</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {availableSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => slot.isAvailable && setSelectedTime(slot.time)}
                disabled={!slot.isAvailable}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedTime === slot.time
                    ? 'bg-primary-500 text-white'
                    : slot.isAvailable
                    ? 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-area-bottom">
        <Button
          fullWidth
          size="lg"
          disabled={!selectedTime}
          onClick={() => setShowBookingModal(true)}
        >
          Qabulga yozilish
        </Button>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Qabulni tasdiqlash"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <Avatar name={doctor.user?.name || 'Doctor'} size="md" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">{doctor.user?.name}</p>
                <p className="text-sm text-gray-600">{doctor.specialization}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-gray-600">
                <CalendarDaysIcon className="w-4 h-4 mr-2" />
                {format(selectedDate, 'd MMMM yyyy', { locale: uz })}
              </div>
              <div className="flex items-center text-gray-600">
                <ClockIcon className="w-4 h-4 mr-2" />
                {selectedTime}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Murojaat sababi (ixtiyoriy)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Qisqacha shikoyatingizni yozing..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
            />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-gray-600">Jami</span>
            <span className="text-xl font-bold text-primary-600">
              {(doctor.consultationPrice || doctor.consultationFee)?.toLocaleString() || '0'} so'm
            </span>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowBookingModal(false)}
            >
              Bekor qilish
            </Button>
            <Button
              fullWidth
              loading={bookingLoading}
              onClick={handleBookAppointment}
            >
              Tasdiqlash
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
