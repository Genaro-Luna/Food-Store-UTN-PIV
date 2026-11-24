import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { formatearPrecio } from '@/shared/utils/formato';
import { ItemCarritoFila } from '../components/ItemCarritoFila';

export const CarritoPage: React.FC = () => {
    const items = useCartStore((s) => s.items);
    const total = useCartStore((s) => s.total());
    const vaciar = useCartStore((s) => s.vaciar);
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <EstadoVacio
                icono="🛒"
                titulo="Tu carrito está vacío"
                mensaje="Agregá productos desde el menú."
                accion={{ etiqueta: 'Ver el menú', onClick: () => navigate('/') }}
            />
        );
    }

    return (
        <section>
            <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Carrito</h1>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
                <Card className="px-4">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {items.map((item) => (
                            <ItemCarritoFila key={item.producto_id} item={item} />
                        ))}
                    </ul>
                </Card>

                <Card className="h-fit p-5">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">Resumen</h2>
                    <div className="mt-4 flex items-center justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                        <span>Total</span>
                        <span>{formatearPrecio(total)}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        El stock y el precio final se confirman al crear el pedido.
                    </p>
                    <Button className="mt-5 w-full" onClick={() => navigate('/checkout')}>
                        Confirmar pedido
                    </Button>
                    <Button
                        variante="fantasma"
                        className="mt-2 w-full"
                        onClick={() => {
                            if (window.confirm('¿Vaciar el carrito?')) vaciar();
                        }}
                    >
                        Vaciar carrito
                    </Button>
                </Card>
            </div>
        </section>
    );
};
