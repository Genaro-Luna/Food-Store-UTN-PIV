import React from 'react';
import { Card } from '@/shared/ui/Card';

interface TarjetaResumenProps {
    titulo: string;
    valor: string;
    icono: string;
    /** Color del borde izquierdo (clase de Tailwind). */
    acento: string;
}

/** Indicador del resumen de pedidos. */
export const TarjetaResumen: React.FC<TarjetaResumenProps> = ({ titulo, valor, icono, acento }) => (
    <Card className={`border-l-4 p-5 ${acento}`}>
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{titulo}</p>
            <span aria-hidden="true" className="text-2xl">
                {icono}
            </span>
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{valor}</p>
    </Card>
);
