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
import { useIngredients } from '../hooks/useIngredients';
import { IngredientFormModal } from '../components/IngredientFormModal';
import type { Ingrediente, IngredienteFormValues } from '../types/ingrediente.types';

export const IngredientsPage: React.FC = () => {
    const { isAdmin } = useAuth();
    const { ingredientes, isLoading, isError, error, refetch, crear, actualizar, eliminar } =
        useIngredients();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ingredienteToEdit, setIngredienteToEdit] = useState<Ingrediente | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);

    const openCreate = () => {
        setIngredienteToEdit(null);
        setIsModalOpen(true);
    };

    const handleSubmit = (data: IngredienteFormValues) =>
        ingredienteToEdit ? actualizar({ id: ingredienteToEdit.id, data }) : crear(data);

    const columns = useMemo<ColumnDef<Ingrediente>[]>(() => {
        const base: ColumnDef<Ingrediente>[] = [
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
                                setIngredienteToEdit(row.original);
                                setIsModalOpen(true);
                            }}
                            className={editButtonClass}
                        >
                            Editar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm('¿Seguro que deseas eliminar este ingrediente?')) {
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
        data: ingredientes,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 5 } },
    });

    if (isLoading) return <LoadingState message="Cargando ingredientes..." />;
    if (isError) {
        return (
            <ErrorState
                message={error?.message || 'Error al cargar ingredientes'}
                onRetry={() => refetch()}
            />
        );
    }

    return (
        <main className="max-w-5xl mx-auto p-6 mt-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Ingredientes</h2>
                {isAdmin && (
                    <button type="button" onClick={openCreate} className={primaryButtonClass}>
                        Nuevo ingrediente
                    </button>
                )}
            </div>

            <DataTable
                table={table}
                totalItems={ingredientes.length}
                emptyMessage="No hay ingredientes registrados."
                onAddFirst={isAdmin ? openCreate : undefined}
            />

            {isAdmin && (
                <IngredientFormModal
                    isOpen={isModalOpen}
                    ingrediente={ingredienteToEdit}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </main>
    );
};
