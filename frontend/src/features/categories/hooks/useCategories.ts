import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/store/notificationStore';
import { useNotifyError } from '@/shared/hooks/useNotifyError';
import {
    getCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
} from '../api/categories.api';
import type { Categoria } from '../types/categoria.types';

const QUERY_KEY = ['categorias'];

/** CRUD de categorías: listado (useQuery) y alta, edición y baja (useMutation). */
export const useCategories = () => {
    const queryClient = useQueryClient();
    const showNotification = useNotificationStore((s) => s.showNotification);
    const notifyError = useNotifyError();

    const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

    const query = useQuery<Categoria[]>({
        queryKey: QUERY_KEY,
        queryFn: getCategorias,
    });

    const createMutation = useMutation({
        mutationFn: createCategoria,
        onSuccess: () => {
            invalidate();
            showNotification('Categoría creada correctamente');
        },
        onError: notifyError,
    });

    const updateMutation = useMutation({
        mutationFn: updateCategoria,
        onSuccess: () => {
            invalidate();
            showNotification('Categoría actualizada correctamente');
        },
        onError: notifyError,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategoria,
        onSuccess: () => {
            invalidate();
            showNotification('Categoría eliminada correctamente');
        },
        onError: notifyError,
    });

    return {
        categorias: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        crear: createMutation.mutateAsync,
        actualizar: updateMutation.mutateAsync,
        eliminar: deleteMutation.mutate,
    };
};
