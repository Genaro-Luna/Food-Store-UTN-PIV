import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types/auth.types';
import { LoadingState } from './UiStates';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
}) => {
    const user = useAuthStore((s) => s.user);
    const isChecking = useAuthStore((s) => s.isChecking);

    if (isChecking && !user) {
        return (
            <div className="max-w-5xl mx-auto p-6 mt-10">
                <LoadingState message="Restaurando sesión..." />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};