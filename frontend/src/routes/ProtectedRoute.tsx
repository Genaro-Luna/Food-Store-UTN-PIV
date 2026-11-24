import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Cargando } from '@/shared/components/Cargando';
import type { Rol } from '@/features/usuarios/types/usuario.types';

interface ProtectedRouteProps {
    /** Roles permitidos; sin roles alcanza con tener sesión. */
    roles?: Rol[];
}

/**
 * Sin sesión redirige a /login (recordando la ruta pedida) y sin el rol a /unauthorized.
 * Es solo UX: la protección real la hacen get_current_active_user y require_role en el backend.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
    const usuario = useAuthStore((s) => s.usuario);
    const cargando = useAuthStore((s) => s.cargando);
    const location = useLocation();

    if (cargando) {
        return <Cargando mensaje="Verificando sesión..." />;
    }
    if (!usuario) {
        return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
    }
    if (roles && !roles.includes(usuario.role)) {
        return <Navigate to="/unauthorized" replace />;
    }
    return <Outlet />;
};
