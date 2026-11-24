import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const SECCIONES = [
    { to: 'productos', etiqueta: 'Productos' },
    { to: 'categorias', etiqueta: 'Categorías' },
    { to: 'usuarios', etiqueta: 'Usuarios' },
];

const claseTab = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        isActive
            ? 'border-orange-600 text-orange-700 dark:text-orange-400'
            : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
    }`;

/** Pestañas del panel de administración (solo admin, protegido en AppRouter). */
export const AdminLayout: React.FC = () => (
    <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Panel de administración</h1>
        <nav className="mb-6 mt-3 flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {SECCIONES.map((s) => (
                <NavLink key={s.to} to={s.to} className={claseTab}>
                    {s.etiqueta}
                </NavLink>
            ))}
        </nav>
        <Outlet />
    </div>
);
