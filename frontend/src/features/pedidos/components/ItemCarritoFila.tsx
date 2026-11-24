import React from 'react';
import { ImagenProducto } from '@/features/productos/components/ImagenProducto';
import { useCartStore, type ItemCarrito } from '@/store/cartStore';
import { formatearPrecio } from '@/shared/utils/formato';

const BOTON =
    'h-8 w-8 rounded-md border border-gray-300 text-sm font-bold hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:hover:bg-gray-700';

/** Línea del carrito con cantidad editable (entre 1 y el stock conocido). */
export const ItemCarritoFila: React.FC<{ item: ItemCarrito }> = ({ item }) => {
    const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
    const quitar = useCartStore((s) => s.quitar);

    return (
        <li className="flex flex-wrap items-center gap-4 py-4">
            <ImagenProducto url={item.imagen_url} nombre={item.nombre} className="h-16 w-16 rounded-lg" />
            <div className="min-w-40 flex-1">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{item.nombre}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatearPrecio(item.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    aria-label={`Quitar una unidad de ${item.nombre}`}
                    className={BOTON}
                    disabled={item.cantidad <= 1}
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                >
                    −
                </button>
                <input
                    type="number"
                    aria-label={`Cantidad de ${item.nombre}`}
                    min={1}
                    max={item.stock}
                    value={item.cantidad}
                    onChange={(e) => cambiarCantidad(item.producto_id, Number(e.target.value) || 1)}
                    className="w-14 rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-sm dark:border-gray-600 dark:bg-gray-700"
                />
                <button
                    type="button"
                    aria-label={`Agregar una unidad de ${item.nombre}`}
                    className={BOTON}
                    disabled={item.cantidad >= item.stock}
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                >
                    +
                </button>
            </div>
            <p className="w-28 text-right font-semibold text-gray-900 dark:text-gray-100">
                {formatearPrecio(item.precio_unitario * item.cantidad)}
            </p>
            <button
                type="button"
                aria-label={`Quitar ${item.nombre} del carrito`}
                onClick={() => quitar(item.producto_id)}
                className="text-gray-400 hover:text-red-600"
            >
                ✕
            </button>
        </li>
    );
};
