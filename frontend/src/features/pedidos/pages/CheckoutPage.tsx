import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Card } from '@/shared/ui/Card';
import { formatearPrecio } from '@/shared/utils/formato';
import { CheckoutForm, type DatosEntrega } from '../components/CheckoutForm';
import { useCrearPedido } from '../hooks/usePedidos';

export const CheckoutPage: React.FC = () => {
    const items = useCartStore((s) => s.items);
    const total = useCartStore((s) => s.total());
    const vaciar = useCartStore((s) => s.vaciar);
    const showNotification = useNotificationStore((s) => s.showNotification);
    const crearPedido = useCrearPedido();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <EstadoVacio
                icono="🛒"
                titulo="No hay productos para confirmar"
                accion={{ etiqueta: 'Ver el menú', onClick: () => navigate('/') }}
            />
        );
    }

    const confirmar = async (datos: DatosEntrega) => {
        // Solo se envían producto y cantidad: el backend copia nombre y precio actuales.
        const pedido = await crearPedido.mutateAsync({
            items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
            forma_pago: datos.forma_pago,
            direccion_entrega: datos.direccion_entrega,
            notas: datos.notas || null,
        });
        vaciar();
        showNotification(`Pedido #${pedido.id} confirmado por ${formatearPrecio(pedido.total)}`);
        navigate('/mis-pedidos', { replace: true });
    };

    return (
        <section>
            <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Confirmar pedido</h1>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
                <Card className="p-6">
                    <CheckoutForm onConfirmar={confirmar} />
                </Card>

                <Card className="h-fit p-5">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Tu pedido</h2>
                        <Link to="/carrito" className="text-sm text-orange-600 hover:underline dark:text-orange-400">
                            Modificar
                        </Link>
                    </div>
                    <ul className="mt-3 divide-y divide-gray-100 text-sm dark:divide-gray-700">
                        {items.map((i) => (
                            <li key={i.producto_id} className="flex justify-between gap-3 py-2">
                                <span>
                                    {i.cantidad} × {i.nombre}
                                </span>
                                <span className="font-medium">{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-lg font-bold dark:border-gray-700">
                        <span>Total</span>
                        <span>{formatearPrecio(total)}</span>
                    </div>
                </Card>
            </div>
        </section>
    );
};
