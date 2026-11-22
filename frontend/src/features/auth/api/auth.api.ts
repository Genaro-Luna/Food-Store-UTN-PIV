import { api } from '@/shared/api/api';
import type { UsuarioAuth, RegisterFormValues } from '../types/auth.types';

const AUTH_PREFIX = '/auth';

export const requestLogin = async (
    username: string,
    password: string
): Promise<void> => {
    const formData = new URLSearchParams({ username, password });
    await api.post(`${AUTH_PREFIX}/token`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
};

export const requestRegister = async (
    data: RegisterFormValues
): Promise<UsuarioAuth> => {
    const res = await api.post<UsuarioAuth>(
        `${AUTH_PREFIX}/register`,
        data
    );
    return res.data;
};

export const requestMe = async (): Promise<UsuarioAuth | null> => {
    try {
        const res = await api.get<UsuarioAuth>(`${AUTH_PREFIX}/me`);
        return res.data;
    } catch {
        return null;
    }
};

export const requestLogout = async (): Promise<void> => {
    await api.post(`${AUTH_PREFIX}/logout`);
};

export const getAdminUsers = async (): Promise<UsuarioAuth[]> => {
    const res = await api.get<UsuarioAuth[]>(
        `${AUTH_PREFIX}/admin/usuarios`
    );
    return res.data;
};

export const activateUser = async (userId: number): Promise<UsuarioAuth> => {
    const res = await api.post<UsuarioAuth>(
        `${AUTH_PREFIX}/admin/usuarios/${userId}/activar`
    );
    return res.data;
};

export const deactivateUser = async (userId: number): Promise<UsuarioAuth> => {
    const res = await api.post<UsuarioAuth>(
        `${AUTH_PREFIX}/admin/usuarios/${userId}/desactivar`
    );
    return res.data;
};