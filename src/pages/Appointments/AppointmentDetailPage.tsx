import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon,
  PhoneIcon,
  DocumentTextIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Card, Avatar, StatusBadge, Button, PageLoading, Modal } from '../../components/ui';
import { Header } from '../../components/layout';
import { appointmentService } from '../../services';
import { useThemeStore } from '../../store/themeStore';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import toast from 'react-hot-toast';
import type { Appointment } from '../../types';

export const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getMyAppointmentById(id!);
      setAppointment(data);
    } catch (error) {
      console.error('Failed to load appointment:', error);
      toast.error('Qabul ma\'lumotlari yuklanmadi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelLoading(true);
      await appointmentService.cancelMyAppointment(id!, cancelReason);
      toast.success('Qabul bekor qilindi');
      setShowCancelModal(false);
      loadAppointment();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        <Header title="Qabul" showBack />
        <div className="p-4 text-center">
          <p className="text-gray-600">Qabul topilmadi</p>
        </div>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(appointment.status);

  return (
    <div className="min-h-screen pb-24 bg-white dark:bg-black text-black dark:text-white">
      <Header title="Qabul tafsilotlari" showBack />
      
      {/* Status Banner */}
      <div className="bg-white p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Qabul holati</p>
            <div className="mt-1">
              <StatusBadge status={appointment.status} size="md" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Qabul raqami</p>
            <p className="font-mono text-gray-900">#{appointment.id.slice(-8)}</p>
          </div>
        </div>
      </div>

      {/* Doctor Info */}
      <Card className="mx-4 mt-4">
        <div className="flex items-start">
          <Avatar name={appointment.doctor?.user?.name || 'Doctor'} size="lg" />
          <div className="flex-1 ml-3">
            <p className="font-semibold text-gray-900 dark:text-white font-semibold">
              {appointment.doctor?.user?.name}
            </p>
            <p className="text-sm text-primary-500">
              {appointment.doctor?.specialization}
            </p>
            {appointment.doctor?.clinic && (
              <p className="flex items-center mt-2 text-sm text-black-neon dark:text-gray-200">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {appointment.doctor.clinic.name}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Appointment Details */}
      <Card className="mx-4 mt-4">
        <h3 className="font-semibold text-gray-900 dark:text-white font-semibold mb-4">Qabul ma'lumotlari</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-500/20 dark:bg-primary-400/20 rounded-full flex items-center justify-center">
              <CalendarDaysIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-black-neon dark:text-gray-200">Sana</p>
              <p className="font-medium text-gray-900 dark:text-white font-semibold">
                {format(new Date(appointment.appointmentDate), 'd MMMM yyyy', { locale: uz })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500/20 dark:bg-green-400/20 rounded-full flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-black-neon dark:text-gray-200">Vaqt</p>
              <p className="font-medium text-gray-900 dark:text-white font-semibold">
                {appointment.appointmentTime}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Reason */}
      {appointment.reason && (
        <Card className="mx-4 mt-4">
          <div className="flex items-start">
            <DocumentTextIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-black-neon dark:text-gray-200">Murojaat sababi</p>
              <p className="text-gray-900 dark:text-white font-semibold mt-1">{appointment.reason}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Doctor Notes */}
      {appointment.doctorNotes && (
        <Card className="mx-4 mt-4">
          <h3 className="font-semibold text-gray-900 dark:text-white font-semibold mb-2">Shifokor izohi</h3>
          <p className="text-black-neon dark:text-gray-100 font-medium">{appointment.doctorNotes}</p>
        </Card>
      )}

      {/* Cancel Reason */}
      {appointment.cancelReason && (
        <Card className="mx-4 mt-4 border-red-200/50 dark:border-red-500/30">
          <div className="flex items-start">
            <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-500">Bekor qilish sababi</p>
              <p className="text-gray-900 dark:text-white font-semibold mt-1">{appointment.cancelReason}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      {canCancel && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-white/40 dark:border-gray-700/40 safe-area-bottom">
          <Button
            variant="danger"
            fullWidth
            onClick={() => setShowCancelModal(true)}
          >
            Qabulni bekor qilish
          </Button>
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Qabulni bekor qilish"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Haqiqatdan ham bu qabulni bekor qilmoqchimisiz?
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sabab (ixtiyoriy)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Bekor qilish sababini kiriting..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowCancelModal(false)}
            >
              Yo'q, ortga
            </Button>
            <Button
              variant="danger"
              fullWidth
              loading={cancelLoading}
              onClick={handleCancel}
            >
              Ha, bekor qilish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
