import { api } from '@/shared/api/axiosInstance';
import type { Categoria, CategoriaPayload } from '../types/categoria.types';

const BASE = '/categorias';

/** Público: devuelve solo las categorías activas. */
export const getCategorias = async (): Promise<Categoria[]> => {
    const res = await api.get<Categoria[]>(BASE);
    return res.data;
};

/** 409 si el nombre ya existe. */
export const crearCategoria = async (data: CategoriaPayload): Promise<Categoria> => {
    const res = await api.post<Categoria>(BASE, data);
    return res.data;
};

export const actualizarCategoria = async (id: number, data: CategoriaPayload): Promise<Categoria> => {
    const res = await api.put<Categoria>(`${BASE}/${id}`, data);
    return res.data;
};

/** Baja lógica: 204 sin cuerpo. */
export const eliminarCategoria = async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
};
