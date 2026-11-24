import React from 'react';

const CONTROL =
    'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 disabled:opacity-60 dark:bg-gray-700 dark:text-gray-100';
const NORMAL = 'border-gray-300 focus:border-orange-500 focus:ring-orange-200 dark:border-gray-600';
const INVALIDO = 'border-red-400 focus:border-red-500 focus:ring-red-200';

interface ControlProps {
    /** Marca el control en rojo cuando el campo tiene errores. */
    invalido?: boolean;
}

const clases = (invalido: boolean | undefined, extra: string) =>
    `${CONTROL} ${invalido ? INVALIDO : NORMAL} ${extra}`;

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & ControlProps> = ({
    invalido,
    className = '',
    ...props
}) => <input aria-invalid={invalido} className={clases(invalido, className)} {...props} />;

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & ControlProps> = ({
    invalido,
    className = '',
    children,
    ...props
}) => (
    <select aria-invalid={invalido} className={clases(invalido, className)} {...props}>
        {children}
    </select>
);

export const Textarea: React.FC<
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & ControlProps
> = ({ invalido, className = '', ...props }) => (
    <textarea aria-invalid={invalido} className={clases(invalido, className)} {...props} />
);

interface CampoProps {
    etiqueta: string;
    htmlFor: string;
    /** Errores del campo tal como los entrega TanStack Form (field.state.meta.errors). */
    errores?: readonly unknown[];
    ayuda?: string;
    children: React.ReactNode;
}

/** Etiqueta + control + mensajes de error de un campo de formulario. */
export const Campo: React.FC<CampoProps> = ({ etiqueta, htmlFor, errores = [], ayuda, children }) => {
    const mensajes = [...new Set(errores.filter(Boolean).map(String))];
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                {etiqueta}
            </label>
            {children}
            {ayuda && mensajes.length === 0 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{ayuda}</p>
            )}
            {mensajes.map((mensaje) => (
                <p key={mensaje} className="mt-1 text-xs text-red-500">
                    {mensaje}
                </p>
            ))}
        </div>
    );
};
