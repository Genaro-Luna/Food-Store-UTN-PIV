import { api } from '@/shared/api/axiosInstance';
import type { Usuario } from '../types/usuario.types';

const BASE = '/admin/usuarios';

export const getUsuarios = async (): Promise<Usuario[]> => {
    const res = await api.get<Usuario[]>(BASE);
    return res.data;
};

export const activarUsuario = async (id: number): Promise<Usuario> => {
    const res = await api.post<Usuario>(`${BASE}/${id}/activar`);
    return res.data;
};

/** 400 si el admin intenta desactivarse a sí mismo. */
export const desactivarUsuario = async (id: number): Promise<Usuario> => {
    const res = await api.post<Usuario>(`${BASE}/${id}/desactivar`);
    return res.data;
};
