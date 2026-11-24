import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/store/notificationStore';
import { useNotifyError } from '@/shared/hooks/useNotifyError';
import {
    actualizarCategoria,
    crearCategoria,
    eliminarCategoria,
    getCategorias,
} from '../api/categorias.api';
import type { CategoriaPayload } from '../types/categoria.types';

const CATEGORIAS_KEY = ['categorias'] as const;

/** Categorías activas: panel de administración, select de productos y filtro del catálogo. */
export const useCategorias = () =>
    useQuery({
        queryKey: CATEGORIAS_KEY,
        queryFn: getCategorias,
        staleTime: 60_000,
    });

/** Crear (sin id) o editar (con id). Los errores 409/422 los muestra el formulario. */
export const useGuardarCategoria = () => {
    const queryClient = useQueryClient();
    const showNotification = useNotificationStore((s) => s.showNotification);

    return useMutation({
        mutationFn: ({ id, data }: { id?: number; data: CategoriaPayload }) =>
            id === undefined ? crearCategoria(data) : actualizarCategoria(id, data),
        onSuccess: (categoria, { id }) => {
            void queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY });
            // Los productos traen la categoría embebida
            void queryClient.invalidateQueries({ queryKey: ['productos'] });
            showNotification(`Categoría "${categoria.nombre}" ${id === undefined ? 'creada' : 'actualizada'}`);
        },
    });
};

export const useEliminarCategoria = () => {
    const queryClient = useQueryClient();
    const showNotification = useNotificationStore((s) => s.showNotification);
    const notificarError = useNotifyError();

    return useMutation({
        mutationFn: eliminarCategoria,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY });
            showNotification('Categoría eliminada');
        },
        onError: notificarError,
    });
};
