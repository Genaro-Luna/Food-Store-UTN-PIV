import { api } from '@/shared/api/api';
import type { Producto, ProductoFormValues } from '../types/producto';

const ENDPOINT = '/productos';

export const getProductos = async (): Promise<Producto[]> => {
    const res = await api.get<Producto[]>(ENDPOINT);
    return res.data;
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