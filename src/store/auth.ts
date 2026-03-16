"use client";

import { create } from "zustand";
import { authApi, setAccessToken } from "@/lib/api";
import type { User, LoginCredentials, RegisterData } from "@/lib/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(credentials);
      if (res.success) {
        setAccessToken(res.data.accessToken);
        set({ user: res.data.user, isLoading: false });
        return true;
      }
      set({ error: res.error.message, isLoading: false });
      return false;
    } catch {
      set({ error: "Login failed. Please try again.", isLoading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register(data);
      if (res.success) {
        setAccessToken(res.data.accessToken);
        set({ user: res.data.user, isLoading: false });
        return true;
      }
      set({ error: res.error.message, isLoading: false });
      return false;
    } catch {
      set({ error: "Registration failed. Please try again.", isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      set({ user: null });
    }
  },

  initialize: async () => {
    try {
      const refreshed = await authApi.refreshToken();
      if (refreshed) {
        const res = await authApi.getProfile();
        if (res.success) {
          set({ user: res.data, isInitialized: true });
          return;
        }
      }
    } catch {
      // Silent fail on init
    }
    set({ isInitialized: true });
  },

  clearError: () => set({ error: null }),
}));
