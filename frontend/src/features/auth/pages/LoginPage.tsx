import React, { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Campo, Input } from '@/shared/ui/Input';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/auth.types';

/** ProtectedRoute guarda en state.from la ruta a la que se quería entrar. */
interface EstadoNavegacion {
    from?: string;
}

export const LoginPage: React.FC = () => {
    const { usuario, login, error, clearError } = useAuth();
    const location = useLocation();
    const destino = (location.state as EstadoNavegacion | null)?.from ?? '/';

    useEffect(() => {
        clearError();
    }, [clearError]);

    const form = useForm({
        defaultValues: { username: '', password: '' } as LoginCredentials,
        validators: {
            onSubmit: ({ value }) => {
                const fields: Partial<Record<keyof LoginCredentials, string>> = {};
                if (!value.username.trim()) fields.username = 'Ingresá tu nombre de usuario';
                if (!value.password) fields.password = 'Ingresá tu contraseña';
                return Object.keys(fields).length > 0 ? { fields } : undefined;
            },
        },
        // Si el login funciona, el usuario queda en el store y el <Navigate> de abajo redirige.
        onSubmit: async ({ value }) => {
            await login(value.username.trim(), value.password);
        },
    });

    if (usuario) {
        return <Navigate to={destino} replace />;
    }

    return (
        <Card className="mx-auto mt-6 max-w-md p-8">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Iniciar sesión</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Ingresá para confirmar tus pedidos
                </p>
            </div>

            {error && (
                <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                    {error}
                </div>
            )}

            <form
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void form.handleSubmit();
                }}
                className="flex flex-col gap-4"
            >
                <form.Field name="username">
                    {(field) => (
                        <Campo etiqueta="Usuario" htmlFor="login-username" errores={field.state.meta.errors}>
                            <Input
                                id="login-username"
                                autoComplete="username"
                                placeholder="Ej: juan"
                                value={field.state.value}
                                invalido={field.state.meta.errors.length > 0}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        </Campo>
                    )}
                </form.Field>

                <form.Field name="password">
                    {(field) => (
                        <Campo etiqueta="Contraseña" htmlFor="login-password" errores={field.state.meta.errors}>
                            <Input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                value={field.state.value}
                                invalido={field.state.meta.errors.length > 0}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                        </Campo>
                    )}
                </form.Field>

                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                    {([canSubmit, isSubmitting]) => (
                        <Button type="submit" className="mt-2 w-full" disabled={!canSubmit} cargando={isSubmitting}>
                            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                        </Button>
                    )}
                </form.Subscribe>
            </form>

            <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
                ¿No tenés cuenta?{' '}
                <Link to="/register" state={location.state} className="font-semibold text-orange-600 hover:underline">
                    Registrate
                </Link>
            </p>
        </Card>
    );
};
