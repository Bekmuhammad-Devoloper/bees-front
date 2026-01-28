import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useThemeStore } from '../../store/themeStore';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { theme, getBackgroundImage } = useThemeStore();
  
  // Sahifalar ro'yxati - bu sahifalarda global Header ko'rsatiladi
  const showGlobalHeader = location.pathname === '/' || location.pathname === '/profile';

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const backgroundUrl = getBackgroundImage();
  
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url('${backgroundUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {showGlobalHeader && <Header />}
      <main className="flex-1 pb-20">
        {children || <Outlet />}
      </main>
      <BottomNav />
    </div>
  );
};
