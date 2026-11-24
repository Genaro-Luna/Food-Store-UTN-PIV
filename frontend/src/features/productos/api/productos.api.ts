import { api } from '@/shared/api/axiosInstance';
import type {
    FiltrosProductos,
    Producto,
    ProductoActualizacion,
    ProductoPayload,
    ProductosPaginados,
    StockPayload,
} from '../types/producto.types';

const BASE = '/productos';

/** Público y paginado en el servidor. Axios omite los filtros undefined. */
export const getProductos = async (filtros: FiltrosProductos): Promise<ProductosPaginados> => {
    const res = await api.get<ProductosPaginados>(BASE, { params: filtros });
    return res.data;
};

/** 404 si la categoría no existe o está dada de baja. */
export const crearProducto = async (data: ProductoPayload): Promise<Producto> => {
    const res = await api.post<Producto>(BASE, data);
    return res.data;
};

export const actualizarProducto = async (id: number, data: ProductoActualizacion): Promise<Producto> => {
    const res = await api.put<Producto>(`${BASE}/${id}`, data);
    return res.data;
};

export const actualizarStock = async (id: number, data: StockPayload): Promise<Producto> => {
    const res = await api.patch<Producto>(`${BASE}/${id}/stock`, data);
    return res.data;
};

/** Baja lógica: 204 sin cuerpo. */
export const eliminarProducto = async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
};
