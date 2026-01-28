import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mavjud fon rasmlari
export const BACKGROUND_IMAGES = [
  { id: 'yorug', name: 'Yorqin', url: '/yorug.png' },
  { id: 'qorangi', name: "Qorong'i", url: '/qorangi.png' },
  { id: 'tizimli', name: 'Tizim', url: '/tizimli.png' },
  { id: 'default', name: 'Oddiy', url: '' },
];

interface BackgroundState {
  backgroundId: string;
  customBackgroundUrl: string;
  setBackground: (id: string) => void;
  setCustomBackground: (url: string) => void;
  getBackgroundUrl: () => string;
}

export const useBackgroundStore = create<BackgroundState>()(
  persist(
    (set, get) => ({
      backgroundId: 'qorangi', // Default background
      customBackgroundUrl: '',
      
      setBackground: (id: string) => {
        set({ backgroundId: id, customBackgroundUrl: '' });
      },
      
      setCustomBackground: (url: string) => {
        set({ backgroundId: 'custom', customBackgroundUrl: url });
      },
      
      getBackgroundUrl: () => {
        const { backgroundId, customBackgroundUrl } = get();
        if (backgroundId === 'custom') {
          return customBackgroundUrl;
        }
        const bg = BACKGROUND_IMAGES.find(b => b.id === backgroundId);
        return bg?.url || '';
      },
    }),
    {
      name: 'bees-background-storage',
    }
  )
);
