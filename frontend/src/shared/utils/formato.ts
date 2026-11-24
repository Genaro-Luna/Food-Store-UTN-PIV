const PRECIO = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

const FECHA = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
});

/** 8500 → «$ 8.500,00» */
export const formatearPrecio = (valor: number): string => PRECIO.format(valor);

/** Fecha ISO de la API (UTC) mostrada en hora de Argentina. */
export const formatearFecha = (iso: string): string => {
    // Si la API devolviera una fecha sin zona horaria, se interpreta como UTC.
    const conZona = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
    return FECHA.format(new Date(conZona));
};
