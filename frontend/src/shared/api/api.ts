import axios from 'axios';

/**
 * Instancia única de Axios para toda la aplicación.
 * No importa ningún store: los interceptores que dependen del estado
 * global viven en setupInterceptors.ts (evita dependencias circulares).
 */
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
    timeout: 10000,
    withCredentials: true, // envía y recibe la cookie HttpOnly access_token
});

/** Traduce cualquier error de Axios a un mensaje legible para la interfaz. */
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

/** Indica si un error es un 403 de la API (ya notificado por el interceptor). */
export const isForbiddenError = (error: unknown): boolean =>
    axios.isAxiosError(error) && error.response?.status === 403;