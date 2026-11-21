import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationState {
    message: string;
    type: NotificationType;
    visible: boolean;
    id: number;
    showNotification: (message: string, type?: NotificationType) => void;
    hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
    message: '',
    type: 'info',
    visible: false,
    id: 0,

    showNotification: (message, type = 'success') =>
        set((state) => ({ message, type, visible: true, id: state.id + 1 })),

    hideNotification: () => set({ visible: false }),
}));