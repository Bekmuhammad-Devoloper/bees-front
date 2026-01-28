import React from 'react';
import clsx from 'clsx';
import { AppointmentStatus, ServiceOrderStatus, HomeVisitStatus } from '../../types';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className,
}) => {
  const variants = {
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

// Helper function to get badge variant based on status
export const getStatusBadgeVariant = (
  status: AppointmentStatus | ServiceOrderStatus | HomeVisitStatus
): BadgeVariant => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
    case 'assigned':
      return 'info';
    case 'in_progress':
    case 'en_route':
    case 'arrived':
      return 'primary';
    case 'completed':
      return 'success';
    case 'cancelled':
    case 'no_show':
      return 'danger';
    default:
      return 'secondary';
  }
};

// Status Badge Component
interface StatusBadgeProps {
  status: AppointmentStatus | ServiceOrderStatus | HomeVisitStatus;
  size?: 'sm' | 'md';
}

const statusLabels: Record<string, { uz: string; ru: string }> = {
  pending: { uz: 'Kutilmoqda', ru: 'Ожидание' },
  confirmed: { uz: 'Tasdiqlangan', ru: 'Подтверждено' },
  in_progress: { uz: 'Jarayonda', ru: 'В процессе' },
  completed: { uz: 'Tugallangan', ru: 'Завершено' },
  cancelled: { uz: 'Bekor qilingan', ru: 'Отменено' },
  no_show: { uz: 'Kelmadi', ru: 'Не явился' },
  assigned: { uz: 'Tayinlangan', ru: 'Назначено' },
  en_route: { uz: 'Yo\'lda', ru: 'В пути' },
  arrived: { uz: 'Yetib keldi', ru: 'Прибыл' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const label = statusLabels[status]?.uz || status;
  const variant = getStatusBadgeVariant(status);

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
};
