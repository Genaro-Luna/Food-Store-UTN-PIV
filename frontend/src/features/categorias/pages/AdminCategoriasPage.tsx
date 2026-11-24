import React, { useMemo, useState } from 'react';
import {
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { DataTable } from '@/shared/components/DataTable';
import { EstadoError } from '@/shared/components/EstadoError';
import { SkeletonTabla } from '@/shared/components/Skeleton';
import { Button } from '@/shared/ui/Button';
import { CategoriaFormModal } from '../components/CategoriaFormModal';
import { useCategorias, useEliminarCategoria } from '../hooks/useCategorias';
import type { Categoria } from '../types/categoria.types';

/** undefined = modal cerrado; null = alta; una categoría = edición. */
type Edicion = Categoria | null | undefined;

export const AdminCategoriasPage: React.FC = () => {
    const { data: categorias = [], isLoading, isError, error, refetch } = useCategorias();
    const { mutate: eliminar, isPending: eliminando } = useEliminarCategoria();
    const [edicion, setEdicion] = useState<Edicion>(undefined);
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = useMemo<ColumnDef<Categoria>[]>(
        () => [
            {
                accessorKey: 'nombre',
                header: 'Nombre',
                cell: ({ row }) => <span className="font-semibold">{row.original.nombre}</span>,
            },
            {
                accessorKey: 'descripcion',
                header: 'Descripción',
                cell: ({ row }) =>
                    row.original.descripcion ?? <span className="italic text-gray-400">Sin descripción</span>,
            },
            {
                id: 'acciones',
                header: 'Acciones',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <Button variante="secundario" tamano="sm" onClick={() => setEdicion(row.original)}>
                            Editar
                        </Button>
                        <Button
                            variante="peligro"
                            tamano="sm"
                            disabled={eliminando}
                            onClick={() => {
                                if (window.confirm(`¿Eliminar la categoría "${row.original.nombre}"?`)) {
                                    eliminar(row.original.id);
                                }
                            }}
                        >
                            Eliminar
                        </Button>
                    </div>
                ),
            },
        ],
        [eliminar, eliminando]
    );

    const table = useReactTable({
        data: categorias,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    return (
        <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Categorías</h2>
                <Button onClick={() => setEdicion(null)}>Nueva categoría</Button>
            </div>

            {isLoading ? (
                <SkeletonTabla />
            ) : isError ? (
                <EstadoError mensaje={error?.message ?? 'No se pudieron cargar las categorías.'} onReintentar={() => void refetch()} />
            ) : (
                <DataTable
                    table={table}
                    totalItems={categorias.length}
                    mensajeVacio="No hay categorías cargadas."
                    accionVacio={{ etiqueta: 'Crear la primera', onClick: () => setEdicion(null) }}
                />
            )}

            {edicion !== undefined && (
                <CategoriaFormModal categoria={edicion} onCerrar={() => setEdicion(undefined)} />
            )}
        </section>
    );
};
