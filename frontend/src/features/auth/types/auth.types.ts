/** Campos del formulario de login (OAuth2PasswordRequestForm en el backend). */
export interface LoginCredentials {
    username: string;
    password: string;
}

/** Espeja UserCreate del backend. */
export interface RegistroData {
    username: string;
    full_name: string;
    email: string;
    password: string;
}

/** Respuesta de /auth/token y /auth/logout. */
export interface MensajeRespuesta {
    message: string;
}
