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
