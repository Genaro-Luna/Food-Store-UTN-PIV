import type { Categoria } from '@/features/categorias/types/categoria.types';

/** Espeja ProductoRead del backend. */
export interface Producto {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    imagen_url: string | null;
    stock: number;
    disponible: boolean;
    categoria_id: number;
    activo: boolean;
    categoria: Categoria;
}

/** Espeja ProductosPaginados: total sirve para calcular las páginas. */
export interface ProductosPaginados {
    total: number;
    items: Producto[];
}

/** Query params de GET /productos. */
export interface FiltrosProductos {
    skip?: number;
    limit?: number;
    search?: string;
    categoria_id?: number;
    disponible?: boolean;
}

/** Cuerpo de POST y PUT /productos (ProductoCreate / ProductoUpdate). */
export interface ProductoPayload {
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    imagen_url: string | null;
    stock: number;
    disponible: boolean;
    categoria_id: number;
}

/** Cuerpo de PUT /productos/{id}: ProductoUpdate admite cambios parciales. */
export type ProductoActualizacion = Partial<ProductoPayload>;

/** Cuerpo de PATCH /productos/{id}/stock (ProductoStockUpdate). */
export interface StockPayload {
    stock: number;
    disponible: boolean;
}
