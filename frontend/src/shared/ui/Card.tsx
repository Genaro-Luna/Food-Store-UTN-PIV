import React from 'react';

/** Contenedor con fondo, borde y sombra, adaptado al modo oscuro. */
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className = '',
    children,
    ...props
}) => (
    <div
        className={`rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
        {...props}
    >
        {children}
    </div>
);
