import React, { useState } from 'react';
import { useCategorias } from '@/features/categorias/hooks/useCategorias';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Paginacion } from '@/shared/components/Paginacion';
import { SkeletonTarjetas } from '@/shared/components/Skeleton';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Input, Select } from '@/shared/ui/Input';
import { ProductoCard } from '../components/ProductoCard';
import { useProductos } from '../hooks/useProductos';

const POR_PAGINA = 6;

export const CatalogoPage: React.FC = () => {
    const [texto, setTexto] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [pagina, setPagina] = useState(0);
    const busqueda = useDebounce(texto.trim());

    const { data: categorias = [] } = useCategorias();
    // Paginación en el servidor: skip = página × limit
    const { data, isLoading, isError, error, refetch, isPlaceholderData } = useProductos({
        skip: pagina * POR_PAGINA,
        limit: POR_PAGINA,
        search: busqueda || undefined,
        categoria_id: categoriaId ? Number(categoriaId) : undefined,
    });

    const productos = data?.items ?? [];
    const total = data?.total ?? 0;
    const hayFiltros = busqueda !== '' || categoriaId !== '';

    const limpiarFiltros = () => {
        setTexto('');
        setCategoriaId('');
        setPagina(0);
    };

    return (
        <section>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Nuestro menú</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Elegí tus productos y armá tu pedido.</p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_16rem]">
                <Input
                    type="search"
                    aria-label="Buscar productos"
                    placeholder="Buscar por nombre..."
                    maxLength={100}
                    value={texto}
                    onChange={(e) => {
                        setTexto(e.target.value);
                        setPagina(0);
                    }}
                />
                <Select
                    aria-label="Filtrar por categoría"
                    value={categoriaId}
                    onChange={(e) => {
                        setCategoriaId(e.target.value);
                        setPagina(0);
                    }}
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                            {c.nombre}
                        </option>
                    ))}
                </Select>
            </div>

            {isLoading ? (
                <SkeletonTarjetas cantidad={POR_PAGINA} />
            ) : isError ? (
                <EstadoError mensaje={error?.message ?? 'No se pudo cargar el catálogo.'} onReintentar={() => void refetch()} />
            ) : productos.length === 0 ? (
                <EstadoVacio
                    icono="🔍"
                    titulo={hayFiltros ? 'No hay productos que coincidan con la búsqueda.' : 'Todavía no hay productos en el menú.'}
                    accion={hayFiltros ? { etiqueta: 'Limpiar filtros', onClick: limpiarFiltros } : undefined}
                />
            ) : (
                <>
                    <div
                        className={`grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
                            isPlaceholderData ? 'opacity-60' : ''
                        }`}
                    >
                        {productos.map((p) => (
                            <ProductoCard key={p.id} producto={p} />
                        ))}
                    </div>
                    <div className="mt-6">
                        <Paginacion
                            pagina={pagina}
                            totalPaginas={Math.ceil(total / POR_PAGINA)}
                            totalItems={total}
                            onCambiar={setPagina}
                            deshabilitado={isPlaceholderData}
                        />
                    </div>
                </>
            )}
        </section>
    );
};
