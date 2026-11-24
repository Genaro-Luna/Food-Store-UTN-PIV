import React from 'react';

/** Indicador de carga a pantalla completa (verificación de sesión, rutas protegidas). */
export const Cargando: React.FC<{ mensaje?: string }> = ({ mensaje = 'Cargando...' }) => (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-24 text-gray-500 dark:text-gray-400">
        <span
            aria-hidden="true"
            className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"
        />
        <p className="text-sm">{mensaje}</p>
    </div>
);
