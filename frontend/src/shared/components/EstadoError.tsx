import React from 'react';
import { Button } from '@/shared/ui/Button';

interface EstadoErrorProps {
    mensaje: string;
    onReintentar?: () => void;
}

/** Error al cargar una lista o un detalle, con botón para reintentar la consulta. */
export const EstadoError: React.FC<EstadoErrorProps> = ({ mensaje, onReintentar }) => (
    <div role="alert" className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-800 dark:bg-red-950">
        <span aria-hidden="true" className="text-3xl">
            ⚠️
        </span>
        <p className="text-sm font-medium text-red-700 dark:text-red-200">{mensaje}</p>
        {onReintentar && (
            <Button variante="secundario" onClick={onReintentar}>
                Reintentar
            </Button>
        )}
    </div>
);
