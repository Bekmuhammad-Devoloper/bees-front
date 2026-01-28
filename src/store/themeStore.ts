import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { settingsService } from '../services/settingsService';

type Theme = 'light' | 'dark' | 'system';

// Har bir tema uchun mos fon rasmi
const THEME_BACKGROUNDS: Record<Theme, string> = {
  light: '/yorug.png',
  dark: '/qorangi.png',
  system: '/tizimli.png',
};

interface ThemeState {
  theme: Theme;
  isLoading: boolean;
  setTheme: (theme: Theme) => void;
  setThemeAdmin: (theme: Theme) => Promise<void>;
  fetchThemeFromServer: () => Promise<void>;
  getBackgroundImage: () => string;
  syncFromStorage: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      isLoading: false,
      
      // Lokal tema o'zgartirish
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      
      // Admin uchun - tema o'zgartirish (barcha userlar uchun) - backendga saqlaydi
      setThemeAdmin: async (theme) => {
        set({ isLoading: true });
        try {
          await settingsService.setTheme(theme);
          set({ theme, isLoading: false });
          applyTheme(theme);
        } catch (error) {
          console.error('Failed to save theme:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      // Serverdan mavzuni olish
      fetchThemeFromServer: async () => {
        set({ isLoading: true });
        try {
          const serverTheme = await settingsService.getTheme();
          const validTheme = ['light', 'dark', 'system'].includes(serverTheme) 
            ? serverTheme as Theme 
            : 'dark';
          set({ theme: validTheme, isLoading: false });
          applyTheme(validTheme);
        } catch (error) {
          console.error('Failed to fetch theme from server:', error);
          set({ isLoading: false });
          // Xato bo'lsa, lokal temani ishlatamiz
        }
      },
      
      // Joriy tema uchun fon rasmini olish
      getBackgroundImage: () => {
        const { theme } = get();
        return THEME_BACKGROUNDS[theme] || THEME_BACKGROUNDS.dark;
      },

      // LocalStorage'dan sinxronlash
      syncFromStorage: () => {
        const saved = localStorage.getItem('bees-theme-storage');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const newTheme = parsed.state?.theme || 'dark';
            set({ theme: newTheme });
            applyTheme(newTheme);
          } catch {
            // ignore
          }
        }
      },
    }),
    {
      name: 'bees-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyTheme(state.theme);
        }
      },
    }
  )
);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

// Initialize theme immediately
const savedTheme = localStorage.getItem('bees-theme-storage');
if (savedTheme) {
  try {
    const parsed = JSON.parse(savedTheme);
    applyTheme(parsed.state?.theme || 'dark');
  } catch {
    applyTheme('dark');
  }
} else {
  applyTheme('dark');
}

// Boshqa tab'larda localStorage o'zgarganda sinxronlash
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'bees-theme-storage' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        const newTheme = parsed.state?.theme || 'dark';
        useThemeStore.setState({ theme: newTheme });
        applyTheme(newTheme);
      } catch {
        // ignore
      }
    }
  });
}
