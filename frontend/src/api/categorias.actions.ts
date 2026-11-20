import { axiosInstance } from './axiosInstance';
import type { Categoria, CategoriaFormValues } from '../types/categorias';

const ENDPOINT = '/categorias';

export const getCategorias = async (): Promise<Categoria[]> => {
    const res = await axiosInstance.get<Categoria[]>(ENDPOINT);
    return res.data;
};

export const createCategoria = async (
    data: CategoriaFormValues
): Promise<Categoria> => {
    const res = await axiosInstance.post<Categoria>(ENDPOINT, data);
    return res.data;
};

export const updateCategoria = async ({
    id,
    data,
}: {
    id: number;
    data: CategoriaFormValues;
}): Promise<Categoria> => {
    const res = await axiosInstance.put<Categoria>(`${ENDPOINT}/${id}`, data);
    return res.data;
};

export const deleteCategoria = async (id: number): Promise<void> => {
    await axiosInstance.delete(`${ENDPOINT}/${id}`);
};