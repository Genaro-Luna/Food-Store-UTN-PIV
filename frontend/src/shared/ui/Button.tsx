import React from 'react';

type Variante = 'primario' | 'secundario' | 'peligro' | 'exito' | 'fantasma';
type Tamano = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variante?: Variante;
    tamano?: Tamano;
    /** Deshabilita el botón y muestra un indicador mientras dura la operación. */
    cargando?: boolean;
}

const VARIANTES: Record<Variante, string> = {
    primario: 'bg-orange-600 text-white hover:bg-orange-700',
    secundario:
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    peligro: 'bg-red-600 text-white hover:bg-red-700',
    exito: 'bg-green-600 text-white hover:bg-green-700',
    fantasma: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
};

const TAMANOS: Record<Tamano, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
};

export const Button: React.FC<ButtonProps> = ({
    variante = 'primario',
    tamano = 'md',
    cargando = false,
    type = 'button',
    disabled,
    className = '',
    children,
    ...props
}) => (
    <button
        type={type}
        disabled={disabled || cargando}
        aria-busy={cargando}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
        {...props}
    >
        {cargando && (
            <span
                aria-hidden="true"
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
        )}
        {children}
    </button>
);
