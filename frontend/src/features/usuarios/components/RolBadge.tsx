import React from 'react';
import type { Rol } from '../types/usuario.types';

/** Insignia con el rol del usuario (Navbar y tabla de usuarios). */
export const RolBadge: React.FC<{ rol: Rol }> = ({ rol }) => (
    <span
        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${
            rol === 'admin'
                ? 'bg-amber-400 text-amber-950'
                : 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100'
        }`}
    >
        {rol}
    </span>
);
