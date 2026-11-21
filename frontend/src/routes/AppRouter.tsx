import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Navbar } from '@/shared/components/Navbar';
import { UnauthorizedPage } from '@/shared/components/UnauthorizedPage';
import { AdminUsersPage, LoginPage, RegisterPage } from '@/features/auth';
import { CategoriesPage } from '@/features/categories';
import { ProductsPage } from '@/features/products';
import { IngredientsPage } from '@/features/ingredients';

export const AppRouter: React.FC = () => (
    <>
        <Navbar /> {/* se oculta sola cuando no hay sesión */}
        <Routes>
            {/* Rutas públicas: no pasan por ProtectedRoute */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Rutas protegidas: cualquier usuario autenticado */}
            <Route element={<ProtectedRoute />}>
                <Route path="/categorias" element={<CategoriesPage />} />
                <Route path="/productos" element={<ProductsPage />} />
                <Route path="/ingredientes" element={<IngredientsPage />} />
            </Route>

            {/* Ruta de administración: solo rol admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>

            {/* Alias en inglés (nombres de ruta del PDF del TP) */}
            <Route path="/categories" element={<Navigate to="/categorias" replace />} />
            <Route path="/products" element={<Navigate to="/productos" replace />} />
            <Route path="/ingredients" element={<Navigate to="/ingredientes" replace />} />

            {/* Cualquier otra URL */}
            <Route path="*" element={<Navigate to="/categorias" replace />} />
        </Routes>
    </>
);