import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/store/notificationStore';
import { useNotifyError } from '@/shared/hooks/useNotifyError';
import {
    getIngredientes,
    createIngrediente,
    updateIngrediente,
    deleteIngrediente,
} from '../api/ingredients.api';
import type { Ingrediente } from '../types/ingrediente.types';

const QUERY_KEY = ['ingredientes'];

/** CRUD de ingredientes: listado (useQuery) y alta, edición y baja (useMutation). */
export const useIngredients = () => {
    const queryClient = useQueryClient();
    const showNotification = useNotificationStore((s) => s.showNotification);
    const notifyError = useNotifyError();

    const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

    const query = useQuery<Ingrediente[]>({
        queryKey: QUERY_KEY,
        queryFn: getIngredientes,
    });

    const createMutation = useMutation({
        mutationFn: createIngrediente,
        onSuccess: () => {
            invalidate();
            showNotification('Ingrediente creado correctamente');
        },
        onError: notifyError,
    });

    const updateMutation = useMutation({
        mutationFn: updateIngrediente,
        onSuccess: () => {
            invalidate();
            showNotification('Ingrediente actualizado correctamente');
        },
        onError: notifyError,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteIngrediente,
        onSuccess: () => {
            invalidate();
            showNotification('Ingrediente eliminado correctamente');
        },
        onError: notifyError,
    });

    return {
        ingredientes: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        crear: createMutation.mutateAsync,
        actualizar: updateMutation.mutateAsync,
        eliminar: deleteMutation.mutate,
    };
};
