import React, { useMemo, useState } from 'react';
import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { useUsuarios } from '@/features/usuarios/hooks/useUsuarios';
import { DataTable } from '@/shared/components/DataTable';
import { EstadoError } from '@/shared/components/EstadoError';
import { SkeletonTabla } from '@/shared/components/Skeleton';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato';
import { ACCIONES, ESTADOS, FORMAS_DE_PAGO, TRANSICIONES } from '../constants';
import { PedidoDetalle } from '../components/PedidoDetalle';
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos';
import type { EstadoPedido, Pedido } from '../types/pedido.types';

const POR_PAGINA = 10;

export const AdminPedidosPage: React.FC = () => {
    const [estado, setEstado] = useState<EstadoPedido | ''>('');
    const [pagina, setPagina] = useState(0);
    const [detalle, setDetalle] = useState<Pedido | null>(null);

    // Filtro y paginación en el servidor: GET /pedidos?estado=...&skip=...&limit=...
    const { data, isLoading, isError, error, refetch, isPlaceholderData } = usePedidos({
        skip: pagina * POR_PAGINA,
        limit: POR_PAGINA,
        estado: estado || undefined,
    });
    const { data: usuarios } = useUsuarios();
    const { mutate: cambiarEstado, isPending } = useCambiarEstadoPedido();

    const pedidos = useMemo(() => data?.items ?? [], [data]);
    const total = data?.total ?? 0;

    // PedidoRead trae usuario_id: se muestra el username con el listado de usuarios.
    const nombres = useMemo(() => new Map((usuarios ?? []).map((u) => [u.id, u.username])), [usuarios]);

    const columns = useMemo<ColumnDef<Pedido>[]>(
        () => [
            { accessorKey: 'id', header: 'Pedido', cell: ({ row }) => <span className="font-semibold">#{row.original.id}</span> },
            { accessorKey: 'created_at', header: 'Fecha', cell: ({ row }) => formatearFecha(row.original.created_at) },
            {
                id: 'cliente',
                header: 'Cliente',
                cell: ({ row }) => nombres.get(row.original.usuario_id) ?? `Usuario #${row.original.usuario_id}`,
            },
            { accessorKey: 'total', header: 'Total', cell: ({ row }) => formatearPrecio(row.original.total) },
            { accessorKey: 'forma_pago', header: 'Pago', cell: ({ row }) => FORMAS_DE_PAGO[row.original.forma_pago] },
            { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
            {
                id: 'acciones',
                header: 'Acciones',
                cell: ({ row }) => {
                    const p = row.original;
                    return (
                        <div className="flex flex-wrap gap-2">
                            <Button variante="secundario" tamano="sm" onClick={() => setDetalle(p)}>
                                Detalle
                            </Button>
                            {/* Solo se ofrecen las transiciones válidas desde el estado actual */}
                            {TRANSICIONES[p.estado].map((siguiente) => (
                                <Button
                                    key={siguiente}
                                    variante={siguiente === 'CANCELADO' ? 'peligro' : 'exito'}
                                    tamano="sm"
                                    disabled={isPending}
                                    onClick={() => {
                                        if (
                                            siguiente !== 'CANCELADO' ||
                                            window.confirm(`¿Cancelar el pedido #${p.id}? Se restituye el stock.`)
                                        ) {
                                            cambiarEstado({ id: p.id, estado: siguiente });
                                        }
                                    }}
                                >
                                    {ACCIONES[siguiente]}
                                </Button>
                            ))}
                        </div>
                    );
                },
            },
        ],
        [nombres, cambiarEstado, isPending]
    );

    // Sin paginación ni orden del cliente: cada página llega ordenada del servidor (más recientes primero).
    const table = useReactTable({ data: pedidos, columns, getCoreRowModel: getCoreRowModel(), enableSorting: false });

    return (
        <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Pedidos</h2>
                <Select
                    aria-label="Filtrar por estado"
                    className="sm:w-56"
                    value={estado}
                    onChange={(e) => {
                        setEstado(e.target.value as EstadoPedido | '');
                        setPagina(0);
                    }}
                >
                    <option value="">Todos los estados</option>
                    {Object.entries(ESTADOS).map(([valor, etiqueta]) => (
                        <option key={valor} value={valor}>
                            {etiqueta}
                        </option>
                    ))}
                </Select>
            </div>

            {isLoading ? (
                <SkeletonTabla />
            ) : isError ? (
                <EstadoError mensaje={error?.message ?? 'No se pudieron cargar los pedidos.'} onReintentar={() => void refetch()} />
            ) : (
                <div className={isPlaceholderData ? 'opacity-60' : ''}>
                    <DataTable
                        table={table}
                        totalItems={total}
                        mensajeVacio={estado ? `No hay pedidos en estado ${ESTADOS[estado]}.` : 'Todavía no hay pedidos.'}
                        paginacionServidor={{
                            pagina,
                            totalPaginas: Math.ceil(total / POR_PAGINA),
                            onCambiar: setPagina,
                            deshabilitado: isPlaceholderData,
                        }}
                    />
                </div>
            )}

            {detalle && (
                <Modal abierto titulo={`Pedido #${detalle.id}`} onCerrar={() => setDetalle(null)}>
                    <PedidoDetalle
                        pedido={detalle}
                        abiertoInicial
                        subtitulo={nombres.get(detalle.usuario_id)}
                    />
                </Modal>
            )}
        </section>
    );
};
