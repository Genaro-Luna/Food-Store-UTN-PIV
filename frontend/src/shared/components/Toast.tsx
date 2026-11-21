import React, { useEffect } from 'react';
import { useNotificationStore, type NotificationType } from '@/store/notificationStore';

const styles: Record<NotificationType, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
};

const icons: Record<NotificationType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
};

const DURACION_MS = 3000;

export const Toast: React.FC = () => {
    const message = useNotificationStore((s) => s.message);
    const type = useNotificationStore((s) => s.type);
    const visible = useNotificationStore((s) => s.visible);
    const id = useNotificationStore((s) => s.id);
    const hideNotification = useNotificationStore((s) => s.hideNotification);

    useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(hideNotification, DURACION_MS);
        return () => clearTimeout(timer); // si llega otra notificación antes, se cancela este timer
    }, [visible, id, hideNotification]);

    if (!visible) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${styles[type]}`}
        >
            <span aria-hidden="true">{icons[type]}</span>
            <span>{message}</span>
            <button
                type="button"
                onClick={hideNotification}
                aria-label="Cerrar notificación"
                className="ml-2 opacity-70 hover:opacity-100"
            >
                ✕
            </button>
        </div>
    );
};