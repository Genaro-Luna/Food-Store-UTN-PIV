import { api } from '@/shared/api/axiosInstance';
import type { Usuario } from '@/features/usuarios/types/usuario.types';
import type { MensajeRespuesta, RegistroData } from '../types/auth.types';

/** POST /auth/token: el backend responde con la cookie HttpOnly; el body no trae el token. */
export const requestLogin = async (username: string, password: string): Promise<MensajeRespuesta> => {
    const datos = new URLSearchParams({ username, password });
    const res = await api.post<MensajeRespuesta>('/auth/token', datos, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
};

export const requestRegister = async (data: RegistroData): Promise<Usuario> => {
    const res = await api.post<Usuario>('/auth/register', data);
    return res.data;
};

/** GET /auth/me: devuelve el usuario de la cookie o null si no hay sesión válida. */
export const requestMe = async (): Promise<Usuario | null> => {
    try {
        const res = await api.get<Usuario>('/auth/me');
        return res.data;
    } catch {
        return null;
    }
};

export const requestLogout = async (): Promise<MensajeRespuesta> => {
    const res = await api.post<MensajeRespuesta>('/auth/logout');
    return res.data;
};
