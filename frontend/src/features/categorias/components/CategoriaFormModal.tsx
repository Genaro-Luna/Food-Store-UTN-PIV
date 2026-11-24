import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { handleApiError } from '@/shared/api/handleApiError';
import { Button } from '@/shared/ui/Button';
import { Campo, Input, Textarea } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { useGuardarCategoria } from '../hooks/useCategorias';
import type { Categoria, CategoriaFormValues } from '../types/categoria.types';

interface CategoriaFormModalProps {
    /** null = alta; una categoría = edición. */
    categoria: Categoria | null;
    onCerrar: () => void;
}

/**
 * Se monta solo mientras está abierto: cada apertura arranca con los
 * valores de la categoría elegida y sin errores previos.
 */
export const CategoriaFormModal: React.FC<CategoriaFormModalProps> = ({ categoria, onCerrar }) => {
    const guardar = useGuardarCategoria();
    const [errorApi, setErrorApi] = useState<string | null>(null);

    const form = useForm({
        defaultValues: {
            nombre: categoria?.nombre ?? '',
            descripcion: categoria?.descripcion ?? '',
        } as CategoriaFormValues,
        // Mismas reglas que CategoriaCreate: nombre de 2 a 100, descripción hasta 500
        validators: {
            onSubmit: ({ value }) => {
                const fields: Partial<Record<keyof CategoriaFormValues, string>> = {};
                const nombre = value.nombre.trim();
                if (nombre.length < 2 || nombre.length > 100) {
                    fields.nombre = 'El nombre debe tener entre 2 y 100 caracteres';
                }
                if (value.descripcion.trim().length > 500) {
                    fields.descripcion = 'La descripción admite hasta 500 caracteres';
                }
                return Object.keys(fields).length > 0 ? { fields } : undefined;
            },
        },
        onSubmit: async ({ value }) => {
            setErrorApi(null);
            try {
                await guardar.mutateAsync({
                    id: categoria?.id,
                    data: {
                        nombre: value.nombre.trim(),
                        descripcion: value.descripcion.trim() || null,
                    },
                });
                onCerrar();
            } catch (error) {
                setErrorApi(handleApiError(error)); // 409: nombre duplicado
            }
        },
    });

    return (
        <Modal abierto titulo={categoria ? 'Editar categoría' : 'Nueva categoría'} onCerrar={onCerrar} error={errorApi}>
            <form
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void form.handleSubmit();
                }}
                className="flex flex-col gap-4"
            >
                <form.Field name="nombre">
                    {(field) => (
                        <Campo etiqueta="Nombre *" htmlFor="categoria-nombre" errores={field.state.meta.errors}>
                            <Input
                                id="categoria-nombre"
                                autoFocus
                                maxLength={100}
                                placeholder="Ej: Pizzas"
                                value={field.state.value}
                                invalido={field.state.meta.errors.length > 0}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        </Campo>
                    )}
                </form.Field>

                <form.Field name="descripcion">
                    {(field) => (
                        <Campo etiqueta="Descripción" htmlFor="categoria-descripcion" errores={field.state.meta.errors}>
                            <Textarea
                                id="categoria-descripcion"
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
