import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Producto } from '@/features/productos/types/producto.types';

export interface ItemCarrito {
    producto_id: number;
    nombre: string;
    /** Precio de referencia al agregarlo; el definitivo lo copia el backend al confirmar. */
    precio_unitario: number;
    cantidad: number;
    imagen_url: string | null;
    /** Stock conocido al agregarlo: tope de la cantidad (el backend vuelve a validar). */
    stock: number;
}

interface CartState {
    items: ItemCarrito[];
    agregar: (producto: Producto, cantidad?: number) => void;
    quitar: (productoId: number) => void;
    cambiarCantidad: (productoId: number, cantidad: number) => void;
    vaciar: () => void;
    total: () => number;
    cantidadTotal: () => number;
}

const limitar = (cantidad: number, stock: number) => Math.max(1, Math.min(Math.trunc(cantidad), stock));

/** Carrito del cliente: vive en el navegador (persist) hasta confirmar el pedido. */
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            agregar: (producto, cantidad = 1) =>
                set((state) => {
                    const existente = state.items.find((i) => i.producto_id === producto.id);
                    if (existente) {
                        return {
                            items: state.items.map((i) =>
                                i.producto_id === producto.id
                                    ? { ...i, stock: producto.stock, cantidad: limitar(i.cantidad + cantidad, producto.stock) }
                                    : i
                            ),
                        };
                    }
                    const nuevo: ItemCarrito = {
                        producto_id: producto.id,
                        nombre: producto.nombre,
                        precio_unitario: producto.precio_base,
                        cantidad: limitar(cantidad, producto.stock),
                        imagen_url: producto.imagen_url,
                        stock: producto.stock,
                    };
                    return { items: [...state.items, nuevo] };
                }),

            quitar: (productoId) =>
                set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),

            cambiarCantidad: (productoId, cantidad) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.producto_id === productoId ? { ...i, cantidad: limitar(cantidad, i.stock) } : i
                    ),
                })),

            vaciar: () => set({ items: [] }),

            total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),

            cantidadTotal: () => get().items.reduce((suma, i) => suma + i.cantidad, 0),
        }),
        { name: 'foodstore-carrito', partialize: (state) => ({ items: state.items }) }
    )
);
