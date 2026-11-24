import React from 'react';
import { Button } from '@/shared/ui/Button';

interface PaginacionProps {
    /** Página actual, empezando en 0. */
    pagina: number;
    totalPaginas: number;
    totalItems: number;
    onCambiar: (pagina: number) => void;
    deshabilitado?: boolean;
}

/** Controles Anterior / Siguiente; sirve para paginación del servidor y del cliente. */
export const Paginacion: React.FC<PaginacionProps> = ({
    pagina,
    totalPaginas,
    totalItems,
    onCambiar,
    deshabilitado = false,
}) => {
    const paginas = Math.max(totalPaginas, 1);
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400">
            <span>
                Página <strong>{pagina + 1}</strong> de <strong>{paginas}</strong> ({totalItems}{' '}
                {totalItems === 1 ? 'resultado' : 'resultados'})
            </span>
            <div className="flex gap-2">
                <Button
                    variante="secundario"
                    tamano="sm"
                    onClick={() => onCambiar(pagina - 1)}
                    disabled={deshabilitado || pagina <= 0}
                >
                    Anterior
                </Button>
                <Button
                    variante="secundario"
                    tamano="sm"
                    onClick={() => onCambiar(pagina + 1)}
                    disabled={deshabilitado || pagina + 1 >= paginas}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
};
