import { api } from '@/shared/api/api';
import type { Categoria, CategoriaFormValues } from '../types/categorias';

const ENDPOINT = '/categorias';

export const getCategorias = async (): Promise<Categoria[]> => {
    const res = await api.get<Categoria[]>(ENDPOINT);
    return res.data;
};

export const createCategoria = async (
    data: CategoriaFormValues
): Promise<Categoria> => {
    const res = await api.post<Categoria>(ENDPOINT, data);
    return res.data;
};

export const updateCategoria = async ({
    id,
    data,
}: {
    id: number;
    data: CategoriaFormValues;
}): Promise<Categoria> => {
    const res = await api.put<Categoria>(`${ENDPOINT}/${id}`, data);
    return res.data;
};

export const deleteCategoria = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
};