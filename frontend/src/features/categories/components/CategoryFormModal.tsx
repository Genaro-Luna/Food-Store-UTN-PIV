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
import type { Categoria, CategoriaFormValues } from '../types/categoria.types';

interface CategoryFormModalProps {
    isOpen: boolean;
    categoria: Categoria | null; // null = alta, objeto = edición
    onClose: () => void;
    onSubmit: (data: CategoriaFormValues) => Promise<unknown>;
}

/** Formulario de alta y edición de categorías (TanStack Form dentro del Modal compartido). */
export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
    isOpen,
    categoria,
    onClose,
    onSubmit,
}) => {
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm({
        defaultValues: { nombre: '', descripcion: '' } as CategoriaFormValues,
        validators: {
            onSubmit: ({ value }) =>
                value.nombre.trim()
                    ? undefined
                    : { fields: { nombre: 'El nombre de la categoría es obligatorio' } },
        },
        onSubmit: async ({ value }) => {
            setApiError(null);
            try {
                await onSubmit({
                    nombre: value.nombre.trim(),
                    descripcion: value.descripcion.trim(),
                });
                onClose();
            } catch (e) {
                setApiError(e instanceof Error ? e.message : 'No se pudo guardar la categoría');
            }
        },
    });

    useEffect(() => {
        if (isOpen) {
            setApiError(null);
            form.reset({
                nombre: categoria?.nombre ?? '',
                descripcion: categoria?.descripcion ?? '',
            });
        }
    }, [isOpen, categoria, form]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={categoria ? 'Editar Categoría' : 'Nueva Categoría'}
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
                            <label htmlFor="categoria-nombre" className={labelClass}>
                                Nombre *
                            </label>
                            <input
                                id="categoria-nombre"
                                type="text"
                                placeholder="Ej: Hamburguesas"
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
                            <label htmlFor="categoria-descripcion" className={labelClass}>
                                Descripción
                            </label>
                            <textarea
                                id="categoria-descripcion"
                                rows={3}
                                placeholder="Descripción opcional de la categoría"
                                className={`${inputClass} resize-none`}
                                value={f.state.value}
                                onChange={(e) => f.handleChange(e.target.value)}
                            />
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
                                {isSubmitting ? 'Guardando...' : categoria ? 'Actualizar' : 'Guardar'}
                            </button>
                        )}
                    </form.Subscribe>
                </div>
            </form>
        </Modal>
    );
};
