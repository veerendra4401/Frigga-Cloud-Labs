import { create } from 'zustand';

interface AuthState {
  user: any;
  token: string | null;
  isLoading: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
  restore: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isLoading: false });
  },
  restore: async () => {
    const token = localStorage.getItem('token');
    set({ isLoading: true });
    if (token) {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          set({ token, user: data.data.user, isLoading: false });
        } else {
          // Token invalid or expired
          localStorage.removeItem('token');
          set({ user: null, token: null, isLoading: false });
        }
      } catch {
        set({ user: null, token: null, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));