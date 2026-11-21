import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { CategoriaList } from '../components/CategoriaList';
import { CategoriaModal } from '../components/CategoriaModal';
import { LoadingState, ErrorState } from '../components/UiStates';
import type { Categoria, CategoriaFormValues } from '../types/categorias';
import {
    getCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
} from '../api/categorias.actions';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

export const CategoriasPage: React.FC = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === 'admin';
    const showNotification = useNotificationStore((s) => s.showNotification);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [categoriaToEdit, setCategoriaToEdit] = useState<Categoria | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);

    const {
        data: categorias = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery<Categoria[]>({
        queryKey: ['categorias'],
        queryFn: getCategorias,
    });

    const createMutation = useMutation({
        mutationFn: createCategoria,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            showNotification('Categoría creada correctamente');
            setIsModalOpen(false);
            setModalError(null);
        },
        onError: (err: Error) => setModalError(err.message),
    });

    const updateMutation = useMutation({
        mutationFn: updateCategoria,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
            setIsModalOpen(false);
            setCategoriaToEdit(null);
            showNotification('Categoría actualizada correctamente');
            setModalError(null);
        },
        onError: (err: Error) => {
            setDeleteError(err.message);
            showNotification(err.message, 'error');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategoria,
        onSuccess: () => {
            showNotification('Categoría eliminada correctamente');
            setDeleteError(null);
            queryClient.invalidateQueries({ queryKey: ['categorias'] });
        },
        onError: (err: Error) => setDeleteError(err.message),
    });

    const form = useForm({
        defaultValues: {
            nombre: '',
            descripcion: '',
        } as CategoriaFormValues,
        validators: {
            onSubmit: ({ value }) => {
                if (!value.nombre.trim()) {
                    return {
                        fields: {
                            nombre: 'El nombre de la categoría es obligatorio',
                        },
                    };
                }
                return undefined;
            },
        },
        onSubmit: async ({ value }) => {
            const cleanData: CategoriaFormValues = {
                nombre: value.nombre.trim(),
                descripcion: value.descripcion.trim(),
            };
            if (categoriaToEdit) {
                await updateMutation.mutateAsync({
                    id: categoriaToEdit.id,
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
            form.setFieldValue('nombre', categoriaToEdit ? categoriaToEdit.nombre : '');
            form.setFieldValue(
                'descripcion',
                categoriaToEdit ? categoriaToEdit.descripcion : ''
            );
        }
    }, [isModalOpen, categoriaToEdit, form]);

    const handleOpenCreate = () => {
        setCategoriaToEdit(null);
        setModalError(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (categoria: Categoria) => {
        setCategoriaToEdit(categoria);
        setModalError(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('¿Seguro que deseas eliminar esta categoría?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns = useMemo<ColumnDef<Categoria>[]>(() => {
        const baseColumns: ColumnDef<Categoria>[] = [
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
        data: categorias,
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

    if (isLoading) return <LoadingState message="Cargando categorías..." />;
    if (isError)
        return (
            <ErrorState
                message={(error as Error)?.message || 'Error al cargar categorías'}
                onRetry={() => refetch()}
            />
        );

    return (
        <main className="max-w-5xl mx-auto p-6 mt-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Categorías</h2>
                {isAdmin && (
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-95 transition shadow-sm"
                    >
                        Nueva categoría
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

            <CategoriaList
                table={table}
                totalItems={categorias.length}
                emptyMessage="No hay categorías registradas."
                onAddFirst={isAdmin ? handleOpenCreate : undefined}
            />

            {isAdmin && (
                <CategoriaModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={categoriaToEdit ? 'Editar Categoría' : 'Nueva Categoría'}
                    apiError={modalError}
                >
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
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Hamburguesas"
                                        className={inputClass}
                                        value={f.state.value}
                                        onChange={(e) => f.handleChange(e.target.value)}
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

                        <form.Field name="descripcion">
                            {(f) => (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Descripción opcional de la categoría"
                                        className={`${inputClass} resize-none`}
                                        value={f.state.value}
                                        onChange={(e) => f.handleChange(e.target.value)}
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
                                            : categoriaToEdit
                                            ? 'Actualizar'
                                            : 'Guardar'}
                                    </button>
                                )}
                            </form.Subscribe>
                        </div>
                    </form>
                </CategoriaModal>
            )}
        </main>
    );
};