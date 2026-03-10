import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Video {
  id: string;
  title: string;
  status: 'processing' | 'completed' | 'failed' | 'pending';
  progress: number;
  thumbnail_url?: string;
  video_url?: string;
  duration?: number;
  created_at: string;
  error?: string | null;
}

interface AppState {
  isAuthenticated: boolean;
  apiKey: string | null;
  videos: Video[];
  balance: { credits: number; type: string } | null;
  login: (token: string) => void;
  logout: () => void;
  setApiKey: (key: string) => void;
  setBalance: (balance: { credits: number; type: string }) => void;
  addVideo: (video: Video) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  removeVideo: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      apiKey: null,
      videos: [],
      balance: null,
      login: (token) => {
        if (token === 'authenticated_admin_2024') {
          set({ isAuthenticated: true });
        }
      },
      logout: () => set({ isAuthenticated: false, apiKey: null, videos: [], balance: null }),
      setApiKey: (key) => set({ apiKey: key }),
      setBalance: (balance) => set({ balance }),
      addVideo: (video) => set((state) => ({ videos: [video, ...state.videos] })),
      updateVideo: (id, updates) =>
        set((state) => ({
          videos: state.videos.map((v) => (v.id === id ? { ...v, ...updates } : v)),
        })),
      removeVideo: (id) =>
        set((state) => ({
          videos: state.videos.filter((v) => v.id !== id),
        })),
    }),
    {
      name: 'hg-studio-storage',
    }
  )
);
