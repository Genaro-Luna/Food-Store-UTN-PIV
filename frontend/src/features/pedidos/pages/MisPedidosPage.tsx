import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Paginacion } from '@/shared/components/Paginacion';
import { SkeletonTabla } from '@/shared/components/Skeleton';
import { Button } from '@/shared/ui/Button';
import { PedidoDetalle } from '../components/PedidoDetalle';
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos';

const POR_PAGINA = 5;

export const MisPedidosPage: React.FC = () => {
    const [pagina, setPagina] = useState(0);
    const navigate = useNavigate();
    // El backend devuelve solo los pedidos del usuario de la cookie
    const { data, isLoading, isError, error, refetch, isPlaceholderData } = usePedidos({
        skip: pagina * POR_PAGINA,
        limit: POR_PAGINA,
    });
    const { mutate: cancelar, isPending: cancelando } = useCancelarPedido();

    const pedidos = data?.items ?? [];
    const total = data?.total ?? 0;

    return (
        <section>
            <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Mis pedidos</h1>

            {isLoading ? (
                <SkeletonTabla filas={3} />
            ) : isError ? (
                <EstadoError mensaje={error?.message ?? 'No se pudieron cargar tus pedidos.'} onReintentar={() => void refetch()} />
            ) : pedidos.length === 0 ? (
                <EstadoVacio
                    icono="🧾"
                    titulo="Todavía no hiciste pedidos"
                    accion={{ etiqueta: 'Ir al menú', onClick: () => navigate('/') }}
                />
            ) : (
                <>
                    <div className={`flex flex-col gap-4 ${isPlaceholderData ? 'opacity-60' : ''}`}>
                        {pedidos.map((pedido) => (
                            <PedidoDetalle
                                key={pedido.id}
                                pedido={pedido}
                                acciones={
                                    pedido.estado === 'PENDIENTE' && (
                                        <Button
                                            variante="peligro"
                                            tamano="sm"
                                            disabled={cancelando}
                                            onClick={() => {
                                                if (window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) cancelar(pedido.id);
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    )
                                }
                            />
                        ))}
                    </div>
                    <div className="mt-6">
                        <Paginacion
                            pagina={pagina}
                            totalPaginas={Math.ceil(total / POR_PAGINA)}
                            totalItems={total}
                            onCambiar={setPagina}
                            deshabilitado={isPlaceholderData}
                        />
                    </div>
                </>
            )}
        </section>
    );
};
