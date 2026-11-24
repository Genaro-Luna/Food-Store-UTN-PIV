import axios from 'axios';

/**
 * Cliente HTTP único. withCredentials hace que el navegador envíe y reciba
 * la cookie HttpOnly access_token: el frontend nunca lee ni guarda el token.
 * No importa ningún store: los interceptores viven en setupInterceptors.ts.
 */
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
    timeout: 10000,
    withCredentials: true,
});
