import React from 'react';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { formatearPrecio } from '@/shared/utils/formato';
import { ImagenProducto } from './ImagenProducto';
import type { Producto } from '../types/producto.types';

/** Tarjeta del catálogo con el botón «Agregar al carrito». */
export const ProductoCard: React.FC<{ producto: Producto }> = ({ producto }) => {
    const agregar = useCartStore((s) => s.agregar);
    const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0);
    const showNotification = useNotificationStore((s) => s.showNotification);

    const sinStock = producto.stock === 0;
    const vendible = producto.disponible && !sinStock;
    const topeAlcanzado = enCarrito >= producto.stock;

    let estado = `Stock: ${producto.stock}`;
    if (!producto.disponible) estado = 'No disponible';
    else if (sinStock) estado = 'Sin stock';
    else if (producto.stock <= 5) estado = `¡Quedan ${producto.stock}!`;

    return (
        <Card className="flex flex-col overflow-hidden">
            <ImagenProducto url={producto.imagen_url} nombre={producto.nombre} className="h-44 w-full" />
            <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{producto.nombre}</h3>
                    <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-medium text-orange-800 dark:bg-orange-950 dark:text-orange-200">
                        {producto.categoria.nombre}
                    </span>
                </div>
                {producto.descripcion && (
                    <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{producto.descripcion}</p>
                )}
                <div className="mt-auto flex items-end justify-between pt-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatearPrecio(producto.precio_base)}
                    </span>
                    <span className={`text-xs font-medium ${vendible ? 'text-gray-500 dark:text-gray-400' : 'text-red-600'}`}>
                        {estado}
                    </span>
                </div>
                <Button
                    className="w-full"
                    disabled={!vendible || topeAlcanzado}
                    onClick={() => {
                        agregar(producto);
                        showNotification(`"${producto.nombre}" agregado al carrito`);
                    }}
                >
                    {!vendible ? 'No disponible' : topeAlcanzado ? 'Máximo en el carrito' : 'Agregar al carrito'}
                </Button>
                {enCarrito > 0 && (
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400">En el carrito: {enCarrito}</p>
                )}
            </div>
        </Card>
    );
};
