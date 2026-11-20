import type { Categoria } from './categorias';

export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio_base: number;
    disponible: boolean;
    imagen_url?: string[];
    categorias?: Categoria[];
}

export type ProductoFormValues = Omit<Producto, 'id' | 'categorias'>;