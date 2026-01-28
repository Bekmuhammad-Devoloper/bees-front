import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { adminService } from '../../services';
import api from '../../services/api';
import toast from 'react-hot-toast';
import type { RoleRequest, UserRole } from '../../types';

const roleLabels: Record<UserRole, string> = {
  user: 'Bemor',
  doctor: 'Shifokor',
  admin: 'Admin',
  super_admin: 'Super Admin',
  reception: 'Qabulxona',
  driver: 'Haydovchi',
  lab_technician: 'Laborant',
};

const statusLabels: Record<string, string> = {
  pending: 'Kutilmoqda',
  approved: 'Tasdiqlangan',
  rejected: 'Rad etilgan',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export const AdminRoleRequestsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [reviewNote, setReviewNote] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page: 1, limit: 50 };
      if (statusFilter) params.status = statusFilter;
      
      const response = await api.get('/admin/role-requests', { params });
      
      // Backend ikki marta wrap qilgan: response.data.data.data.items
      const items = response.data?.data?.data?.items || response.data?.data?.items || [];
      
      setRequests(items);
    } catch (err: unknown) {
      console.error('Error:', err);
      setError('Xatolik yuz berdi');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, reviewNote }: { id: string; status: 'approved' | 'rejected'; reviewNote?: string }) => {
      console.log('=== MUTATION CALLED ===');
      console.log('Params:', { id, status, reviewNote });
      return adminService.reviewRoleRequest(id, { status, reviewNote });
    },
    onSuccess: (data) => {
      console.log('=== MUTATION SUCCESS ===');
      console.log('Response data:', data);
      toast.success('Muvaffaqiyatli');
      setShowModal(false);
      setSelectedRequest(null);
      setReviewNote('');
      fetchData();
    },
    onError: (error) => {
      console.error('=== MUTATION ERROR ===');
      console.error('Error:', error);
      toast.error('Xatolik');
    },
  });

  const handleReview = () => {
    if (selectedRequest) {
      reviewMutation.mutate({ id: selectedRequest.id, status: reviewAction, reviewNote: reviewNote || undefined });
    }
  };

  const openModal = (req: RoleRequest, action: 'approved' | 'rejected') => {
    setSelectedRequest(req);
    setReviewAction(action);
    setReviewNote('');
    setShowModal(true);
  };

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black-neon dark:text-white">Rol sorovlari</h1>
        <button onClick={fetchData} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
          <ArrowPathIcon className={isLoading ? 'w-5 h-5 animate-spin' : 'w-5 h-5'} />
          Yangilash
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ value: 'pending', label: 'Kutilmoqda' }, { value: 'approved', label: 'Tasdiqlangan' }, { value: 'rejected', label: 'Rad etilgan' }, { value: '', label: 'Barchasi' }].map((f) => (
          <button key={f.value} onClick={() => setStatusFilter(f.value)} className={statusFilter === f.value ? 'px-4 py-2 rounded-lg bg-blue-600 text-white' : 'px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg text-black-neon dark:text-gray-100 border border-white/40 dark:border-gray-700/40'}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/40 dark:border-gray-700/40 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-black-neon dark:text-gray-200">Sorovlar topilmadi</div>
        ) : (
          <table className="w-full">
            <thead className="bg-white/30 dark:bg-gray-700/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 uppercase">Foydalanuvchi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 uppercase">Joriy rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 uppercase">Soralgan rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 uppercase">Sabab</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-neon dark:text-gray-100 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-black-neon dark:text-gray-100 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-black-neon dark:text-white">{req.user?.name || req.user?.phone || 'Nomalum'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black-neon dark:text-gray-200">{roleLabels[req.currentRole] || req.currentRole}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-800 text-sm">{roleLabels[req.requestedRole] || req.requestedRole}</span></td>
                  <td className="px-6 py-4 text-black-neon dark:text-gray-200 text-sm">{req.reason || '-'}</td>
                  <td className="px-6 py-4"><span className={'px-2 py-1 rounded-lg text-sm ' + (statusColors[req.status] || '')}>{statusLabels[req.status] || req.status}</span></td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openModal(req, 'approved')} className="p-2 text-green-600 hover:bg-green-100 rounded-lg"><CheckCircleIcon className="w-5 h-5" /></button>
                        <button onClick={() => openModal(req, 'rejected')} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><XCircleIcon className="w-5 h-5" /></button>
                      </div>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl w-full max-w-md p-6 border border-white/40 dark:border-gray-700/40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black-neon dark:text-white">{reviewAction === 'approved' ? 'Tasdiqlash' : 'Rad etish'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Foydalanuvchi:</strong> {selectedRequest.user?.name || selectedRequest.user?.phone}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Soralgan rol:</strong> {roleLabels[selectedRequest.requestedRole]}</p>
            </div>
            <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Izoh..." className="w-full border p-3 rounded-lg mb-4 bg-white dark:bg-gray-700 text-black-neon dark:text-white" rows={3} />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Bekor</button>
              <button onClick={handleReview} disabled={reviewMutation.isPending} className={reviewAction === 'approved' ? 'flex-1 px-4 py-2 rounded-lg text-white bg-green-600' : 'flex-1 px-4 py-2 rounded-lg text-white bg-red-600'}>
                {reviewMutation.isPending ? '...' : reviewAction === 'approved' ? 'Tasdiqlash' : 'Rad etish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
