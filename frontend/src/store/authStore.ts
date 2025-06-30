import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
}

type AuthStore = AuthState & AuthActions & { isAuthenticated: boolean };

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,

      // Actions
      login: (user: User, token: string) =>
        set({
          user,
          token,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isLoading: false,
        }),

      setLoading: (loading: boolean) =>
        set({
          isLoading: loading,
        }),

      updateUser: (user: User) =>
        set((state) => ({
          user: { ...state.user, ...user },
        })),

      get isAuthenticated() {
        return !!get().token;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: (state) => {
        return () => {
          state && state.setLoading && state.setLoading(false);
        };
      },
    }
  )
); 