import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  BeakerIcon,
  DocumentTextIcon,
  UsersIcon,
  TruckIcon,
  UserGroupIcon,
  BriefcaseIcon,
  FolderIcon,
  BuildingOfficeIcon,
  UserIcon,
  BellIcon,
  ChartPieIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

interface MenuItem {
  id: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  path?: string;
  children?: MenuItem[];
}

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['appointments']);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: ChartBarIcon, path: '/admin' },
    { id: 'appointments', label: t('sidebar.appointments'), icon: CalendarDaysIcon, path: '/admin/appointments' },
    { id: 'laboratory', label: t('sidebar.analysis'), icon: BeakerIcon, path: '/admin/laboratory' },
    { id: 'patients', label: t('sidebar.patients'), icon: UsersIcon, path: '/admin/patients' },
    { id: 'patronage', label: t('sidebar.patronage'), icon: TruckIcon, path: '/admin/patronage' },
    { id: 'doctors', label: t('sidebar.doctors'), icon: UserGroupIcon, path: '/admin/doctors' },
    { id: 'services', label: t('sidebar.services'), icon: BriefcaseIcon, path: '/admin/services' },
    { id: 'categories', label: t('sidebar.categories'), icon: FolderIcon, path: '/admin/categories' },
    { id: 'clinics', label: t('sidebar.clinics'), icon: BuildingOfficeIcon, path: '/admin/clinics' },
    {
      id: 'users',
      label: t('sidebar.users'),
      icon: UserIcon,
      children: [
        { id: 'users-list', label: t('sidebar.users'), icon: UsersIcon, path: '/admin/users/list' },
        { id: 'role-requests', label: t('sidebar.roleRequests'), icon: UserGroupIcon, path: '/admin/users/role-requests' },
      ],
    },
    { id: 'notifications', label: t('sidebar.notifications'), icon: BellIcon, path: '/admin/notifications' },
    { id: 'analytics', label: t('sidebar.analytics'), icon: ChartPieIcon, path: '/admin/analytics' },
    { id: 'settings', label: t('sidebar.settings'), icon: Cog6ToothIcon, path: '/admin/settings' },
  ];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const active = isActive(item.path);
    const Icon = item.icon;

    if (hasChildren) {
      const btnClass = active
        ? 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 bg-blue-50 text-blue-600'
        : 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-100';

      const chevronClass = isExpanded
        ? 'w-4 h-4 transition-transform rotate-180'
        : 'w-4 h-4 transition-transform';

      return (
        <div key={item.id}>
          <button onClick={() => toggleMenu(item.id)} className={btnClass}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                <ChevronDownIcon className={chevronClass} />
              </>
            )}
          </button>
          {!collapsed && isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children?.map((child) => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    const getNavClass = (navActive: boolean) => {
      let baseClass = 'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200';
      if (navActive || active) {
        baseClass += ' bg-blue-50 text-blue-600 font-medium';
      } else {
        baseClass += ' text-gray-600 hover:bg-gray-100';
      }
      if (level > 0) {
        baseClass += ' text-sm';
      }
      return baseClass;
    };

    return (
      <NavLink
        key={item.id}
        to={item.path || '#'}
        className={({ isActive: navActive }) => getNavClass(navActive)}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span className="text-sm">{item.label}</span>}
      </NavLink>
    );
  };

  const asideClass = collapsed
    ? 'fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-all duration-300 w-16'
    : 'fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-all duration-300 w-64';

  return (
    <aside className={asideClass}>
      <div className="h-16 flex items-center justify-between px-3 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Bee's Medical" className="w-10 h-10 rounded-lg object-cover" />
            <span className="font-bold text-gray-900 dark:text-white">Bee's Medical</span>
          </div>
        )}
        {collapsed && (
          <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-lg object-cover mx-auto" />
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            title="Menuni yopish"
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">{t('sidebar.logout')}</span>}
        </button>
      </div>
    </aside>
  );
};
