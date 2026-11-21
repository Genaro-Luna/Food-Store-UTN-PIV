export type Role = 'user' | 'admin';

export interface UsuarioAuth {
    id: number;
    username: string;
    full_name: string;
    email: string;
    role: Role;
    disabled: boolean;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterFormValues {
    username: string;
    full_name: string;
    email: string;
    password: string;
}
/** Estado de la verificación de sesión: 'checking' mientras se espera GET /auth/me. */
export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';
