import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';

/** Destino de ProtectedRoute cuando el rol del usuario no tiene acceso a la ruta. */
export const UnauthorizedPage: React.FC = () => (
    <Card className="mx-auto mt-10 max-w-md p-8 text-center">
        <p aria-hidden="true" className="text-5xl">
            🔒
        </p>
        <h1 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">Acceso denegado</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Tu cuenta no tiene permisos para ver esta sección.
        </p>
        <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
        >
            Volver al inicio
        </Link>
    </Card>
);
