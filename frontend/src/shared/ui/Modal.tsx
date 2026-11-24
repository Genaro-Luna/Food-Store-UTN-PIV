import React, { useEffect } from 'react';

interface ModalProps {
    abierto: boolean;
    onCerrar: () => void;
    titulo: string;
    /** Mensaje de error de la API (409, 422...) mostrado sobre el formulario. */
    error?: string | null;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ abierto, onCerrar, titulo, error, children }) => {
    // Escape cierra el modal
    useEffect(() => {
        if (!abierto) return;
        const alPresionar = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCerrar();
        };
        window.addEventListener('keydown', alPresionar);
        return () => window.removeEventListener('keydown', alPresionar);
    }, [abierto, onCerrar]);

    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-titulo"
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 id="modal-titulo" className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {titulo}
                    </h2>
                    <button
                        type="button"
                        onClick={onCerrar}
                        aria-label="Cerrar"
                        className="text-lg font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        {error}
                    </div>
                )}

                {children}
            </div>
        </div>
    );
};
