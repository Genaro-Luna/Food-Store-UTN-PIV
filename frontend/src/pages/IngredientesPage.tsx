import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import type { Ingrediente, IngredienteFormValues } from '../types/ingrediente';
import {
    getIngredientes,
    createIngrediente,
    updateIngrediente,
    deleteIngrediente,
} from '../api/ingredientes.actions';
import { useAuthStore } from '@/features/auth';

const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

export const IngredientesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === 'admin';

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [ingredienteToEdit, setIngredienteToEdit] = useState<Ingrediente | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);

    const {
        data: ingredientes = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery<Ingrediente[]>({
        queryKey: ['ingredientes'],
        queryFn: getIngredientes,
    });

    const createMutation = useMutation({
        mutationFn: createIngrediente,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
            setIsModalOpen(false);
            setModalError(null);
        },
        onError: (err: Error) => setModalError(err.message),
    });

    const updateMutation = useMutation({
        mutationFn: updateIngrediente,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
            setIsModalOpen(false);
            setIngredienteToEdit(null);
            setModalError(null);
        },
        onError: (err: Error) => setModalError(err.message),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteIngrediente,
        onSuccess: () => {
            setDeleteError(null);
            queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
        },
        onError: (err: Error) => setDeleteError(err.message),
    });

    const form = useForm({
        defaultValues: {
            nombre: '',
        } as IngredienteFormValues,
        validators: {
            onSubmit: ({ value }) => {
                if (!value.nombre.trim()) {
                    return {
                        fields: {
                            nombre: 'El nombre del ingrediente es obligatorio',
                        },
                    };
                }
                return undefined;
            },
        },
        onSubmit: async ({ value }) => {
            const cleanData: IngredienteFormValues = {
                nombre: value.nombre.trim(),
            };
            if (ingredienteToEdit) {
                await updateMutation.mutateAsync({
                    id: ingredienteToEdit.id,
                    data: cleanData,
                });
            } else {
                await createMutation.mutateAsync(cleanData);
            }
        },
    });

    useEffect(() => {
        if (isModalOpen) {
            form.reset();
            form.setFieldValue(
                'nombre',
                ingredienteToEdit ? ingredienteToEdit.nombre : ''
            );
        }
    }, [isModalOpen, ingredienteToEdit, form]);

    const handleOpenCreate = () => {
        setIngredienteToEdit(null);
        setModalError(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (ingrediente: Ingrediente) => {
        setIngredienteToEdit(ingrediente);
        setModalError(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('¿Seguro que deseas eliminar este ingrediente?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns = useMemo<ColumnDef<Ingrediente>[]>(() => {
        const baseColumns: ColumnDef<Ingrediente>[] = [
            {
                accessorKey: 'id',
                header: 'ID',
            },
            {
                accessorKey: 'nombre',
                header: 'Nombre',
                cell: (info) => (
                    <span className="font-semibold text-gray-900">
                        {info.getValue<string>()}
                    </span>
                ),
            },
        ];

        if (isAdmin) {
            baseColumns.push({
                id: 'acciones',
                header: 'Acciones',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => handleOpenEdit(row.original)}
                            className="px-3 py-1 bg-amber-500 text-white rounded-md text-xs font-semibold hover:bg-amber-600 active:scale-95 transition"
                        >
                            Editar
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDelete(row.original.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 active:scale-95 transition"
                        >
                            Eliminar
                        </button>
                    </div>
                ),
            });
        }

        return baseColumns;
    }, [isAdmin]);

    const table = useReactTable({
        data: ingredientes,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 5 },
        },
    });

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto p-6 mt-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Cargando ingredientes...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-5xl mx-auto p-6 mt-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-700 font-medium mb-3">
                        {(error as Error)?.message || 'Error al cargar los ingredientes'}
                    </p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="max-w-5xl mx-auto p-6 mt-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Ingredientes</h2>
                {isAdmin && (
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-95 transition shadow-sm"
                    >
                        Nuevo ingrediente
                    </button>
                )}
            </div>

            {deleteError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex justify-between items-center">
                    <span>{deleteError}</span>
                    <button
                        type="button"
                        onClick={() => setDeleteError(null)}
                        className="font-bold text-red-800 hover:underline text-xs"
                    >
                        Cerrar
                    </button>
                </div>
            )}

            {ingredientes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
                    <p className="text-gray-500 text-lg mb-4">
                        No hay ingredientes registrados aún.
                    </p>
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                        >
                            Crear primer ingrediente
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            const canSort = header.column.getCanSort();
                                            const sorted = header.column.getIsSorted();
                                            return (
                                                <th
                                                    key={header.id}
                                                    onClick={
                                                        canSort
                                                            ? header.column.getToggleSortingHandler()
                                                            : undefined
                                                    }
                                                    className={`px-4 py-3 font-semibold select-none ${
                                                        canSort
                                                            ? 'cursor-pointer hover:bg-gray-100'
                                                            : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                  header.column.columnDef.header,
                                                                  header.getContext()
                                                              )}
                                                        {sorted === 'asc' && <span>▲</span>}
                                                        {sorted === 'desc' && <span>▼</span>}
                                                        {canSort && !sorted && (
                                                            <span className="text-gray-400 text-xs">
                                                                ↕
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-4 py-3 text-gray-800"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                        <span>
                            Página{' '}
                            <strong>
                                {table.getState().pagination.pageIndex + 1} de{' '}
                                {Math.max(table.getPageCount(), 1)}
                            </strong>{' '}
                            ({ingredientes.length} ingredientes)
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
                            >
                                Anterior
                            </button>
                            <button
                                type="button"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAdmin && isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                                {ingredienteToEdit
                                    ? 'Editar Ingrediente'
                                    : 'Nuevo Ingrediente'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {modalError && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                                {modalError}
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                form.handleSubmit();
                            }}
                            className="flex flex-col gap-4"
                        >
                            <form.Field name="nombre">
                                {(f) => (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre del ingrediente *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Lechuga, Cheddar, Panceta..."
                                            className={inputClass}
                                            value={f.state.value}
                                            onChange={(e) =>
                                                f.handleChange(e.target.value)
                                            }
                                        />
                                        {f.state.meta.errors.map((err) => (
                                            <p
                                                key={String(err)}
                                                className="mt-1 text-xs text-red-500"
                                            >
                                                {String(err)}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </form.Field>

                            <div className="flex justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                                >
                                    Cancelar
                                </button>
                                <form.Subscribe
                                    selector={(state) => [
                                        state.canSubmit,
                                        state.isSubmitting,
                                    ]}
                                >
                                    {([canSubmit, isSubmitting]) => (
                                        <button
                                            type="submit"
                                            disabled={!canSubmit || isSubmitting}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                                        >
                                            {isSubmitting
                                                ? 'Guardando...'
                                                : ingredienteToEdit
                                                ? 'Actualizar'
                                                : 'Guardar'}
                                        </button>
                                    )}
                                </form.Subscribe>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};