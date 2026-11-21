import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type Role } from '@/features/auth';
import { LoadingState } from '@/shared/components/UiStates';

interface ProtectedRouteProps {
    allowedRoles?: Role[]; // sin roles = alcanza con estar autenticado
}

/**
 * Guardia de rutas. Se usa como elemento de una ruta "padre" sin path:
 * las rutas hijas se renderizan en <Outlet /> solo si pasan los controles.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const user = useAuthStore((s) => s.user);
    const status = useAuthStore((s) => s.status);

    // 1. Esperando GET /auth/me: no se redirige todavía
    if (status === 'checking') {
        return (
            <div className="max-w-5xl mx-auto p-6 mt-10">
                <LoadingState message="Restaurando sesión..." />
            </div>
        );
    }

    // 2. Sin sesión → login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Con sesión pero sin el rol requerido → acceso denegado
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 4. Sesión válida y rol permitido → la página hija
    return <Outlet />;
};