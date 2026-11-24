import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/store/notificationStore';
import { useNotifyError } from '@/shared/hooks/useNotifyError';
import {
    actualizarProducto,
    actualizarStock,
    crearProducto,
    eliminarProducto,
    getProductos,
} from '../api/productos.api';
import type {
    FiltrosProductos,
    ProductoActualizacion,
    ProductoPayload,
    StockPayload,
} from '../types/producto.types';

/** Alta (sin id) con el cuerpo completo o edición (con id) con los campos a cambiar. */
export type GuardarProducto =
    | { id?: undefined; data: ProductoPayload }
    | { id: number; data: ProductoActualizacion };

const PRODUCTOS_KEY = ['productos'] as const;

/**
 * Listado paginado. Cada combinación de filtros es una entrada distinta en la caché;
 * keepPreviousData mantiene la página anterior visible mientras llega la siguiente.
 */
export const useProductos = (filtros: FiltrosProductos) =>
    useQuery({
        queryKey: [...PRODUCTOS_KEY, filtros],
        queryFn: () => getProductos(filtros),
        placeholderData: keepPreviousData,
    });

/** Invalida todas las variantes de ['productos', filtros]. */
const useInvalidarProductos = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: PRODUCTOS_KEY });
};

/** Crear (sin id) o editar (con id). Los errores 404/422 los muestra el formulario. */
export const useGuardarProducto = () => {
    const invalidar = useInvalidarProductos();
    const showNotification = useNotificationStore((s) => s.showNotification);

    return useMutation({
        mutationFn: (v: GuardarProducto) =>
            v.id === undefined ? crearProducto(v.data) : actualizarProducto(v.id, v.data),
        onSuccess: (producto, { id }) => {
            void invalidar();
            showNotification(`Producto "${producto.nombre}" ${id === undefined ? 'creado' : 'actualizado'}`);
        },
    });
};

export const useActualizarStock = () => {
    const invalidar = useInvalidarProductos();
    const showNotification = useNotificationStore((s) => s.showNotification);

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: StockPayload }) => actualizarStock(id, data),
        onSuccess: (producto) => {
            void invalidar();
            showNotification(`Stock de "${producto.nombre}": ${producto.stock} unidades`);
        },
    });
};

export const useEliminarProducto = () => {
    const invalidar = useInvalidarProductos();
    const showNotification = useNotificationStore((s) => s.showNotification);
    const notificarError = useNotifyError();

    return useMutation({
        mutationFn: eliminarProducto,
        onSuccess: () => {
            void invalidar();
            showNotification('Producto eliminado');
        },
        onError: notificarError,
    });
};
