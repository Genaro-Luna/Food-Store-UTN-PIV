import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/store/notificationStore';
import { isForbiddenError } from '@/shared/api/api';
import { getAdminUsers, activateUser, deactivateUser } from '../api/auth.api';
import type { UsuarioAuth } from '../types/auth.types';

const QUERY_KEY = ['admin-usuarios'];

/** Listado de usuarios y activación/desactivación (solo admin). */
export const useAdminUsers = () => {
    const queryClient = useQueryClient();
    const showNotification = useNotificationStore((s) => s.showNotification);

    const query = useQuery<UsuarioAuth[]>({
        queryKey: QUERY_KEY,
        queryFn: getAdminUsers,
    });

    const onError = (err: Error) => {
        if (!isForbiddenError(err)) showNotification(err.message, 'error');
    };

    const activateMutation = useMutation({
        mutationFn: activateUser,
        onSuccess: (usuario) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            showNotification(`Usuario "${usuario.username}" activado`);
        },
        onError,
    });

    const deactivateMutation = useMutation({
        mutationFn: deactivateUser,
        onSuccess: (usuario) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            showNotification(`Usuario "${usuario.username}" desactivado`);
        },
        onError,
    });

    return {
        usuarios: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        activar: activateMutation.mutate,
        desactivar: deactivateMutation.mutate,
        isUpdating: activateMutation.isPending || deactivateMutation.isPending,
    };
};
