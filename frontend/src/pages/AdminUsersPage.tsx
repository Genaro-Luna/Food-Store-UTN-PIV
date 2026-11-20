import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { CategoriaList } from '../components/CategoriaList';
import { LoadingState, ErrorState } from '../components/UiStates';
import {
    getAdminUsers,
    activateUser,
    deactivateUser,
} from '../api/auth.actions';
import type { UsuarioAuth } from '../types/auth.types';
import { useAuthStore } from '../store/authStore';

export const AdminUsersPage: React.FC = () => {
    const queryClient = useQueryClient();
    const currentUser = useAuthStore((s) => s.user);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [actionError, setActionError] = useState<string | null>(null);

    const {
        data: usuarios = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery<UsuarioAuth[]>({
        queryKey: ['admin-usuarios'],
        queryFn: getAdminUsers,
    });

    const activateMutation = useMutation({
        mutationFn: activateUser,
        onSuccess: () => {
            setActionError(null);
            queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
        },
        onError: (err: Error) => setActionError(err.message),
    });

    const deactivateMutation = useMutation({
        mutationFn: deactivateUser,
        onSuccess: () => {
            setActionError(null);
            queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
        },
        onError: (err: Error) => setActionError(err.message),
    });

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
                    <span className="font-semibold text-gray-900">
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
                cell: (info) => {
                    const role = info.getValue<string>();
                    return (
                        <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                                role === 'admin'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-700'
                            }`}
                        >
                            {role}
                        </span>
                    );
                },
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
                                    onClick={() => activateMutation.mutate(u.id)}
                                    disabled={activateMutation.isPending}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700 disabled:opacity-50 active:scale-95 transition"
                                >
                                    Activar
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => deactivateMutation.mutate(u.id)}
                                    disabled={isSelf || deactivateMutation.isPending}
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
        [activateMutation, deactivateMutation, currentUser?.id]
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
                <h2 className="text-2xl font-bold text-gray-800">
                    Administración de Usuarios
                </h2>
            </div>

            {actionError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex justify-between items-center">
                    <span>{actionError}</span>
                    <button
                        type="button"
                        onClick={() => setActionError(null)}
                        className="font-bold text-red-800 hover:underline text-xs"
                    >
                        Cerrar
                    </button>
                </div>
            )}

            <CategoriaList
                table={table}
                totalItems={usuarios.length}
                emptyMessage="No hay usuarios registrados."
            />
        </main>
    );
};