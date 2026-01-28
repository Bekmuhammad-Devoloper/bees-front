import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { 
  HomeIcon, 
  UserGroupIcon, 
  CalendarDaysIcon, 
  WrenchScrewdriverIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid';
import { useAppStore } from '../../store';

// Translations for nav items
const navLabels = {
  uz: {
    home: 'Bosh sahifa',
    doctors: 'Shifokorlar',
    appointments: 'Qabullar',
    services: 'Xizmatlar',
    profile: 'Profil',
  },
  ru: {
    home: 'Главная',
    doctors: 'Врачи',
    appointments: 'Записи',
    services: 'Услуги',
    profile: 'Профиль',
  },
};

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { language } = useAppStore();
  const t = navLabels[language] || navLabels.uz;

  const navItems = [
    { 
      path: '/', 
      label: t.home, 
      icon: HomeIcon, 
      activeIcon: HomeIconSolid 
    },
    { 
      path: '/doctors', 
      label: t.doctors, 
      icon: UserGroupIcon, 
      activeIcon: UserGroupIconSolid 
    },
    { 
      path: '/appointments', 
      label: t.appointments, 
      icon: CalendarDaysIcon, 
      activeIcon: CalendarDaysIconSolid 
    },
    { 
      path: '/services', 
      label: t.services, 
      icon: WrenchScrewdriverIcon, 
      activeIcon: WrenchScrewdriverIconSolid 
    },
    { 
      path: '/profile', 
      label: t.profile, 
      icon: UserCircleIcon, 
      activeIcon: UserCircleIconSolid 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-white/40 dark:border-gray-700/40 safe-area-bottom z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={clsx(
                'flex flex-col items-center justify-center w-full h-full',
                'transition-colors duration-200',
                isActive ? 'text-primary-500' : 'text-gray-400'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
