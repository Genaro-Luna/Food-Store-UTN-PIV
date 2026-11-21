import type { AxiosError } from 'axios';
import { api, handleApiError } from './api';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

// En estas rutas un 401 es una respuesta esperada (credenciales incorrectas
// o sesión inexistente al iniciar), así que no se trata como sesión vencida.
const RUTAS_DE_AUTH = ['/auth/token', '/auth/me'];

api.interceptors.request.use((config) => {
    config.headers.set('Accept-Language', 'es');
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const url = error.config?.url ?? '';
        const esDeAuth = RUTAS_DE_AUTH.some((ruta) => url.includes(ruta));
        const status = error.response?.status;

        if (status === 401 && !esDeAuth) {
            // Sesión vencida o revocada: se limpia el store y ProtectedRoute lleva al login
            useAuthStore.setState({ user: null });
            useNotificationStore
                .getState()
                .showNotification('La sesión venció. Iniciá sesión de nuevo.', 'info');
        }

        if (status === 403) {
            // Sesión válida pero sin permisos: se avisa sin cerrar la sesión ni redirigir
            useNotificationStore
                .getState()
                .showNotification('Acceso denegado: no tenés permisos para esta acción.', 'error');
        }

        error.message = handleApiError(error);
        return Promise.reject(error);
    }
);