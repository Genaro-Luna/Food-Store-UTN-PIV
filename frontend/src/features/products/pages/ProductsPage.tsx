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
import { useProducts } from '../hooks/useProducts';
import { ProductFormModal } from '../components/ProductFormModal';
import type { Producto, ProductoFormValues } from '../types/producto.types';

export const ProductsPage: React.FC = () => {
    const { isAdmin } = useAuth();
    const { productos, isLoading, isError, error, refetch, crear, actualizar, eliminar } =
        useProducts();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productoToEdit, setProductoToEdit] = useState<Producto | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);

    const openCreate = () => {
        setProductoToEdit(null);
        setIsModalOpen(true);
    };

    const handleSubmit = (data: ProductoFormValues) =>
        productoToEdit ? actualizar({ id: productoToEdit.id, data }) : crear(data);

    const columns = useMemo<ColumnDef<Producto>[]>(() => {
        const base: ColumnDef<Producto>[] = [
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
            {
                accessorKey: 'precio_base',
                header: 'Precio Base',
                cell: (info) => (
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                        ${Number(info.getValue<number>()).toFixed(2)}
                    </span>
                ),
            },
            {
                accessorKey: 'disponible',
                header: 'Estado',
                cell: (info) => {
                    const disponible = info.getValue<boolean>();
                    return (
                        <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                disponible
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            }`}
                        >
                            {disponible ? 'Disponible' : 'No disponible'}
                        </span>
                    );
                },
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
                                setProductoToEdit(row.original);
                                setIsModalOpen(true);
                            }}
                            className={editButtonClass}
                        >
                            Editar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
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
        data: productos,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 5 } },
    });

    if (isLoading) return <LoadingState message="Cargando productos..." />;
    if (isError) {
        return (
            <ErrorState
                message={error?.message || 'Error al cargar productos'}
                onRetry={() => refetch()}
            />
        );
    }

    return (
        <main className="max-w-5xl mx-auto p-6 mt-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Productos</h2>
                {isAdmin && (
                    <button type="button" onClick={openCreate} className={primaryButtonClass}>
                        Nuevo producto
                    </button>
                )}
            </div>

            <DataTable
                table={table}
                totalItems={productos.length}
                emptyMessage="No hay productos cargados aún."
                onAddFirst={isAdmin ? openCreate : undefined}
            />

            {isAdmin && (
                <ProductFormModal
                    isOpen={isModalOpen}
                    producto={productoToEdit}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </main>
    );
};
