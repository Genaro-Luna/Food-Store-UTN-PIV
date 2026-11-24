export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO';
export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA';

/** Espeja ItemPedidoCreate: el precio lo pone el servidor, no el cliente. */
export interface ItemPedidoCreate {
    producto_id: number;
    cantidad: number;
}

/** Cuerpo de POST /pedidos (PedidoCreate). */
export interface PedidoCreate {
    items: ItemPedidoCreate[];
    forma_pago: FormaPago;
    direccion_entrega: string;
    notas: string | null;
}

/** Espeja DetallePedidoRead: nombre y precio copiados al confirmar el pedido. */
export interface DetallePedido {
    producto_id: number;
    nombre_producto: string;
    precio_unitario: number;
    cantidad: number;
    subtotal: number;
}

/** Espeja PedidoRead. */
export interface Pedido {
    id: number;
    usuario_id: number;
    estado: EstadoPedido;
    forma_pago: FormaPago;
    direccion_entrega: string;
    notas: string | null;
    total: number;
    created_at: string;
    updated_at: string;
    items: DetallePedido[];
}

export interface PedidosPaginados {
    total: number;
    items: Pedido[];
}

/** Query params de GET /pedidos. */
export interface FiltrosPedidos {
    skip?: number;
    limit?: number;
    estado?: EstadoPedido;
}

/** Cuerpo de PATCH /pedidos/{id}/estado (CambioEstado). */
export interface CambioEstado {
    estado: EstadoPedido;
}

/** Espeja ResumenPedidos: indicadores del panel de administración. */
export interface ResumenPedidos {
    pendientes: number;
    en_preparacion: number;
    entregados: number;
    cancelados: number;
    pedidos_hoy: number;
    ingresos_entregados: number;
}
