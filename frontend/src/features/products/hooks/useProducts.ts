import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/store/notificationStore';
import { useNotifyError } from '@/shared/hooks/useNotifyError';
import {
    getProductos,
    createProducto,
    updateProducto,
    deleteProducto,
} from '../api/products.api';
import type { Producto } from '../types/producto.types';

const QUERY_KEY = ['productos'];

/** CRUD de productos: listado (useQuery) y alta, edición y baja (useMutation). */
export const useProducts = () => {
    const queryClient = useQueryClient();
    const showNotification = useNotificationStore((s) => s.showNotification);
    const notifyError = useNotifyError();

    const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

    const query = useQuery<Producto[]>({
        queryKey: QUERY_KEY,
        queryFn: getProductos,
    });

    const createMutation = useMutation({
        mutationFn: createProducto,
        onSuccess: () => {
            invalidate();
            showNotification('Producto creado correctamente');
        },
        onError: notifyError,
    });

    const updateMutation = useMutation({
        mutationFn: updateProducto,
        onSuccess: () => {
            invalidate();
            showNotification('Producto actualizado correctamente');
        },
        onError: notifyError,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProducto,
        onSuccess: () => {
            invalidate();
            showNotification('Producto eliminado correctamente');
        },
        onError: notifyError,
    });

    return {
        productos: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        crear: createMutation.mutateAsync,
        actualizar: updateMutation.mutateAsync,
        eliminar: deleteMutation.mutate,
    };
};
