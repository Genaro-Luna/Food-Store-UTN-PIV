import React, { useState } from 'react';

interface ImagenProductoProps {
    url: string | null;
    nombre: string;
    className?: string;
}

/** Imagen del producto con un ícono de reemplazo si no hay URL o no carga. */
export const ImagenProducto: React.FC<ImagenProductoProps> = ({ url, nombre, className = '' }) => {
    const [fallo, setFallo] = useState(false);

    if (!url || fallo) {
        return (
            <div
                role="img"
                aria-label={nombre}
                className={`flex items-center justify-center bg-orange-50 text-2xl dark:bg-gray-700 ${className}`}
            >
                🍔
            </div>
        );
    }
    return (
        <img
            src={url}
            alt={nombre}
            loading="lazy"
            onError={() => setFallo(true)}
            className={`object-cover ${className}`}
        />
    );
};
