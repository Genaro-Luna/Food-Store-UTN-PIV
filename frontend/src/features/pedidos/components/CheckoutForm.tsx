import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { handleApiError } from '@/shared/api/handleApiError';
import { Button } from '@/shared/ui/Button';
import { Campo, Input, Select, Textarea } from '@/shared/ui/Input';
import { FORMAS_DE_PAGO } from '../constants';
import type { FormaPago } from '../types/pedido.types';

export interface DatosEntrega {
    direccion_entrega: string;
    forma_pago: FormaPago;
    notas: string;
}

interface CheckoutFormProps {
    /** Crea el pedido; si la API responde con error, el formulario lo muestra. */
    onConfirmar: (datos: DatosEntrega) => Promise<void>;
}

/** Datos de entrega y pago del pedido, con las reglas de PedidoCreate. */
export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onConfirmar }) => {
    const [errorApi, setErrorApi] = useState<string | null>(null);

    const form = useForm({
        defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO', notas: '' } as DatosEntrega,
        validators: {
            onSubmit: ({ value }) => {
                const fields: Partial<Record<keyof DatosEntrega, string>> = {};
                const direccion = value.direccion_entrega.trim();
                if (direccion.length < 5 || direccion.length > 200) {
                    fields.direccion_entrega = 'La dirección debe tener entre 5 y 200 caracteres';
                }
                if (value.notas.trim().length > 500) fields.notas = 'Las notas admiten hasta 500 caracteres';
                return Object.keys(fields).length > 0 ? { fields } : undefined;
            },
        },
        onSubmit: async ({ value }) => {
            setErrorApi(null);
            try {
                await onConfirmar({
                    direccion_entrega: value.direccion_entrega.trim(),
                    forma_pago: value.forma_pago,
                    notas: value.notas.trim(),
                });
            } catch (error) {
                // 400: sin stock, producto no disponible o repetido; 404: producto inexistente
                setErrorApi(handleApiError(error));
            }
        },
    });

    return (
        <form
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
            }}
            className="flex flex-col gap-4"
        >
            {errorApi && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                    {errorApi}
                </div>
            )}

            <form.Field name="direccion_entrega">
                {(field) => (
                    <Campo etiqueta="Dirección de entrega *" htmlFor="checkout-direccion" errores={field.state.meta.errors}>
                        <Input
                            id="checkout-direccion"
                            autoComplete="street-address"
                            maxLength={200}
                            placeholder="Calle, número, piso, ciudad"
                            value={field.state.value}
                            invalido={field.state.meta.errors.length > 0}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                    </Campo>
                )}
            </form.Field>

            <form.Field name="forma_pago">
                {(field) => (
                    <Campo etiqueta="Forma de pago *" htmlFor="checkout-pago" errores={field.state.meta.errors}>
                        <Select
                            id="checkout-pago"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value as FormaPago)}
                        >
                            {Object.entries(FORMAS_DE_PAGO).map(([valor, etiqueta]) => (
                                <option key={valor} value={valor}>
                                    {etiqueta}
                                </option>
                            ))}
                        </Select>
                    </Campo>
                )}
            </form.Field>

            <form.Field name="notas">
                {(field) => (
                    <Campo etiqueta="Notas" htmlFor="checkout-notas" errores={field.state.meta.errors} ayuda="Opcional: timbre, referencias, aclaraciones.">
                        <Textarea
                            id="checkout-notas"
                            rows={3}
                            maxLength={500}
                            value={field.state.value}
                            invalido={field.state.meta.errors.length > 0}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                    </Campo>
                )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                    <Button type="submit" className="mt-2 w-full" disabled={!canSubmit} cargando={isSubmitting}>
                        {isSubmitting ? 'Enviando pedido...' : 'Confirmar pedido'}
                    </Button>
                )}
            </form.Subscribe>
        </form>
    );
};
