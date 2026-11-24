import React from 'react';
import { Button } from '@/shared/ui/Button';

interface EstadoVacioProps {
    titulo: string;
    mensaje?: string;
    icono?: string;
    accion?: { etiqueta: string; onClick: () => void };
}

/** Lista sin resultados: mensaje y, opcionalmente, una acción para salir del estado vacío. */
export const EstadoVacio: React.FC<EstadoVacioProps> = ({ titulo, mensaje, icono = '🍽️', accion }) => (
    <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-gray-600 dark:bg-gray-800">
        <span aria-hidden="true" className="text-4xl">
            {icono}
        </span>
        <p className="font-semibold text-gray-700 dark:text-gray-200">{titulo}</p>
        {mensaje && <p className="text-sm text-gray-500 dark:text-gray-400">{mensaje}</p>}
        {accion && (
            <Button onClick={accion.onClick} className="mt-3">
                {accion.etiqueta}
            </Button>
        )}
    </div>
);
