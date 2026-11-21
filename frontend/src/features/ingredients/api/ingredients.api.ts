import { api } from '@/shared/api/api';
import type { Ingrediente, IngredienteFormValues } from '../types/ingrediente.types';

const ENDPOINT = '/ingredientes';

export const getIngredientes = async (): Promise<Ingrediente[]> => {
    const res = await api.get<Ingrediente[]>(ENDPOINT);
    return res.data;
};

export const createIngrediente = async (
    data: IngredienteFormValues
): Promise<Ingrediente> => {
    const res = await api.post<Ingrediente>(ENDPOINT, data);
    return res.data;
};

export const updateIngrediente = async ({
    id,
    data,
}: {
    id: number;
    data: IngredienteFormValues;
}): Promise<Ingrediente> => {
    const res = await api.put<Ingrediente>(`${ENDPOINT}/${id}`, data);
    return res.data;
};

export const deleteIngrediente = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
};