import React from 'react';
import { Link } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
    return (
        <main className="max-w-xl mx-auto p-6 mt-16">
            <div className="bg-white rounded-2xl shadow-md border border-red-100 p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    403
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Acceso Denegado
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                    No tienes los permisos necesarios (rol Administrador) para acceder a
                    esta sección.
                </p>
                <Link
                    to="/categorias"
                    className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                    Volver a Categorías
                </Link>
            </div>
        </main>
    );
};