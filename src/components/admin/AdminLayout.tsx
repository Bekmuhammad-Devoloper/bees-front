import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './Sidebar';
import { AdminHeader } from './AdminHeader';
import { useThemeStore } from '../../store/themeStore';

export const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-black text-black dark:text-white">
      {/* Fixed Sidebar - scroll bo'lmaydi */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Fixed Header - scroll bo'lmaydi */}
      <AdminHeader sidebarCollapsed={sidebarCollapsed} />
      
      {/* Main Content Area - faqat bu scroll bo'ladi */}
      <main
        className={`fixed top-16 bottom-0 right-0 overflow-y-auto transition-all duration-300 bg-white dark:bg-black ${
          sidebarCollapsed ? 'left-16' : 'left-64'
        }`}
      >
        {/* Content */}
        <div className="min-h-full">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
