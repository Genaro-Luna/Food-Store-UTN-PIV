import React, { useMemo, useState } from 'react';
import {
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { DataTable } from '@/shared/components/DataTable';
import { EstadoError } from '@/shared/components/EstadoError';
import { SkeletonTabla } from '@/shared/components/Skeleton';
import { Button } from '@/shared/ui/Button';
import { formatearFecha } from '@/shared/utils/formato';
import { RolBadge } from '../components/RolBadge';
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios';
import type { Usuario } from '../types/usuario.types';

export const AdminUsuariosPage: React.FC = () => {
    const { usuario: actual } = useAuth();
    const { data: usuarios = [], isLoading, isError, error, refetch } = useUsuarios();
    const { mutate: cambiarEstado, isPending } = useCambiarEstadoUsuario();
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = useMemo<ColumnDef<Usuario>[]>(
        () => [
            {
                accessorKey: 'username',
                header: 'Usuario',
                cell: ({ row }) => <span className="font-semibold">{row.original.username}</span>,
            },
            { accessorKey: 'full_name', header: 'Nombre' },
            { accessorKey: 'email', header: 'Email' },
            {
                accessorKey: 'role',
                header: 'Rol',
                cell: ({ row }) => <RolBadge rol={row.original.role} />,
            },
            {
                accessorKey: 'disabled',
                header: 'Estado',
                cell: ({ row }) => (
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            row.original.disabled
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200'
                                : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200'
                        }`}
                    >
                        {row.original.disabled ? 'Desactivado' : 'Activo'}
                    </span>
                ),
            },
            {
                accessorKey: 'created_at',
                header: 'Alta',
                cell: ({ row }) => formatearFecha(row.original.created_at),
            },
            {
                id: 'acciones',
                header: 'Acciones',
                enableSorting: false,
                cell: ({ row }) => {
                    const u = row.original;
                    if (u.disabled) {
                        return (
                            <Button
                                variante="exito"
                                tamano="sm"
                                disabled={isPending}
                                onClick={() => cambiarEstado({ id: u.id, activar: true })}
                            >
                                Activar
                            </Button>
                        );
                    }
                    // El backend rechaza la autodesactivación (400); en la fila propia ni se ofrece.
                    if (u.id === actual?.id) {
                        return <span className="text-xs text-gray-400">Tu cuenta</span>;
                    }
                    return (
                        <Button
                            variante="peligro"
                            tamano="sm"
                            disabled={isPending}
                            onClick={() => cambiarEstado({ id: u.id, activar: false })}
                        >
                            Desactivar
                        </Button>
                    );
                },
            },
        ],
        [actual?.id, cambiarEstado, isPending]
    );

    const table = useReactTable({
        data: usuarios,
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
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Usuarios</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Una cuenta desactivada no puede iniciar sesión ni usar la sesión abierta.
            </p>

            {isLoading ? (
                <SkeletonTabla />
            ) : isError ? (
                <EstadoError mensaje={error?.message ?? 'No se pudieron cargar los usuarios.'} onReintentar={() => void refetch()} />
            ) : (
                <DataTable table={table} totalItems={usuarios.length} mensajeVacio="No hay usuarios registrados." />
            )}
        </section>
    );
};
