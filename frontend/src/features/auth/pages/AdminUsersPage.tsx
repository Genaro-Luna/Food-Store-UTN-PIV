import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { DataTable } from '@/shared/components/DataTable';
import { LoadingState, ErrorState } from '@/shared/components/UiStates';
import type { Role, UsuarioAuth } from '../types/auth.types';
import { useAuth } from '../hooks/useAuth';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { RoleBadge } from '../components/RoleBadge';

export const AdminUsersPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const { usuarios, isLoading, isError, error, refetch, activar, desactivar, isUpdating } =
        useAdminUsers();
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = useMemo<ColumnDef<UsuarioAuth>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
            },
            {
                accessorKey: 'username',
                header: 'Usuario',
                cell: (info) => (
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {info.getValue<string>()}
                    </span>
                ),
            },
            {
                accessorKey: 'full_name',
                header: 'Nombre Completo',
            },
            {
                accessorKey: 'email',
                header: 'Email',
            },
            {
                accessorKey: 'role',
                header: 'Rol',
                cell: (info) => <RoleBadge role={info.getValue<Role>()} />,
            },
            {
                accessorKey: 'disabled',
                header: 'Estado',
                cell: (info) => {
                    const disabled = info.getValue<boolean>();
                    return (
                        <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                disabled
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                            }`}
                        >
                            {disabled ? 'Desactivado' : 'Activo'}
                        </span>
                    );
                },
            },
            {
                id: 'acciones',
                header: 'Acciones',
                enableSorting: false,
                cell: ({ row }) => {
                    const u = row.original;
                    const isSelf = currentUser?.id === u.id;
                    return (
                        <div className="flex gap-2">
                            {u.disabled ? (
                                <button
                                    type="button"
                                    onClick={() => activar(u.id)}
                                    disabled={isUpdating}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700 disabled:opacity-50 active:scale-95 transition"
                                >
                                    Activar
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => desactivar(u.id)}
                                    disabled={isSelf || isUpdating}
                                    title={
                                        isSelf
                                            ? 'No puedes desactivar tu propia cuenta'
                                            : undefined
                                    }
                                    className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition"
                                >
                                    Desactivar
                                </button>
                            )}
                        </div>
                    );
                },
            },
        ],
        [activar, desactivar, isUpdating, currentUser?.id]
    );

    const table = useReactTable({
        data: usuarios,
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

    if (isLoading) return <LoadingState message="Cargando usuarios..." />;
    if (isError)
        return (
            <ErrorState
                message={(error as Error)?.message || 'Error al cargar usuarios'}
                onRetry={() => refetch()}
            />
        );

    return (
        <main className="max-w-5xl mx-auto p-6 mt-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Administración de Usuarios
                </h2>
            </div>

            <DataTable
                table={table}
                totalItems={usuarios.length}
                emptyMessage="No hay usuarios registrados."
            />
        </main>
    );
};