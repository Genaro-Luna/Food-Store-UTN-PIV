import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { requestRegister } from '../api/auth.api';

/** Acceso de los componentes a la sesión del authStore. */
export const useAuth = () => {
    const usuario = useAuthStore((s) => s.usuario);
    const cargando = useAuthStore((s) => s.cargando);
    const error = useAuthStore((s) => s.error);
    const login = useAuthStore((s) => s.login);
    const logout = useAuthStore((s) => s.logout);
    const clearError = useAuthStore((s) => s.clearError);

    return {
        usuario,
        cargando,
        error,
        esAdmin: usuario?.role === 'admin',
        login,
        logout,
        clearError,
    };
};

/** POST /auth/register (409 si el username o el email ya existen). */
export const useRegistro = () => useMutation({ mutationFn: requestRegister });
