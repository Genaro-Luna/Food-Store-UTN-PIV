import React from 'react';

interface LoadingStateProps {
    message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Cargando datos...',
}) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 my-6">
        <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">{message}</span>
        </div>
        <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-900 rounded-md w-full" />
            <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-md w-full" />
            <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-md w-full" />
        </div>
    </div>
);

interface EmptyStateProps {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    message,
    actionLabel,
    onAction,
}) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-10 text-center my-6">
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">{message}</p>
        {actionLabel && onAction && (
            <button
                type="button"
                onClick={onAction}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-95 transition"
            >
                {actionLabel}
            </button>
        )}
    </div>
);

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    message = 'No se pudieron cargar los datos del servidor. Verifica que el backend esté en ejecución.',
    onRetry,
}) => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center my-6">
        <p className="text-red-700 font-medium mb-3">{message}</p>
        {onRetry && (
            <button
                type="button"
                onClick={onRetry}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 active:scale-95 transition"
            >
                Reintentar
            </button>
        )}
    </div>
);