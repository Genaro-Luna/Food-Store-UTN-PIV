import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, RoleBadge } from '@/features/auth';
import { useThemeStore } from '@/store/themeStore';

export const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const darkMode = useThemeStore((s) => s.darkMode);
    const toggleTheme = useThemeStore((s) => s.toggleTheme);
    const navigate = useNavigate();

    // Si no hay sesión activa, no mostramos la barra de navegación interna
    if (!user) return null;

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive ? 'bg-blue-800 text-white' : 'hover:bg-blue-500 text-blue-100'
        }`;

    const handleLogout = async () => {
        await logout(); // useAuth también limpia la caché de TanStack Query
        navigate('/login', { replace: true });
    };

    return (
        <nav className="bg-blue-600 dark:bg-gray-800 text-white shadow-md px-6 py-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold tracking-wide">
                    Gestión Full Stack - UTN
                </h1>
                <div className="flex gap-2">
                    <NavLink to="/categorias" className={linkClass}>
                        Categorías
                    </NavLink>
                    <NavLink to="/productos" className={linkClass}>
                        Productos
                    </NavLink>
                    {user.role === 'admin' && (
                        <NavLink to="/admin/users" className={linkClass}>
                            Usuarios
                        </NavLink>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right text-xs">
                    <p className="font-semibold text-white">{user.full_name}</p>
                    <RoleBadge role={user.role} prefix="Rol: " />
                </div>

                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
                    title={darkMode ? 'Modo claro' : 'Modo oscuro'}
                    className="bg-blue-800 dark:bg-gray-700 hover:opacity-80 px-3 py-1.5 rounded-lg text-sm active:scale-95 transition"
                >
                    {darkMode ? '☀️' : '🌙'}
                </button>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95 transition shadow-sm"
                >
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
};