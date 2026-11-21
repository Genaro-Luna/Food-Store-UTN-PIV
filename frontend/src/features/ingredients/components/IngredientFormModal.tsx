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
import type { Ingrediente, IngredienteFormValues } from '../types/ingrediente.types';

interface IngredientFormModalProps {
    isOpen: boolean;
    ingrediente: Ingrediente | null; // null = alta, objeto = edición
    onClose: () => void;
    onSubmit: (data: IngredienteFormValues) => Promise<unknown>;
}

/** Formulario de alta y edición de ingredientes (TanStack Form dentro del Modal compartido). */
export const IngredientFormModal: React.FC<IngredientFormModalProps> = ({
    isOpen,
    ingrediente,
    onClose,
    onSubmit,
}) => {
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm({
        defaultValues: { nombre: '' } as IngredienteFormValues,
        validators: {
            onSubmit: ({ value }) =>
                value.nombre.trim()
                    ? undefined
                    : { fields: { nombre: 'El nombre del ingrediente es obligatorio' } },
        },
        onSubmit: async ({ value }) => {
            setApiError(null);
            try {
                await onSubmit({ nombre: value.nombre.trim() });
                onClose();
            } catch (e) {
                setApiError(e instanceof Error ? e.message : 'No se pudo guardar el ingrediente');
            }
        },
    });

    useEffect(() => {
        if (isOpen) {
            setApiError(null);
            form.reset({ nombre: ingrediente?.nombre ?? '' });
        }
    }, [isOpen, ingrediente, form]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={ingrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
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
                            <label htmlFor="ingrediente-nombre" className={labelClass}>
                                Nombre *
                            </label>
                            <input
                                id="ingrediente-nombre"
                                type="text"
                                placeholder="Ej: Queso Cheddar"
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
                                {isSubmitting ? 'Guardando...' : ingrediente ? 'Actualizar' : 'Guardar'}
                            </button>
                        )}
                    </form.Subscribe>
                </div>
            </form>
        </Modal>
    );
};
