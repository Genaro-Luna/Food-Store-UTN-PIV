import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useCategorias } from '@/features/categorias/hooks/useCategorias';
import { handleApiError } from '@/shared/api/handleApiError';
import { Button } from '@/shared/ui/Button';
import { Campo, Input, Select, Textarea } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { useGuardarProducto } from '../hooks/useProductos';
import type { Producto, ProductoPayload } from '../types/producto.types';

interface ProductoFormModalProps {
    /** null = alta; un producto = edición. */
    producto: Producto | null;
    onCerrar: () => void;
}

/** Los inputs manejan texto; se convierte a número al enviar. */
interface ProductoFormValues {
    nombre: string;
    descripcion: string;
    precio_base: string;
    categoria_id: string;
    imagen_url: string;
    stock: string;
    disponible: boolean;
}

const URL_VALIDA = /^https?:\/\/\S+$/i;
const ENTERO = /^\d+$/;

/** Se monta solo mientras está abierto, con los valores del producto elegido. */
export const ProductoFormModal: React.FC<ProductoFormModalProps> = ({ producto, onCerrar }) => {
    const { data: categorias = [], isLoading: cargandoCategorias } = useCategorias();
    const guardar = useGuardarProducto();
    const [errorApi, setErrorApi] = useState<string | null>(null);

    // Si la categoría del producto fue dada de baja, no figura en el listado de activas.
    const categoriaDadaDeBaja =
        producto && !cargandoCategorias && !categorias.some((c) => c.id === producto.categoria_id)
            ? producto.categoria
            : null;

    const form = useForm({
        defaultValues: {
            nombre: producto?.nombre ?? '',
            descripcion: producto?.descripcion ?? '',
            precio_base: producto ? String(producto.precio_base) : '',
            categoria_id: producto ? String(producto.categoria_id) : '',
            imagen_url: producto?.imagen_url ?? '',
            stock: producto ? String(producto.stock) : '0',
            disponible: producto?.disponible ?? true,
        } as ProductoFormValues,
        // Mismas reglas que ProductoCreate en el backend
        validators: {
            onSubmit: ({ value }) => {
                const fields: Partial<Record<keyof ProductoFormValues, string>> = {};
                const nombre = value.nombre.trim();
                if (!nombre || nombre.length > 150) fields.nombre = 'El nombre es obligatorio (máximo 150 caracteres)';
                if (value.descripcion.trim().length > 1000) fields.descripcion = 'La descripción admite hasta 1000 caracteres';
                const precio = Number(value.precio_base);
                if (value.precio_base.trim() === '' || !Number.isFinite(precio) || precio < 0) {
                    fields.precio_base = 'Ingresá un precio mayor o igual a 0';
                }
                if (!value.categoria_id) fields.categoria_id = 'Elegí una categoría';
                const url = value.imagen_url.trim();
                if (url && (!URL_VALIDA.test(url) || url.length > 500)) {
                    fields.imagen_url = 'Ingresá una URL que empiece con http:// o https://';
                }
                if (!ENTERO.test(value.stock.trim())) fields.stock = 'El stock debe ser un entero mayor o igual a 0';
                return Object.keys(fields).length > 0 ? { fields } : undefined;
            },
        },
        onSubmit: async ({ value }) => {
            setErrorApi(null);
            const data: ProductoPayload = {
                nombre: value.nombre.trim(),
                descripcion: value.descripcion.trim() || null,
                precio_base: Number(value.precio_base),
                categoria_id: Number(value.categoria_id),
                imagen_url: value.imagen_url.trim() || null,
                stock: Number(value.stock),
                disponible: value.disponible,
            };
            try {
                if (producto) {
                    // Si la categoría no cambió no se envía: así se puede editar un producto
                    // cuya categoría está dada de baja sin que el backend responda 404.
                    const { categoria_id, ...resto } = data;
                    await guardar.mutateAsync({
                        id: producto.id,
                        data: categoria_id === producto.categoria_id ? resto : data,
                    });
                } else {
                    await guardar.mutateAsync({ data });
                }
                onCerrar();
            } catch (error) {
                setErrorApi(handleApiError(error));
            }
        },
    });

    return (
        <Modal abierto titulo={producto ? 'Editar producto' : 'Nuevo producto'} onCerrar={onCerrar} error={errorApi}>
            <form
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void form.handleSubmit();
                }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
                <div className="sm:col-span-2">
                    <form.Field name="nombre">
                        {(field) => (
                            <Campo etiqueta="Nombre *" htmlFor="producto-nombre" errores={field.state.meta.errors}>
                                <Input
                                    id="producto-nombre"
                                    autoFocus
                                    maxLength={150}
                                    value={field.state.value}
                                    invalido={field.state.meta.errors.length > 0}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </Campo>
                        )}
                    </form.Field>
                </div>

                <div className="sm:col-span-2">
                    <form.Field name="descripcion">
                        {(field) => (
                            <Campo etiqueta="Descripción" htmlFor="producto-descripcion" errores={field.state.meta.errors}>
                                <Textarea
                                    id="producto-descripcion"
                                    rows={2}
                                    maxLength={1000}
                                    value={field.state.value}
                                    invalido={field.state.meta.errors.length > 0}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </Campo>
                        )}
                    </form.Field>
                </div>

                <form.Field name="precio_base">
                    {(field) => (
                        <Campo etiqueta="Precio *" htmlFor="producto-precio" errores={field.state.meta.errors}>
                            <Input
                                id="producto-precio"
                                type="number"
                                min={0}
                                step="0.01"
                                inputMode="decimal"
                                value={field.state.value}
                                invalido={field.state.meta.errors.length > 0}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        </Campo>
                    )}
                </form.Field>

                <form.Field name="categoria_id">
                    {(field) => (
                        <Campo etiqueta="Categoría *" htmlFor="producto-categoria" errores={field.state.meta.errors}>
                            <Select
                                id="producto-categoria"
                                disabled={cargandoCategorias}
                                value={field.state.value}
                                invalido={field.state.meta.errors.length > 0}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            >
                                <option value="">{cargandoCategorias ? 'Cargando...' : 'Elegí una categoría'}</option>
                                {categorias.map((c) => (
                                    <option key={c.id} value={String(c.id)}>
                                        {c.nombre}
                                    </option>
                                ))}
                                {categoriaDadaDeBaja && (
                                    <option value={String(categoriaDadaDeBaja.id)}>
                                        {categoriaDadaDeBaja.nombre} (dada de baja)
                                    </option>
                                )}
                            </Select>
                        </Campo>
                    )}
                </form.Field>

                <div className="sm:col-span-2">
                    <form.Field name="imagen_url">
                        {(field) => (
                            <Campo
                                etiqueta="URL de la imagen"
                                htmlFor="producto-imagen"
                                errores={field.state.meta.errors}
                                ayuda="Opcional. Si no carga, se muestra un ícono."
                            >
                                <Input
                                    id="producto-imagen"
                                    type="url"
                                    maxLength={500}
                                    placeholder="https://..."
                                    value={field.state.value}
                                    invalido={field.state.meta.errors.length > 0}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </Campo>
                        )}
                    </form.Field>
                </div>

                <form.Field name="stock">
                    {(field) => (
                        <Campo etiqueta="Stock *" htmlFor="producto-stock" errores={field.state.meta.errors}>
                            <Input
                                id="producto-stock"
                                type="number"
                                min={0}
                                step={1}
                                inputMode="numeric"
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
                        <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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

                <div className="mt-2 flex justify-end gap-3 sm:col-span-2">
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
