import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { requestRegister } from '../api/auth.api';

/**
 * Punto de entrada de la sesión para los componentes:
 * lectura del store, login, logout y registro.
 */
export const useAuth = () => {
    const queryClient = useQueryClient();

    const user = useAuthStore((s) => s.user);
    const status = useAuthStore((s) => s.status);
    const error = useAuthStore((s) => s.error);
    const login = useAuthStore((s) => s.login);
    const logoutStore = useAuthStore((s) => s.logout);
    const clearError = useAuthStore((s) => s.clearError);

    const registerMutation = useMutation({ mutationFn: requestRegister });

    const logout = async () => {
        await logoutStore();
        queryClient.clear(); // no deja datos en caché de la sesión saliente
    };

    return {
        user,
        status,
        isAuthenticated: status === 'authenticated',
        isAdmin: user?.role === 'admin',
        error,
        clearError,
        login,
        logout,
        register: registerMutation.mutateAsync,
    };
};
