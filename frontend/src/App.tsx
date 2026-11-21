import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth';
import { AppRouter } from '@/routes/AppRouter';
import { Toast } from '@/shared/components/Toast';

export default function App() {
    const checkAuth = useAuthStore((s) => s.checkAuth);

    // Única lógica permitida (RA-04): verificar la sesión al iniciar
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <>
            <AppRouter />
            <Toast />
        </>
    );
}