import { useEffect, useState } from 'react';

/** Devuelve el valor recién cuando deja de cambiar durante `demora` ms (búsqueda del catálogo). */
export function useDebounce<T>(valor: T, demora = 400): T {
    const [demorado, setDemorado] = useState(valor);

    useEffect(() => {
        const timer = setTimeout(() => setDemorado(valor), demora);
        return () => clearTimeout(timer);
    }, [valor, demora]);

    return demorado;
}
