import { create } from 'zustand';
import type { AuthStatus, UsuarioAuth } from '../types/auth.types';
import { requestLogin, requestLogout, requestMe } from '../api/auth.api';

/**
 * Store de sesión. NO usa persist (RA-09): el token vive en la cookie HttpOnly
 * y los datos del usuario se recuperan con GET /auth/me al iniciar la app.
 */
interface AuthState {
    user: UsuarioAuth | null;
    status: AuthStatus;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    clearSession: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    status: 'checking',
    error: null,

    login: async (username, password) => {
        set({ error: null });
        try {
            await requestLogin(username, password);
            const currentUser = await requestMe();
            if (!currentUser) {
                throw new Error('No se pudo recuperar la sesión después del login');
            }
            set({ user: currentUser, status: 'authenticated' });
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'No se pudo iniciar sesión';
            set({ user: null, status: 'unauthenticated', error: msg });
            throw e;
        }
    },

    logout: async () => {
        try {
            await requestLogout();
        } finally {
            set({ user: null, status: 'unauthenticated', error: null });
        }
    },

    checkAuth: async () => {
        set({ status: 'checking' });
        const currentUser = await requestMe(); // devuelve null si no hay cookie válida
        set({
            user: currentUser,
            status: currentUser ? 'authenticated' : 'unauthenticated',
        });
    },

    clearSession: () => set({ user: null, status: 'unauthenticated' }),

    clearError: () => set({ error: null }),
}));
