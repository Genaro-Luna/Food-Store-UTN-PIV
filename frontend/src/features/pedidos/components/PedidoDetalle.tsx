import React, { useState } from 'react';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { Card } from '@/shared/ui/Card';
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato';
import { FORMAS_DE_PAGO } from '../constants';
import type { Pedido } from '../types/pedido.types';

interface PedidoDetalleProps {
    pedido: Pedido;
    /** Botones según quién mira: cancelar (cliente) o avanzar estado (admin). */
    acciones?: React.ReactNode;
    /** Dato extra de la cabecera, por ejemplo el usuario en el panel admin. */
    subtitulo?: string;
    /** Muestra el detalle desplegado desde el inicio (modal del panel). */
    abiertoInicial?: boolean;
}

/** Cabecera del pedido con su detalle desplegable (líneas, entrega y pago). */
export const PedidoDetalle: React.FC<PedidoDetalleProps> = ({ pedido, acciones, subtitulo, abiertoInicial = false }) => {
    const [abierto, setAbierto] = useState(abiertoInicial);
    const unidades = pedido.items.reduce((suma, i) => suma + i.cantidad, 0);

    return (
        <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">Pedido #{pedido.id}</h3>
                        <BadgeEstado estado={pedido.estado} />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formatearFecha(pedido.created_at)} · {unidades} {unidades === 1 ? 'unidad' : 'unidades'}
                        {subtitulo && ` · ${subtitulo}`}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatearPrecio(pedido.total)}
                    </span>
                    <button
                        type="button"
                        aria-expanded={abierto}
                        onClick={() => setAbierto((a) => !a)}
                        className="text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
                    >
                        {abierto ? 'Ocultar detalle' : 'Ver detalle'}
                    </button>
                    {acciones}
                </div>
            </div>

            {abierto && (
                <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs uppercase text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="py-1 pr-4">Producto</th>
                                    <th className="py-1 pr-4 text-right">Cantidad</th>
                                    <th className="py-1 pr-4 text-right">Precio unitario</th>
                                    <th className="py-1 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {pedido.items.map((item) => (
                                    <tr key={item.producto_id}>
                                        <td className="py-2 pr-4">{item.nombre_producto}</td>
                                        <td className="py-2 pr-4 text-right">{item.cantidad}</td>
                                        <td className="py-2 pr-4 text-right">{formatearPrecio(item.precio_unitario)}</td>
                                        <td className="py-2 text-right font-medium">{formatearPrecio(item.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                        <div>
                            <dt className="text-xs text-gray-500 dark:text-gray-400">Entrega</dt>
                            <dd>{pedido.direccion_entrega}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-gray-500 dark:text-gray-400">Forma de pago</dt>
                            <dd>{FORMAS_DE_PAGO[pedido.forma_pago]}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-gray-500 dark:text-gray-400">Notas</dt>
                            <dd>{pedido.notas ?? '—'}</dd>
                        </div>
                    </dl>
                    <p className="mt-3 text-xs text-gray-400">Última actualización: {formatearFecha(pedido.updated_at)}</p>
                </div>
            )}
        </Card>
    );
};
