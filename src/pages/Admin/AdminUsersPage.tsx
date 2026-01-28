import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { adminService } from '../../services';
import toast from 'react-hot-toast';
import type { User, UserRole, UserStatus } from '../../types';

const roleLabels: Record<UserRole, string> = {
  user: 'Bemor',
  doctor: 'Shifokor',
  admin: 'Admin',
  super_admin: 'Super Admin',
  reception: 'Qabulxona',
  driver: 'Haydovchi',
  lab_technician: 'Laborant',
};

const roleColors: Record<UserRole, string> = {
  user: 'bg-gray-100 text-black-neon',
  doctor: 'bg-blue-100 text-blue-800',
  admin: 'bg-purple-100 text-purple-800',
  super_admin: 'bg-red-100 text-red-800',
  reception: 'bg-green-100 text-green-800',
  driver: 'bg-yellow-100 text-yellow-800',
  lab_technician: 'bg-pink-100 text-pink-800',
};

const statusColors: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-black-neon',
  blocked: 'bg-red-100 text-red-800',
};

const statusLabels: Record<UserStatus, string> = {
  active: 'Faol',
  inactive: 'Nofaol',
  blocked: 'Bloklangan',
};

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', page, roleFilter, debouncedSearch],
    queryFn: () => adminService.getAllUsers({ 
      page, 
      limit: 20, 
      role: roleFilter || undefined,
      search: debouncedSearch || undefined,
    }),
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      adminService.changeUserRole(id, role),
    onSuccess: () => {
      toast.success("Foydalanuvchi roli o'zgartirildi");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowRoleModal(false);
      setEditingUser(null);
      setSelectedRole('');
    },
    onError: () => {
      toast.error("Xatolik yuz berdi");
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => adminService.toggleUserStatus(id),
    onSuccess: () => {
      toast.success("Foydalanuvchi statusi o'zgartirildi");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error("Xatolik yuz berdi");
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-users'] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['admin-users', page, roleFilter, debouncedSearch]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['admin-users', page, roleFilter, debouncedSearch], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data?.filter((user: User) => user.id !== deletedId),
          total: old.total ? old.total - 1 : old.total,
        };
      });
      
      return { previousData };
    },
    onSuccess: () => {
      toast.success("Foydalanuvchi o'chirildi");
      // Small delay before refetch to allow backend to complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      }, 500);
    },
    onError: (error: any, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['admin-users', page, roleFilter, debouncedSearch], context.previousData);
      }
      console.error('Delete error:', error);
      const message = error?.response?.data?.message || "Xatolik yuz berdi";
      toast.error(message);
    },
  });

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`${user.name} ni o'chirishni xohlaysizmi?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handleRoleChange = () => {
    if (editingUser && selectedRole) {
      changeRoleMutation.mutate({ id: editingUser.id, role: selectedRole });
    }
  };

  const openRoleModal = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setShowRoleModal(true);
  };

  const allUsers = usersData?.data || [];
  
  // Local filtering (backup until backend search is deployed)
  const users = debouncedSearch 
    ? allUsers.filter(user => 
        user.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.phone?.includes(debouncedSearch)
      )
    : allUsers;
    
  const totalPages = usersData?.totalPages || usersData?.meta?.totalPages || 1;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black-neon">Foydalanuvchilar</h1>
        <p className="text-black-neon/80 mt-1">Barcha foydalanuvchilarni boshqarish</p>
      </div>

      {/* Filters */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl border border-white/40 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-gray-800/70"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="min-w-[150px]">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
              className="w-full px-4 py-2.5 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-gray-800/70"
              title="Rol bo'yicha filtr"
              aria-label="Rol bo'yicha filtr"
            >
              <option value="">Barcha rollar</option>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl border border-white/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/70 dark:bg-gray-800/70 border-b border-white/40">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-black-neon uppercase tracking-wider">
                  Foydalanuvchi
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-black-neon uppercase tracking-wider">
                  Telefon
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-black-neon uppercase tracking-wider">
                  Rol
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-black-neon uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-black-neon uppercase tracking-wider">
                  Ro'yxatdan o'tgan
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-black-neon uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-black-neon">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-black-neon">
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/30 bg-white/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-black-neon">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user.name || 'Noma\'lum'}
                          </p>
                          {user.telegramId && (
                            <p className="text-sm text-black-neon/70">Telegram: {user.telegramId}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-black-neon/80">{user.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                        {statusLabels[user.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-black-neon/80 text-sm">
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString('uz-UZ')
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingUser(user)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Ko'rish"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openRoleModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Rolni o'zgartirish"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatusMutation.mutate(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'active'
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.status === 'active' ? 'Bloklash' : 'Faollashtirish'}
                        >
                          {user.status === 'active' ? (
                            <XCircleIcon className="w-4 h-4" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {usersData?.meta?.total || usersData?.total || 0} ta foydalanuvchi
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              >
                Oldingi
              </button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
              >
                Keyingi
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {showRoleModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rolni o'zgartirish
            </h3>
            <p className="text-gray-600 mb-4">
              <span className="font-medium">{editingUser.name || editingUser.firstName}</span> uchun yangi rol tanlang
            </p>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Yangi rol tanlang"
              aria-label="Yangi rol tanlang"
            >
              <option value="">Rol tanlang</option>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setEditingUser(null);
                  setSelectedRole('');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleRoleChange}
                disabled={!selectedRole || changeRoleMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {changeRoleMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Foydalanuvchi ma'lumotlari
              </h3>
              <button
                onClick={() => setViewingUser(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
                title="Yopish"
              >
                <XCircleIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {(viewingUser.name || viewingUser.firstName || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {viewingUser.name || `${viewingUser.firstName || ''} ${viewingUser.lastName || ''}`.trim() || 'Noma\'lum'}
                  </h4>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[viewingUser.role]}`}>
                    {roleLabels[viewingUser.role]}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Telefon:</span>
                  <span className="font-medium text-gray-900">{viewingUser.phone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Telegram ID:</span>
                  <span className="font-medium text-gray-900">{viewingUser.telegramId || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[viewingUser.status]}`}>
                    {statusLabels[viewingUser.status]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ro'yxatdan o'tgan:</span>
                  <span className="font-medium text-gray-900">
                    {viewingUser.createdAt 
                      ? new Date(viewingUser.createdAt).toLocaleDateString('uz-UZ')
                      : '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setViewingUser(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Yopish
              </button>
              <button
                onClick={() => {
                  setViewingUser(null);
                  openRoleModal(viewingUser);
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Rolni o'zgartirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
