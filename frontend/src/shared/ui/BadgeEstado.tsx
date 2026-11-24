import React from 'react';
import { ESTADOS } from '@/features/pedidos/constants';
import type { EstadoPedido } from '@/features/pedidos/types/pedido.types';

const COLORES: Record<EstadoPedido, string> = {
    PENDIENTE: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    EN_PREPARACION: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
    ENTREGADO: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    CANCELADO: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
};

/** Colorea los cuatro estados del pedido. */
export const BadgeEstado: React.FC<{ estado: EstadoPedido }> = ({ estado }) => (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${COLORES[estado]}`}>
        {ESTADOS[estado]}
    </span>
);
