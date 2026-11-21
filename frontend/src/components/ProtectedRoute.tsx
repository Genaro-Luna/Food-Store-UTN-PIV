import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore, type Role } from '@/features/auth';
import { LoadingState } from '@/shared/components/UiStates';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
}) => {
    const user = useAuthStore((s) => s.user);
    const status = useAuthStore((s) => s.status);

    if (status === 'checking') {
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