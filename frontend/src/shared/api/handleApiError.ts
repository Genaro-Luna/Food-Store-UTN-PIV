import axios from 'axios';

interface ErrorDeValidacion {
    loc?: (string | number)[];
    msg?: string;
}

/** Convierte el detail de la API (texto o lista de errores de FastAPI) en un mensaje. */
export function handleApiError(error: unknown): string {
    if (!axios.isAxiosError(error)) {
        return error instanceof Error ? error.message : 'Error inesperado.';
    }
    if (error.code === 'ECONNABORTED') {
        return 'El servidor tardó demasiado en responder.';
    }
    if (!error.response) {
        return 'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.';
    }

    const { status, data } = error.response;
    const detail = (data as { detail?: unknown } | undefined)?.detail;

    if (typeof detail === 'string') {
        return detail;
    }
    // 422 de FastAPI: detail es una lista con el campo (loc) y el motivo (msg).
    if (Array.isArray(detail) && detail.length > 0) {
        const primero = detail[0] as ErrorDeValidacion;
        const campo = primero.loc?.at(-1);
        const motivo = primero.msg ?? 'valor inválido';
        return campo !== undefined ? `Dato inválido en "${String(campo)}": ${motivo}` : motivo;
    }

    switch (status) {
        case 401:
            return 'La sesión venció. Es necesario iniciar sesión de nuevo.';
        case 403:
            return 'No tenés permisos para realizar esta acción.';
        default:
            return status < 500
                ? 'No se pudo completar la operación.'
                : 'Error interno del servidor. Intentá de nuevo más tarde.';
    }
}

/** 403 de la API: ya lo notifica el interceptor, las mutaciones no lo repiten. */
export const isForbiddenError = (error: unknown): boolean =>
    axios.isAxiosError(error) && error.response?.status === 403;

/** 400 «Cuenta de usuario desactivada»: el admin desactivó la cuenta con la sesión abierta. */
export const esCuentaDesactivada = (error: unknown): boolean =>
    axios.isAxiosError(error) &&
    error.response?.status === 400 &&
    (error.response.data as { detail?: unknown } | undefined)?.detail ===
        'Cuenta de usuario desactivada';
