'use client';

import { create } from 'zustand';
import type { User } from '@/lib/types';

type AuthState = {
  user?: User | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  hydrated: boolean;
  setAuth: (payload: { user: User; accessToken: string; refreshToken: string }) => void;
  setUser: (user?: User | null) => void;
  hydrate: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,

  setAuth: ({ user, accessToken, refreshToken }) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    set({
      user,
      accessToken,
      refreshToken,
      hydrated: true,
    });
  },

  setUser: (user) => {
    set({ user });
  },

  hydrate: () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    set({
      accessToken,
      refreshToken,
      hydrated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      hydrated: true,
    });
  },
}));
