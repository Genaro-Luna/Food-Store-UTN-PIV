import { api } from '@/shared/api/axiosInstance';
import type {
    CambioEstado,
    FiltrosPedidos,
    Pedido,
    PedidoCreate,
    PedidosPaginados,
    ResumenPedidos,
} from '../types/pedido.types';

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

/** Solo admin. 400 si la transición no está permitida; a CANCELADO restituye el stock. */
export const cambiarEstadoPedido = async (id: number, data: CambioEstado): Promise<Pedido> => {
    const res = await api.patch<Pedido>(`${BASE}/${id}/estado`, data);
    return res.data;
};

/** Solo admin: conteos por estado, pedidos de hoy e ingresos de los entregados. */
export const getResumenPedidos = async (): Promise<ResumenPedidos> => {
    const res = await api.get<ResumenPedidos>(`${BASE}/resumen`);
    return res.data;
};
