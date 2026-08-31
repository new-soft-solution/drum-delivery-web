import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SessionState } from "@/types/session.type";
import { cookieStorage, SESSION_COOKIE_NAME } from "@/lib/cookie-storage";

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,
      error: null,
      setSession: (session) => set({ session, error: null }),
      updateUser: (user) =>
        set((state) =>
          state.session ? { session: { ...state.session, user: { ...state.session.user, ...user } } } : state,
        ),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearSession: () => set({ session: null, isLoading: false, error: null }),
    }),
    {
      name: SESSION_COOKIE_NAME,
      storage: cookieStorage,
      partialize: (state) => ({ session: state.session }),
    },
  ),
);
