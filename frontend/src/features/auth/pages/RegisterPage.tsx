import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { useAuth } from '../hooks/useAuth';
import { useNotificationStore } from '@/store/notificationStore';
import type { RegisterFormValues } from '../types/auth.types';

const inputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

export const RegisterPage: React.FC = () => {
    const { user, register } = useAuth();
    const showNotification = useNotificationStore((s) => s.showNotification);
    const navigate = useNavigate();
    const [apiError, setApiError] = useState<string | null>(null);

    const form = useForm({
        defaultValues: {
            username: '',
            full_name: '',
            email: '',
            password: '',
        } as RegisterFormValues,
        validators: {
            onSubmit: ({ value }) => {
                const errors: Partial<Record<keyof RegisterFormValues, string>> = {};
                if (value.username.trim().length < 3) {
                    errors.username = 'El usuario debe tener al menos 3 caracteres';
                }
                if (!value.full_name.trim()) {
                    errors.full_name = 'El nombre completo es obligatorio';
                }
                if (!value.email.includes('@')) {
                    errors.email = 'Ingresa un email válido';
                }
                if (value.password.length < 8) {
                    errors.password = 'La contraseña debe tener al menos 8 caracteres';
                }
                return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
            },
        },
        onSubmit: async ({ value }) => {
            setApiError(null);
            try {
                await register({
                    username: value.username.trim(),
                    full_name: value.full_name.trim(),
                    email: value.email.trim(),
                    password: value.password,
                });
                showNotification('Cuenta creada. Ya podés iniciar sesión.');
                navigate('/login', { replace: true });
            } catch (e) {
                setApiError(
                    e instanceof Error ? e.message : 'No se pudo completar el registro'
                );
            }
        },
    });

    if (user) {
        return <Navigate to="/categorias" replace />;
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-gray-200 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        Crear Cuenta
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Regístrate para acceder al sistema con rol de usuario
                    </p>
                </div>

                {apiError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                        {apiError}
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre de usuario *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: genaroluna"
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

                    <form.Field name="full_name">
                        {(f) => (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre completo *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Genaro Luna"
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

                    <form.Field name="email">
                        {(f) => (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    placeholder="usuario@ejemplo.com"
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Contraseña (mínimo 8 caracteres) *
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
                                {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
                            </button>
                        )}
                    </form.Subscribe>
                </form>

                <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
                    ¿Ya tienes una cuenta?{' '}
                    <Link
                        to="/login"
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </main>
    );
};