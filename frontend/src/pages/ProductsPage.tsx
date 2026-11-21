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
import { DataTable } from '@/shared/components/DataTable';
import { Modal } from '@/shared/components/Modal';
import { LoadingState, ErrorState } from '@/shared/components/UiStates';
import type { Producto, ProductoFormValues } from '../types/producto';
import {
    getProductos,
    createProducto,
    updateProducto,
    deleteProducto,
} from '../api/productos.actions';
import { useAuthStore } from '@/features/auth';

const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

export const ProductsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === 'admin';

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [productoToEdit, setProductoToEdit] = useState<Producto | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);

    const {
        data: productos = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery<Producto[]>({
        queryKey: ['productos'],
        queryFn: getProductos,
    });

    const createMutation = useMutation({
        mutationFn: createProducto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
            setIsModalOpen(false);
            setModalError(null);
        },
        onError: (err: Error) => setModalError(err.message),
    });

    const updateMutation = useMutation({
        mutationFn: updateProducto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
            setIsModalOpen(false);
            setProductoToEdit(null);
            setModalError(null);
        },
        onError: (err: Error) => setModalError(err.message),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProducto,
        onSuccess: () => {
            setDeleteError(null);
            queryClient.invalidateQueries({ queryKey: ['productos'] });
        },
        onError: (err: Error) => setDeleteError(err.message),
    });

    const form = useForm({
        defaultValues: {
            nombre: '',
            descripcion: '',
            precio_base: 0,
            disponible: true,
        } as ProductoFormValues,
        validators: {
            onSubmit: ({ value }) => {
                const errors: Partial<Record<keyof ProductoFormValues, string>> = {};
                if (!value.nombre.trim()) {
                    errors.nombre = 'El nombre del producto es obligatorio';
                }
                if (Number.isNaN(value.precio_base) || value.precio_base < 0) {
                    errors.precio_base = 'El precio no puede ser negativo';
                }
                return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
            },
        },
        onSubmit: async ({ value }) => {
            const cleanData: ProductoFormValues = {
                nombre: value.nombre.trim(),
                descripcion: value.descripcion.trim(),
                precio_base: Number(value.precio_base),
                disponible: value.disponible,
            };
            if (productoToEdit) {
                await updateMutation.mutateAsync({
                    id: productoToEdit.id,
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
            form.setFieldValue('nombre', productoToEdit ? productoToEdit.nombre : '');
            form.setFieldValue(
                'descripcion',
                productoToEdit ? productoToEdit.descripcion : ''
            );
            form.setFieldValue(
                'precio_base',
                productoToEdit ? Number(productoToEdit.precio_base) : 0
            );
            form.setFieldValue(
                'disponible',
                productoToEdit ? productoToEdit.disponible : true
            );
        }
    }, [isModalOpen, productoToEdit, form]);

    const handleOpenCreate = () => {
        setProductoToEdit(null);
        setModalError(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (producto: Producto) => {
        setProductoToEdit(producto);
        setModalError(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns = useMemo<ColumnDef<Producto>[]>(() => {
        const baseColumns: ColumnDef<Producto>[] = [
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
            {
                accessorKey: 'precio_base',
                header: 'Precio Base',
                cell: (info) => (
                    <span className="font-bold text-blue-600">
                        ${Number(info.getValue<number>()).toFixed(2)}
                    </span>
                ),
            },
            {
                accessorKey: 'disponible',
                header: 'Estado',
                cell: (info) => {
                    const disp = info.getValue<boolean>();
                    return (
                        <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                disp
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                            }`}
                        >
                            {disp ? 'Disponible' : 'No disponible'}
                        </span>
                    );
                },
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
        data: productos,
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

    if (isLoading) return <LoadingState message="Cargando productos..." />;
    if (isError)
        return (
            <ErrorState
                message={(error as Error)?.message || 'Error al cargar productos'}
                onRetry={() => refetch()}
            />
        );

    return (
        <main className="max-w-5xl mx-auto p-6 mt-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
                {isAdmin && (
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-95 transition shadow-sm"
                    >
                        Nuevo producto
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

            <DataTable
                table={table}
                totalItems={productos.length}
                emptyMessage="No hay productos cargados aún."
                onAddFirst={isAdmin ? handleOpenCreate : undefined}
            />

            {isAdmin && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={productoToEdit ? 'Editar Producto' : 'Nuevo Producto'}
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
                                        placeholder="Ej: Hamburguesa Doble"
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
                                        placeholder="Descripción del producto"
                                        className={`${inputClass} resize-none`}
                                        value={f.state.value}
                                        onChange={(e) => f.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="precio_base">
                            {(f) => (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Precio Base *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className={inputClass}
                                        value={f.state.value}
                                        onChange={(e) =>
                                            f.handleChange(
                                                e.target.value === ''
                                                    ? 0
                                                    : Number(e.target.value)
                                            )
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

                        <form.Field name="disponible">
                            {(f) => (
                                <label className="flex items-center gap-2 cursor-pointer select-none mt-1">
                                    <input
                                        type="checkbox"
                                        checked={f.state.value}
                                        onChange={(e) => f.handleChange(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Producto disponible para la venta
                                    </span>
                                </label>
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
                                            : productoToEdit
                                            ? 'Actualizar'
                                            : 'Guardar'}
                                    </button>
                                )}
                            </form.Subscribe>
                        </div>
                    </form>
                </Modal>
            )}
        </main>
    );
};