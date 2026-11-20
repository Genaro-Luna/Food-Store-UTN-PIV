import React, { useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials } from '../types/auth.types';

const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

export const LoginPage: React.FC = () => {
    const user = useAuthStore((s) => s.user);
    const login = useAuthStore((s) => s.login);
    const error = useAuthStore((s) => s.error);
    const clearError = useAuthStore((s) => s.clearError);
    const navigate = useNavigate();

    useEffect(() => {
        clearError();
    }, [clearError]);

    const form = useForm({
        defaultValues: {
            username: '',
            password: '',
        } as LoginCredentials,
        validators: {
            onSubmit: ({ value }) => {
                const errors: Partial<Record<keyof LoginCredentials, string>> = {};
                if (!value.username.trim()) {
                    errors.username = 'Ingresa tu nombre de usuario';
                }
                if (!value.password) {
                    errors.password = 'Ingresa tu contraseña';
                }
                return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
            },
        },
        onSubmit: async ({ value }) => {
            try {
                await login(value.username.trim(), value.password);
                navigate('/categorias', { replace: true });
            } catch {
                // El error ya queda guardado en useAuthStore y se muestra en pantalla
            }
        },
    });

    if (user) {
        return <Navigate to="/categorias" replace />;
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-gray-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Iniciar Sesión
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Ingresa tus credenciales para acceder al sistema
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="flex flex-col gap-4"
                >
                    <form.Field name="username">
                        {(f) => (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Usuario *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: admin o juan"
                                    className={inputClass}
                                    value={f.state.value}
                                    onChange={(e) => f.handleChange(e.target.value)}
                                />
                                {f.state.meta.errors.map((err) => (
                                    <p
                                        key={String(err)}
                                        className="mt-1 text-xs text-red-500"
                                    >
                                        {String(err)}
                                    </p>
                                ))}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="password">
                        {(f) => (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña *
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className={inputClass}
                                    value={f.state.value}
                                    onChange={(e) => f.handleChange(e.target.value)}
                                />
                                {f.state.meta.errors.map((err) => (
                                    <p
                                        key={String(err)}
                                        className="mt-1 text-xs text-red-500"
                                    >
                                        {String(err)}
                                    </p>
                                ))}
                            </div>
                        )}
                    </form.Field>

                    <form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                    >
                        {([canSubmit, isSubmitting]) => (
                            <button
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                                className="mt-2 w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition shadow-sm"
                            >
                                {isSubmitting ? 'Iniciando sesión...' : 'Ingresar'}
                            </button>
                        )}
                    </form.Subscribe>
                </form>

                <p className="mt-6 text-center text-xs text-gray-600">
                    ¿No tienes una cuenta?{' '}
                    <Link
                        to="/register"
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </main>
    );
};