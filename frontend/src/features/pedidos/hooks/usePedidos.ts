import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/store/notificationStore';
import { useNotifyError } from '@/shared/hooks/useNotifyError';
import { ESTADOS } from '../constants';
import {
    cambiarEstadoPedido,
    cancelarPedido,
    crearPedido,
    getPedidos,
    getResumenPedidos,
} from '../api/pedidos.api';
import type { EstadoPedido, FiltrosPedidos } from '../types/pedido.types';

export const PEDIDOS_KEY = ['pedidos'] as const;

/** Pedidos paginados en el servidor: propios para un usuario, todos para el admin. */
export const usePedidos = (filtros: FiltrosPedidos) =>
    useQuery({
        queryKey: [...PEDIDOS_KEY, filtros],
        queryFn: () => getPedidos(filtros),
        placeholderData: keepPreviousData,
    });

/** Indicadores del panel. Comparte el prefijo ['pedidos']: se refresca con cada cambio. */
export const useResumenPedidos = () =>
    useQuery({
        queryKey: [...PEDIDOS_KEY, 'resumen'],
        queryFn: getResumenPedidos,
    });

/** Los pedidos mueven stock: se invalidan pedidos y productos. */
const useInvalidarPedidosYStock = () => {
    const queryClient = useQueryClient();
    return () =>
        Promise.all([
            queryClient.invalidateQueries({ queryKey: PEDIDOS_KEY }),
            queryClient.invalidateQueries({ queryKey: ['productos'] }),
        ]);
};

/** POST /pedidos. El error (sin stock, no disponible...) lo muestra el checkout. */
export const useCrearPedido = () => {
    const invalidar = useInvalidarPedidosYStock();
    return useMutation({
        mutationFn: crearPedido,
        onSuccess: () => void invalidar(),
    });
};

export const useCancelarPedido = () => {
    const invalidar = useInvalidarPedidosYStock();
    const showNotification = useNotificationStore((s) => s.showNotification);
    const notificarError = useNotifyError();

    return useMutation({
        mutationFn: cancelarPedido,
        onSuccess: (pedido) => {
            void invalidar();
            showNotification(`Pedido #${pedido.id} cancelado. El stock fue restituido.`);
        },
        onError: notificarError,
    });
};

/** Avanzar o cancelar un pedido desde el panel (solo admin). */
export const useCambiarEstadoPedido = () => {
    const invalidar = useInvalidarPedidosYStock();
    const showNotification = useNotificationStore((s) => s.showNotification);
    const notificarError = useNotifyError();

    return useMutation({
        mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, { estado }),
        onSuccess: (pedido) => {
            void invalidar();
            showNotification(`Pedido #${pedido.id}: ${ESTADOS[pedido.estado]}`);
        },
        onError: notificarError,
    });
};
