import { useCallback } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { isForbiddenError } from '@/shared/api/handleApiError';

/**
 * Devuelve un callback para el onError de las mutaciones: muestra el error
 * en un toast, salvo los 403, que ya notifica setupInterceptors.ts.
 */
export const useNotifyError = () => {
    const showNotification = useNotificationStore((s) => s.showNotification);

    return useCallback(
        (err: Error) => {
            if (!isForbiddenError(err)) showNotification(err.message, 'error');
        },
        [showNotification]
    );
};
