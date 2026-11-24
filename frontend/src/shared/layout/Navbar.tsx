import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { RolBadge } from '@/features/usuarios/components/RolBadge';
import { useThemeStore } from '@/store/themeStore';

const claseLink = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive ? 'bg-orange-800 text-white dark:bg-gray-700' : 'text-orange-50 hover:bg-orange-500 dark:hover:bg-gray-700'
    }`;

export const Navbar: React.FC = () => {
    const { usuario, esAdmin, logout } = useAuth();
    const darkMode = useThemeStore((s) => s.darkMode);
    const toggleTheme = useThemeStore((s) => s.toggleTheme);
    const navigate = useNavigate();

    const cerrarSesion = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <nav className="flex flex-wrap items-center justify-between gap-4 bg-orange-600 px-6 py-3 text-white shadow-md dark:bg-gray-800">
            <div className="flex flex-wrap items-center gap-4">
                <Link to="/" className="text-xl font-bold tracking-wide">
                    🍔 Food Store
                </Link>
                <div className="flex flex-wrap gap-1">
                    <NavLink to="/" end className={claseLink}>
                        Catálogo
                    </NavLink>
                    {esAdmin && (
                        <NavLink to="/admin" className={claseLink}>
                            Panel admin
                        </NavLink>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
                    title={darkMode ? 'Modo claro' : 'Modo oscuro'}
                    className="rounded-lg bg-orange-800 px-3 py-1.5 text-sm transition hover:opacity-80 active:scale-95 dark:bg-gray-700"
                >
                    {darkMode ? '☀️' : '🌙'}
                </button>

                {usuario ? (
                    <>
                        <div className="text-right text-xs leading-tight">
                            <p className="font-semibold">{usuario.full_name}</p>
                            <RolBadge rol={usuario.role} />
                        </div>
                        <button
                            type="button"
                            onClick={() => void cerrarSesion()}
                            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold shadow-sm transition hover:bg-red-600 active:scale-95"
                        >
                            Cerrar sesión
                        </button>
                    </>
                ) : (
                    <>
                        <NavLink to="/login" className={claseLink}>
                            Ingresar
                        </NavLink>
                        <NavLink
                            to="/register"
                            className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                        >
                            Registrarse
                        </NavLink>
                    </>
                )}
            </div>
        </nav>
    );
};
