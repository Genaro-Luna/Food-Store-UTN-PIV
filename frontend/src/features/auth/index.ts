// API pública de la feature auth: el resto de la app importa SOLO desde acá.
export { useAuthStore } from './store/authStore';
export { useAuth } from './hooks/useAuth';
export { useAdminUsers } from './hooks/useAdminUsers';
export { RoleBadge } from './components/RoleBadge';
export { LoginPage } from './pages/LoginPage';
export { RegisterPage } from './pages/RegisterPage';
export { AdminUsersPage } from './pages/AdminUsersPage';
export type {
    AuthStatus,
    LoginCredentials,
    RegisterFormValues,
    Role,
    UsuarioAuth,
} from './types/auth.types';
