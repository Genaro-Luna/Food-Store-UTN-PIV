import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
    timeout: 10000,
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        config.headers.set('Accept-Language', 'es');
        return config;
    }
);

export function handleApiError(error: unknown): string {
    if (!axios.isAxiosError(error)) {
        return error instanceof Error ? error.message : 'Error inesperado.';
    }
    if (error.code === 'ECONNABORTED') {
        return 'El servidor tardó demasiado en responder.';
    }
    if (!error.response) {
        return 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.';
    }

    const { status, data } = error.response;
    const detail = (data as { detail?: unknown })?.detail;

    if (typeof detail === 'string') {
        return detail;
    }

    switch (status) {
        case 401:
            return 'La sesión venció. Es necesario iniciar sesión de nuevo.';
        case 403:
            return 'No tiene permisos para realizar esta acción.';
        case 422:
            return 'Los datos enviados no son válidos. Revisa los campos del formulario.';
        default:
            return status < 500
                ? 'No se pudo completar la operación.'
                : 'Error interno del servidor. Intente nuevamente más tarde.';
    }
}

const RUTAS_DE_AUTH = ['/auth/token', '/auth/me'];

axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const url = error.config?.url ?? '';
        const esDeAuth = RUTAS_DE_AUTH.some((r) => url.includes(r));

        if (error.response?.status === 401 && !esDeAuth) {
            useAuthStore.setState({ user: null });
        }

        error.message = handleApiError(error);
        return Promise.reject(error);
    }
);