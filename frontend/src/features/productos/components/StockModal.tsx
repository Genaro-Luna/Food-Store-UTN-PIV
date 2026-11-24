import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { handleApiError } from '@/shared/api/handleApiError';
import { Button } from '@/shared/ui/Button';
import { Campo, Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { useActualizarStock } from '../hooks/useProductos';
import type { Producto } from '../types/producto.types';

interface StockModalProps {
    producto: Producto;
    onCerrar: () => void;
}

interface StockFormValues {
    stock: string;
    disponible: boolean;
}

/** PATCH /productos/{id}/stock: cambia stock y disponibilidad sin tocar el resto. */
export const StockModal: React.FC<StockModalProps> = ({ producto, onCerrar }) => {
    const actualizar = useActualizarStock();
    const [errorApi, setErrorApi] = useState<string | null>(null);

    const form = useForm({
        defaultValues: { stock: String(producto.stock), disponible: producto.disponible } as StockFormValues,
        validators: {
            onSubmit: ({ value }) =>
                /^\d+$/.test(value.stock.trim())
                    ? undefined
                    : { fields: { stock: 'El stock debe ser un entero mayor o igual a 0' } },
        },
        onSubmit: async ({ value }) => {
            setErrorApi(null);
            try {
                await actualizar.mutateAsync({
                    id: producto.id,
                    data: { stock: Number(value.stock), disponible: value.disponible },
                });
                onCerrar();
            } catch (error) {
                setErrorApi(handleApiError(error));
            }
        },
    });

    return (
        <Modal abierto titulo={`Stock de ${producto.nombre}`} onCerrar={onCerrar} error={errorApi}>
            <form
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void form.handleSubmit();
                }}
                className="flex flex-col gap-4"
            >
                <form.Field name="stock">
                    {(field) => (
                        <Campo etiqueta="Unidades en stock" htmlFor="stock-cantidad" errores={field.state.meta.errors}>
                            <Input
                                id="stock-cantidad"
                                type="number"
                                min={0}
                                step={1}
                                inputMode="numeric"
                                autoFocus
                                value={field.state.value}
                                invalido={field.state.meta.errors.length > 0}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        </Campo>
                    )}
                </form.Field>

                <form.Field name="disponible">
                    {(field) => (
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                className="h-4 w-4 accent-orange-600"
                                checked={field.state.value}
                                onChange={(e) => field.handleChange(e.target.checked)}
                            />
                            Disponible para la venta
                        </label>
                    )}
                </form.Field>

                <div className="mt-2 flex justify-end gap-3">
                    <Button variante="secundario" onClick={onCerrar}>
                        Cancelar
                    </Button>
                    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                        {([canSubmit, isSubmitting]) => (
                            <Button type="submit" disabled={!canSubmit} cargando={isSubmitting}>
                                Guardar
                            </Button>
                        )}
                    </form.Subscribe>
                </div>
            </form>
        </Modal>
    );
};
