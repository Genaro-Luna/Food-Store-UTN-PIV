import type { AxiosError } from 'axios';
import { api } from './axiosInstance';
import { esCuentaDesactivada, handleApiError } from './handleApiError';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

// En estas rutas un 401 es esperable (credenciales incorrectas o sesión
// inexistente al iniciar): no se trata como sesión vencida.
const RUTAS_DE_AUTH = ['/auth/token', '/auth/me'];

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const url = error.config?.url ?? '';
        const esDeAuth = RUTAS_DE_AUTH.some((ruta) => url.includes(ruta));
        const status = error.response?.status;
        const notificar = useNotificationStore.getState().showNotification;
        const haySesion = useAuthStore.getState().usuario !== null;

        if (status === 401 && !esDeAuth && haySesion) {
            // Sesión vencida o revocada: ProtectedRoute lleva al login al quedar sin usuario.
            useAuthStore.getState().clearSession();
            notificar('La sesión venció. Iniciá sesión de nuevo.', 'info');
        } else if (esCuentaDesactivada(error) && haySesion) {
            // El admin desactivó la cuenta mientras la sesión estaba abierta.
            useAuthStore.getState().clearSession();
            notificar('Tu cuenta fue desactivada por un administrador.', 'error');
        } else if (status === 403) {
            // Sesión válida pero sin permisos: se avisa sin cerrar la sesión.
            notificar('Acceso denegado: no tenés permisos para esta acción.', 'error');
        }

        error.message = handleApiError(error);
        return Promise.reject(error);
    }
);
