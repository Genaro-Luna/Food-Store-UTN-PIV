import { axiosInstance } from './axiosInstance';
import type { Ingrediente, IngredienteFormValues } from '../types/ingrediente';

const ENDPOINT = '/ingredientes';

export const getIngredientes = async (): Promise<Ingrediente[]> => {
    const res = await axiosInstance.get<Ingrediente[]>(ENDPOINT);
    return res.data;
};

export const createIngrediente = async (
    data: IngredienteFormValues
): Promise<Ingrediente> => {
    const res = await axiosInstance.post<Ingrediente>(ENDPOINT, data);
    return res.data;
};

export const updateIngrediente = async ({
    id,
    data,
}: {
    id: number;
    data: IngredienteFormValues;
}): Promise<Ingrediente> => {
    const res = await axiosInstance.put<Ingrediente>(`${ENDPOINT}/${id}`, data);
    return res.data;
};

export const deleteIngrediente = async (id: number): Promise<void> => {
    await axiosInstance.delete(`${ENDPOINT}/${id}`);
};