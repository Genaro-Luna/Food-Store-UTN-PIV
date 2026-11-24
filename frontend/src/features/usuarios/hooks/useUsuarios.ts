import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/store/notificationStore';
import { useNotifyError } from '@/shared/hooks/useNotifyError';
import { activarUsuario, desactivarUsuario, getUsuarios } from '../api/usuarios.api';

const USUARIOS_KEY = ['usuarios'] as const;

/** Listado de usuarios del panel de administración. */
export const useUsuarios = () =>
    useQuery({
        queryKey: USUARIOS_KEY,
        queryFn: getUsuarios,
    });

/** Activar o desactivar una cuenta; invalida el listado al terminar. */
export const useCambiarEstadoUsuario = () => {
    const queryClient = useQueryClient();
    const showNotification = useNotificationStore((s) => s.showNotification);
    const notificarError = useNotifyError();

    return useMutation({
        mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
            activar ? activarUsuario(id) : desactivarUsuario(id),
        onSuccess: (usuario) => {
            void queryClient.invalidateQueries({ queryKey: USUARIOS_KEY });
            showNotification(
                `Usuario "${usuario.username}" ${usuario.disabled ? 'desactivado' : 'activado'}`
            );
        },
        onError: notificarError,
    });
};
