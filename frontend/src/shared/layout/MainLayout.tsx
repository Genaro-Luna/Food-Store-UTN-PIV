import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

/** Estructura común de todas las pantallas: Navbar arriba y el contenido de la ruta debajo. */
export const MainLayout: React.FC = () => (
    <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
            <Outlet />
        </main>
        <footer className="py-4 text-center text-xs text-gray-500 dark:text-gray-400">
            Food Store · Programación IV · UTN
        </footer>
    </div>
);
