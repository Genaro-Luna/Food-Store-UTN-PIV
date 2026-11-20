import { axiosInstance } from './axiosInstance';
import type { Producto, ProductoFormValues } from '../types/producto';

const ENDPOINT = '/productos';

export const getProductos = async (): Promise<Producto[]> => {
    const res = await axiosInstance.get<Producto[]>(ENDPOINT);
    return res.data;
};

export const createProducto = async (
    data: ProductoFormValues
): Promise<Producto> => {
    const res = await axiosInstance.post<Producto>(ENDPOINT, data);
    return res.data;
};

export const updateProducto = async ({
    id,
    data,
}: {
    id: number;
    data: ProductoFormValues;
}): Promise<Producto> => {
    const res = await axiosInstance.put<Producto>(`${ENDPOINT}/${id}`, data);
    return res.data;
};

export const deleteProducto = async (id: number): Promise<void> => {
    await axiosInstance.delete(`${ENDPOINT}/${id}`);
};