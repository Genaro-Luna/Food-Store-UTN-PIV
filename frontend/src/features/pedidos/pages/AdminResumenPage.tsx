import React from 'react';
import { EstadoError } from '@/shared/components/EstadoError';
import { Skeleton } from '@/shared/components/Skeleton';
import { formatearPrecio } from '@/shared/utils/formato';
import { TarjetaResumen } from '../components/TarjetaResumen';
import { useResumenPedidos } from '../hooks/usePedidos';

export const AdminResumenPage: React.FC = () => {
    const { data: resumen, isLoading, isError, error, refetch } = useResumenPedidos();

    return (
        <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Resumen</h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                «Hoy» se cuenta en horario de Argentina; los ingresos suman solo pedidos entregados.
            </p>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }, (_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl" />
                    ))}
                </div>
            ) : isError || !resumen ? (
                <EstadoError mensaje={error?.message ?? 'No se pudo cargar el resumen.'} onReintentar={() => void refetch()} />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <TarjetaResumen titulo="Pendientes" valor={String(resumen.pendientes)} icono="⏳" acento="border-l-amber-500" />
                    <TarjetaResumen titulo="En preparación" valor={String(resumen.en_preparacion)} icono="👨‍🍳" acento="border-l-sky-500" />
                    <TarjetaResumen titulo="Entregados" valor={String(resumen.entregados)} icono="✅" acento="border-l-green-500" />
                    <TarjetaResumen titulo="Cancelados" valor={String(resumen.cancelados)} icono="✖️" acento="border-l-gray-400" />
                    <TarjetaResumen titulo="Pedidos de hoy" valor={String(resumen.pedidos_hoy)} icono="📅" acento="border-l-orange-500" />
                    <TarjetaResumen
                        titulo="Ingresos (entregados)"
                        valor={formatearPrecio(resumen.ingresos_entregados)}
                        icono="💰"
                        acento="border-l-emerald-600"
                    />
                </div>
            )}
        </section>
    );
};
