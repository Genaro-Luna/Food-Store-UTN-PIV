import type { EstadoPedido, FormaPago } from './types/pedido.types';

export const FORMAS_DE_PAGO: Record<FormaPago, string> = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
};

export const ESTADOS: Record<EstadoPedido, string> = {
    PENDIENTE: 'Pendiente',
    EN_PREPARACION: 'En preparación',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
};

/** Misma máquina de estados que TRANSICIONES en el backend (pedidos/service.py). */
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
    PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
    EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
    ENTREGADO: [],
    CANCELADO: [],
};

/** Texto del botón que lleva un pedido a cada estado. */
export const ACCIONES: Record<EstadoPedido, string> = {
    PENDIENTE: 'Pendiente',
    EN_PREPARACION: 'Preparar',
    ENTREGADO: 'Entregar',
    CANCELADO: 'Cancelar',
};
