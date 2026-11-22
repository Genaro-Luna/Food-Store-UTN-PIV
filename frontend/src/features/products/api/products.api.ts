import { api } from '@/shared/api/api';
import type { Producto, ProductoFormValues } from '../types/producto.types';

const ENDPOINT = '/productos';

export const getProductos = async (): Promise<Producto[]> => {
    // Temporal hasta el panel del TPI: la API ahora responde { total, items } paginado.
    const res = await api.get<{ total: number; items: Producto[] }>(ENDPOINT, {
        params: { limit: 100 },
    });
    return res.data.items;
};

export const createProducto = async (
    data: ProductoFormValues
): Promise<Producto> => {
    const res = await api.post<Producto>(ENDPOINT, data);
    return res.data;
};

export const updateProducto = async ({
    id,
    data,
}: {
    id: number;
    data: ProductoFormValues;
}): Promise<Producto> => {
    const res = await api.put<Producto>(`${ENDPOINT}/${id}`, data);
    return res.data;
};

export const deleteProducto = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
};