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

/** Esqueleto de la grilla del catálogo. */
export const SkeletonTarjetas: React.FC<{ cantidad?: number }> = ({ cantidad = 6 }) => (
    <div role="status" aria-label="Cargando" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cantidad }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <Skeleton className="h-44 w-full rounded-none" />
                <div className="space-y-3 p-4">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-9 w-full" />
                </div>
            </div>
        ))}
    </div>
);
