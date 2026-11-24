import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Campo, Input } from '@/shared/ui/Input';
import { handleApiError } from '@/shared/api/handleApiError';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuth, useRegistro } from '../hooks/useAuth';
import type { RegistroData } from '../types/auth.types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const bytes = (texto: string) => new TextEncoder().encode(texto).length;

type Campos = keyof RegistroData;

const CAMPOS: { name: Campos; etiqueta: string; type: string; autoComplete: string; placeholder: string }[] = [
    { name: 'username', etiqueta: 'Nombre de usuario', type: 'text', autoComplete: 'username', placeholder: 'Ej: genaroluna' },
    { name: 'full_name', etiqueta: 'Nombre completo', type: 'text', autoComplete: 'name', placeholder: 'Ej: Genaro Luna' },
    { name: 'email', etiqueta: 'Email', type: 'email', autoComplete: 'email', placeholder: 'usuario@ejemplo.com' },
    { name: 'password', etiqueta: 'Contraseña (mínimo 8 caracteres)', type: 'password', autoComplete: 'new-password', placeholder: '••••••••' },
];

export const RegisterPage: React.FC = () => {
    const { usuario } = useAuth();
    const registro = useRegistro();
    const showNotification = useNotificationStore((s) => s.showNotification);
    const navigate = useNavigate();
    const location = useLocation();
    const [errorApi, setErrorApi] = useState<string | null>(null);

    const form = useForm({
        defaultValues: { username: '', full_name: '', email: '', password: '' } as RegistroData,
        // Mismas reglas que UserCreate en el backend
        validators: {
            onSubmit: ({ value }) => {
                const fields: Partial<Record<Campos, string>> = {};
                const username = value.username.trim();
                if (username.length < 3 || username.length > 50) {
                    fields.username = 'El usuario debe tener entre 3 y 50 caracteres';
                }
                const nombre = value.full_name.trim();
                if (!nombre || nombre.length > 100) {
                    fields.full_name = 'El nombre es obligatorio (máximo 100 caracteres)';
                }
                if (!EMAIL.test(value.email.trim())) fields.email = 'Ingresá un email válido';
                if (value.password.length < 8) {
                    fields.password = 'La contraseña debe tener al menos 8 caracteres';
                } else if (bytes(value.password) > 72) {
                    fields.password = 'La contraseña es demasiado larga';
                }
                return Object.keys(fields).length > 0 ? { fields } : undefined;
            },
        },
        onSubmit: async ({ value }) => {
            setErrorApi(null);
            try {
                await registro.mutateAsync({
                    username: value.username.trim(),
                    full_name: value.full_name.trim(),
                    email: value.email.trim(),
                    password: value.password,
                });
                showNotification('Cuenta creada. Ya podés iniciar sesión.');
                // Conserva state.from para volver, por ejemplo, al checkout
                navigate('/login', { replace: true, state: location.state });
            } catch (error) {
                setErrorApi(handleApiError(error)); // 409: usuario o email ya registrado
            }
        },
    });

    if (usuario) {
        return <Navigate to="/" replace />;
    }

    return (
        <Card className="mx-auto mt-6 max-w-md p-8">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Crear cuenta</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Registrate para hacer pedidos
                </p>
            </div>

            {errorApi && (
                <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                    {errorApi}
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
                {CAMPOS.map((campo) => (
                    <form.Field key={campo.name} name={campo.name}>
                        {(field) => (
                            <Campo etiqueta={campo.etiqueta} htmlFor={`registro-${campo.name}`} errores={field.state.meta.errors}>
                                <Input
                                    id={`registro-${campo.name}`}
                                    type={campo.type}
                                    autoComplete={campo.autoComplete}
                                    placeholder={campo.placeholder}
                                    value={field.state.value}
                                    invalido={field.state.meta.errors.length > 0}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </Campo>
                        )}
                    </form.Field>
                ))}

                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                    {([canSubmit, isSubmitting]) => (
                        <Button type="submit" className="mt-2 w-full" disabled={!canSubmit} cargando={isSubmitting}>
                            {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
                        </Button>
                    )}
                </form.Subscribe>
            </form>

            <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
                ¿Ya tenés cuenta?{' '}
                <Link to="/login" state={location.state} className="font-semibold text-orange-600 hover:underline">
                    Iniciá sesión
                </Link>
            </p>
        </Card>
    );
};
