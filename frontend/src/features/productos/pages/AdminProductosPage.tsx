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
import { formatearPrecio } from '@/shared/utils/formato';
import { ImagenProducto } from '../components/ImagenProducto';
import { ProductoFormModal } from '../components/ProductoFormModal';
import { StockModal } from '../components/StockModal';
import { useEliminarProducto, useProductos } from '../hooks/useProductos';
import type { Producto } from '../types/producto.types';

// El panel pide un bloque grande y pagina del lado del cliente con TanStack Table.
const FILTROS_PANEL = { skip: 0, limit: 100 };

/** undefined = modal cerrado; null = alta; un producto = edición. */
type Edicion = Producto | null | undefined;

export const AdminProductosPage: React.FC = () => {
    const { data, isLoading, isError, error, refetch } = useProductos(FILTROS_PANEL);
    const { mutate: eliminar, isPending: eliminando } = useEliminarProducto();
    const [edicion, setEdicion] = useState<Edicion>(undefined);
    const [stock, setStock] = useState<Producto | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);

    const productos = useMemo(() => data?.items ?? [], [data]);

    const columns = useMemo<ColumnDef<Producto>[]>(
        () => [
            {
                id: 'imagen',
                header: '',
                enableSorting: false,
                cell: ({ row }) => (
                    <ImagenProducto url={row.original.imagen_url} nombre={row.original.nombre} className="h-12 w-12 rounded-lg" />
                ),
            },
            {
                accessorKey: 'nombre',
                header: 'Nombre',
                cell: ({ row }) => <span className="font-semibold">{row.original.nombre}</span>,
            },
            { id: 'categoria', accessorFn: (p) => p.categoria.nombre, header: 'Categoría' },
            {
                accessorKey: 'precio_base',
                header: 'Precio',
                cell: ({ row }) => formatearPrecio(row.original.precio_base),
            },
            {
                accessorKey: 'stock',
                header: 'Stock',
                cell: ({ row }) => (
                    <span className={row.original.stock === 0 ? 'font-bold text-red-600' : ''}>{row.original.stock}</span>
                ),
            },
            {
                accessorKey: 'disponible',
                header: 'Disponible',
                cell: ({ row }) => (
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            row.original.disponible
                                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200'
                                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        {row.original.disponible ? 'Sí' : 'No'}
                    </span>
                ),
            },
            {
                id: 'acciones',
                header: 'Acciones',
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex flex-wrap gap-2">
                        <Button variante="secundario" tamano="sm" onClick={() => setEdicion(row.original)}>
                            Editar
                        </Button>
                        <Button variante="secundario" tamano="sm" onClick={() => setStock(row.original)}>
                            Stock
                        </Button>
                        <Button
                            variante="peligro"
                            tamano="sm"
                            disabled={eliminando}
                            onClick={() => {
                                if (window.confirm(`¿Eliminar "${row.original.nombre}"? Deja de mostrarse en el catálogo.`)) {
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
        data: productos,
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
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Productos</h2>
                <Button onClick={() => setEdicion(null)}>Nuevo producto</Button>
            </div>
            {data && data.total > productos.length && (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                    Se muestran los primeros {productos.length} de {data.total} productos.
                </p>
            )}

            {isLoading ? (
                <SkeletonTabla />
            ) : isError ? (
                <EstadoError mensaje={error?.message ?? 'No se pudieron cargar los productos.'} onReintentar={() => void refetch()} />
            ) : (
                <DataTable
                    table={table}
                    totalItems={productos.length}
                    mensajeVacio="No hay productos cargados."
                    accionVacio={{ etiqueta: 'Crear el primero', onClick: () => setEdicion(null) }}
                />
            )}

            {edicion !== undefined && <ProductoFormModal producto={edicion} onCerrar={() => setEdicion(undefined)} />}
            {stock && <StockModal producto={stock} onCerrar={() => setStock(null)} />}
        </section>
    );
};
