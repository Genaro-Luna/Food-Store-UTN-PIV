import React, { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Modal } from '@/shared/components/Modal';
import {
    inputClass,
    labelClass,
    fieldErrorClass,
    cancelButtonClass,
    submitButtonClass,
} from '@/shared/styles/form';
import type { Producto, ProductoFormValues } from '../types/producto.types';

interface ProductFormModalProps {
    isOpen: boolean;
    producto: Producto | null; // null = alta, objeto = edición
    onClose: () => void;
    onSubmit: (data: ProductoFormValues) => Promise<unknown>;
}

const valoresIniciales = (producto: Producto | null): ProductoFormValues => ({
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    precio_base: producto ? Number(producto.precio_base) : 0,
    disponible: producto?.disponible ?? true,
});

/** Formulario de alta y edición de productos (TanStack Form dentro del Modal compartido). */
export const ProductFormModal: React.FC<ProductFormModalProps> = ({
    isOpen,
    producto,
    onClose,
    onSubmit,
}) => {
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm({
        defaultValues: valoresIniciales(null),
        validators: {
            onSubmit: ({ value }) => {
                const errors: Partial<Record<keyof ProductoFormValues, string>> = {};
                if (!value.nombre.trim()) {
                    errors.nombre = 'El nombre del producto es obligatorio';
                }
                if (Number.isNaN(value.precio_base) || value.precio_base < 0) {
                    errors.precio_base = 'El precio no puede ser negativo';
                }
                return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
            },
        },
        onSubmit: async ({ value }) => {
            setApiError(null);
            try {
                await onSubmit({
                    nombre: value.nombre.trim(),
                    descripcion: value.descripcion.trim(),
                    precio_base: Number(value.precio_base),
                    disponible: value.disponible,
                });
                onClose();
            } catch (e) {
                setApiError(e instanceof Error ? e.message : 'No se pudo guardar el producto');
            }
        },
    });

    useEffect(() => {
        if (isOpen) {
            setApiError(null);
            form.reset(valoresIniciales(producto));
        }
    }, [isOpen, producto, form]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={producto ? 'Editar Producto' : 'Nuevo Producto'}
            apiError={apiError}
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="flex flex-col gap-4"
            >
                <form.Field name="nombre">
                    {(f) => (
                        <div>
                            <label htmlFor="producto-nombre" className={labelClass}>
                                Nombre *
                            </label>
                            <input
                                id="producto-nombre"
                                type="text"
                                placeholder="Ej: Hamburguesa Doble"
                                className={inputClass}
                                value={f.state.value}
                                onChange={(e) => f.handleChange(e.target.value)}
                            />
                            {f.state.meta.errors.map((err) => (
                                <p key={String(err)} className={fieldErrorClass}>
                                    {String(err)}
                                </p>
                            ))}
                        </div>
                    )}
                </form.Field>

                <form.Field name="descripcion">
                    {(f) => (
                        <div>
                            <label htmlFor="producto-descripcion" className={labelClass}>
                                Descripción
                            </label>
                            <textarea
                                id="producto-descripcion"
                                rows={3}
                                placeholder="Descripción del producto"
                                className={`${inputClass} resize-none`}
                                value={f.state.value}
                                onChange={(e) => f.handleChange(e.target.value)}
                            />
                        </div>
                    )}
                </form.Field>

                <form.Field name="precio_base">
                    {(f) => (
                        <div>
                            <label htmlFor="producto-precio" className={labelClass}>
                                Precio Base *
                            </label>
                            <input
                                id="producto-precio"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className={inputClass}
                                value={f.state.value}
                                onChange={(e) =>
                                    f.handleChange(e.target.value === '' ? 0 : Number(e.target.value))
                                }
                            />
                            {f.state.meta.errors.map((err) => (
                                <p key={String(err)} className={fieldErrorClass}>
                                    {String(err)}
                                </p>
                            ))}
                        </div>
                    )}
                </form.Field>

                <form.Field name="disponible">
                    {(f) => (
                        <label className="flex items-center gap-2 cursor-pointer select-none mt-1">
                            <input
                                type="checkbox"
                                checked={f.state.value}
                                onChange={(e) => f.handleChange(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Producto disponible para la venta
                            </span>
                        </label>
                    )}
                </form.Field>

                <div className="flex justify-end gap-3 mt-2">
                    <button type="button" onClick={onClose} className={cancelButtonClass}>
                        Cancelar
                    </button>
                    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
                        {([canSubmit, isSubmitting]) => (
                            <button
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                                className={submitButtonClass}
                            >
                                {isSubmitting ? 'Guardando...' : producto ? 'Actualizar' : 'Guardar'}
                            </button>
                        )}
                    </form.Subscribe>
                </div>
            </form>
        </Modal>
    );
};
