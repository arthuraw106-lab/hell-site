'use client';

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastState = {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  showToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const item: ToastItem = { id, ...toast };

    set((state) => ({
      toasts: [item, ...state.toasts].slice(0, 5),
    }));

    window.setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));
