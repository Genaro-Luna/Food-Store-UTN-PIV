import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CategoriasPage } from './pages/CategoriasPage';
import { ProductsPage } from './pages/ProductsPage';
import { IngredientesPage } from './pages/IngredientesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UnauthorizedPage } from './pages/UnautorizedPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { useAuthStore } from '@/store/authStore';
import { Toast } from '@/shared/components/Toast';

export default function App() {
    const checkSession = useAuthStore((s) => s.checkSession);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    return (
        <div className="min-h-screen bg-gray-200 dark:bg-gray-900 transition-colors">
            <Navbar />
            <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Rutas protegidas (cualquier usuario autenticado) */}
                <Route
                    path="/categorias"
                    element={
                        <ProtectedRoute>
                            <CategoriasPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/productos"
                    element={
                        <ProtectedRoute>
                            <ProductsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ingredientes"
                    element={
                        <ProtectedRoute>
                            <IngredientesPage />
                        </ProtectedRoute>
                    }
                />

                {/* Ruta exclusiva para Administrador */}
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminUsersPage />
                        </ProtectedRoute>
                    }
                />

                {/* Alias en inglés por compatibilidad con el PDF del TP */}
                <Route path="/categories" element={<Navigate to="/categorias" replace />} />
                <Route path="/products" element={<Navigate to="/productos" replace />} />
                <Route path="/ingredients" element={<Navigate to="/ingredientes" replace />} />

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/categorias" replace />} />
            </Routes>
            <Toast />
        </div>
    );
}