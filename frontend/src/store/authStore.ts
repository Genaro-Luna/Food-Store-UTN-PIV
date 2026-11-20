import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UsuarioAuth } from '../types/auth.types';
import { requestLogin, requestLogout, requestMe } from '../api/auth.actions';

interface AuthState {
    user: UsuarioAuth | null;
    isChecking: boolean;
    isSubmitting: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    checkSession: () => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isChecking: true,
            isSubmitting: false,
            error: null,

            login: async (username, password) => {
                set({ isSubmitting: true, error: null });
                try {
                    await requestLogin(username, password);
                    const currentUser = await requestMe();
                    set({ user: currentUser, error: null });
                } catch (e) {
                    const msg =
                        e instanceof Error
                            ? e.message
                            : 'No se pudo iniciar sesión';
                    set({ user: null, error: msg });
                    throw e;
                } finally {
                    set({ isSubmitting: false });
                }
            },

            checkSession: async () => {
                set({ isChecking: true });
                try {
                    const currentUser = await requestMe();
                    set({ user: currentUser });
                } catch {
                    set({ user: null });
                } finally {
                    set({ isChecking: false });
                }
            },

            logout: async () => {
                try {
                    await requestLogout();
                } finally {
                    set({ user: null, error: null });
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({ user: state.user }),
        }
    )
);