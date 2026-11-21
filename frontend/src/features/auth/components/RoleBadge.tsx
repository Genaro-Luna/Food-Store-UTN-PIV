import React from 'react';
import type { Role } from '../types/auth.types';

interface RoleBadgeProps {
    role: Role;
    prefix?: string;
}

/** Insignia con el rol del usuario (Navbar y tabla de administración). */
export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, prefix }) => (
    <span
        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
            role === 'admin'
                ? 'bg-amber-400 text-amber-950'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
        }`}
    >
        {prefix}
        {role}
    </span>
);
