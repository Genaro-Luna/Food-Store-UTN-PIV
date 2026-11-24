import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { UnauthorizedPage } from '@/features/auth/pages/UnauthorizedPage';
import { AdminCategoriasPage } from '@/features/categorias/pages/AdminCategoriasPage';
import { AdminProductosPage } from '@/features/productos/pages/AdminProductosPage';
import { AdminUsuariosPage } from '@/features/usuarios/pages/AdminUsuariosPage';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { AdminLayout } from '@/shared/layout/AdminLayout';
import { MainLayout } from '@/shared/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRouter: React.FC = () => (
    <BrowserRouter>
        <Routes>
            <Route element={<MainLayout />}>
                {/* Públicas */}
                <Route path="/" element={<EstadoVacio titulo="Catálogo en construcción" icono="🚧" />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Solo admin */}
                <Route element={<ProtectedRoute roles={['admin']} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="productos" replace />} />
                        <Route path="productos" element={<AdminProductosPage />} />
                        <Route path="categorias" element={<AdminCategoriasPage />} />
                        <Route path="usuarios" element={<AdminUsuariosPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    </BrowserRouter>
);
