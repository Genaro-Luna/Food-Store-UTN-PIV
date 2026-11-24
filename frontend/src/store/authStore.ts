import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { requestLogin, requestLogout, requestMe } from '@/features/auth/api/auth.api';
import { handleApiError } from '@/shared/api/handleApiError';
import { queryClient } from '@/shared/api/queryClient';
import type { Usuario } from '@/features/usuarios/types/usuario.types';

interface AuthState {
    usuario: Usuario | null;
    /** true mientras checkSession confirma la sesión con GET /auth/me. */
    cargando: boolean;
    /** Último error de login, mostrado en el formulario. */
    error: string | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    clearSession: () => void;
    clearError: () => void;
}

/**
 * Sesión del cliente. El token vive solo en la cookie HttpOnly: acá se guarda
 * el usuario, y persist (con partialize) lo conserva al recargar sin tocar el token.
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            usuario: null,
            cargando: true,
            error: null,

            login: async (username, password) => {
                set({ error: null });
                try {
                    await requestLogin(username, password);
                    const usuario = await requestMe();
                    if (!usuario) {
                        set({ error: 'No se pudo confirmar la sesión. Intentá de nuevo.' });
                        return false;
                    }
                    set({ usuario });
                    return true;
                } catch (error) {
                    // 401 credenciales incorrectas, 400 cuenta desactivada
                    set({ error: handleApiError(error) });
                    return false;
                }
            },

            logout: async () => {
                try {
                    await requestLogout();
                } catch {
                    // Aunque falle la llamada, la sesión local se cierra igual.
                }
                get().clearSession();
            },

            checkSession: async () => {
                set({ cargando: true });
                const usuario = await requestMe();
                set({ usuario, cargando: false });
            },

            clearSession: () => {
                set({ usuario: null, error: null });
                // Los datos cacheados (pedidos, usuarios...) eran del usuario anterior.
                queryClient.clear();
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'foodstore-auth',
            partialize: (state) => ({ usuario: state.usuario }),
        }
    )
);
