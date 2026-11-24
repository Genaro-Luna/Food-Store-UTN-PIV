import { api } from '@/shared/api/axiosInstance';
import type { FiltrosPedidos, Pedido, PedidoCreate, PedidosPaginados } from '../types/pedido.types';

const BASE = '/pedidos';

/** 400 sin stock / no disponible / producto repetido; 404 producto inexistente. */
export const crearPedido = async (data: PedidoCreate): Promise<Pedido> => {
    const res = await api.post<Pedido>(BASE, data);
    return res.data;
};

/** El usuario recibe solo sus pedidos; el admin, todos. */
export const getPedidos = async (filtros: FiltrosPedidos): Promise<PedidosPaginados> => {
    const res = await api.get<PedidosPaginados>(BASE, { params: filtros });
    return res.data;
};

/** Solo el dueño y solo en PENDIENTE: el stock vuelve en la misma transacción. */
export const cancelarPedido = async (id: number): Promise<Pedido> => {
    const res = await api.patch<Pedido>(`${BASE}/${id}/cancelar`);
    return res.data;
};
