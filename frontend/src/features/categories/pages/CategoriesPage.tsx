import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { useAuth } from '@/features/auth';
import { DataTable } from '@/shared/components/DataTable';
import { LoadingState, ErrorState } from '@/shared/components/UiStates';
import { primaryButtonClass, editButtonClass, deleteButtonClass } from '@/shared/styles/form';
import { useCategories } from '../hooks/useCategories';
import { CategoryFormModal } from '../components/CategoryFormModal';
import type { Categoria, CategoriaFormValues } from '../types/categoria.types';

export const CategoriesPage: React.FC = () => {
    const { isAdmin } = useAuth();
    const { categorias, isLoading, isError, error, refetch, crear, actualizar, eliminar } =
        useCategories();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoriaToEdit, setCategoriaToEdit] = useState<Categoria | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);

    const openCreate = () => {
        setCategoriaToEdit(null);
        setIsModalOpen(true);
    };

    const handleSubmit = (data: CategoriaFormValues) =>
        categoriaToEdit ? actualizar({ id: categoriaToEdit.id, data }) : crear(data);

    const columns = useMemo<ColumnDef<Categoria>[]>(() => {
        const base: ColumnDef<Categoria>[] = [
            { accessorKey: 'id', header: 'ID' },
            {
                accessorKey: 'nombre',
                header: 'Nombre',
                cell: (info) => (
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {info.getValue<string>()}
                    </span>
                ),
            },
            {
                accessorKey: 'descripcion',
                header: 'Descripción',
                cell: (info) =>
                    info.getValue<string>() || (
                        <span className="text-gray-400 italic">Sin descripción</span>
                    ),
            },
        ];

        if (isAdmin) {
            base.push({
                id: 'acciones',
                header: 'Acciones',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setCategoriaToEdit(row.original);
                                setIsModalOpen(true);
                            }}
                            className={editButtonClass}
                        >
                            Editar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm('¿Seguro que deseas eliminar esta categoría?')) {
                                    eliminar(row.original.id);
                                }
                            }}
                            className={deleteButtonClass}
                        >
                            Eliminar
                        </button>
                    </div>
                ),
            });
        }
        return base;
    }, [isAdmin, eliminar]);

    const table = useReactTable({
        data: categorias,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 5 } },
    });

    if (isLoading) return <LoadingState message="Cargando categorías..." />;
    if (isError) {
        return (
            <ErrorState
                message={error?.message || 'Error al cargar categorías'}
                onRetry={() => refetch()}
            />
        );
    }

    return (
        <main className="max-w-5xl mx-auto p-6 mt-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Categorías</h2>
                {isAdmin && (
                    <button type="button" onClick={openCreate} className={primaryButtonClass}>
                        Nueva categoría
                    </button>
                )}
            </div>

            <DataTable
                table={table}
                totalItems={categorias.length}
                emptyMessage="No hay categorías registradas."
                onAddFirst={isAdmin ? openCreate : undefined}
            />

            {isAdmin && (
                <CategoryFormModal
                    isOpen={isModalOpen}
                    categoria={categoriaToEdit}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </main>
    );
};
