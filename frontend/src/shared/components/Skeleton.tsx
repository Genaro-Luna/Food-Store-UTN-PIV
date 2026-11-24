import React from 'react';

/** Bloque gris animado que ocupa el lugar del contenido mientras carga. */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div aria-hidden="true" className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`} />
);

/** Esqueleto de una tabla del panel de administración. */
export const SkeletonTabla: React.FC<{ filas?: number }> = ({ filas = 5 }) => (
    <div role="status" aria-label="Cargando" className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <Skeleton className="h-6 w-full" />
        {Array.from({ length: filas }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
        ))}
    </div>
);
