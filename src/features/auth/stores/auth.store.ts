import { create } from 'zustand';

import type { User } from '../models';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: AuthStatus;

  setUser: (user: User) => void;
  setStatus: (status: AuthStatus) => void;

  authenticate: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',

  setUser: (user) => {
    set({ user });
  },

  setStatus: (status) => {
    set({ status });
  },

  authenticate: (user) => {
    set({
      user,
      status: 'authenticated',
    });
  },

  logout: () => {
    set({
      user: null,
      status: 'unauthenticated',
    });
  },
}));
