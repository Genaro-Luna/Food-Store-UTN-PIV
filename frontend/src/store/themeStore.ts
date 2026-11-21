import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    darkMode: boolean;
    toggleTheme: () => void;
}

// Sincroniza el estado con el DOM: Tailwind lee la clase .dark de <html>
const applyTheme = (dark: boolean): void => {
    document.documentElement.classList.toggle('dark', dark);
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            darkMode: false,

            toggleTheme: () => {
                const next = !get().darkMode;
                applyTheme(next);
                set({ darkMode: next });
            },
        }),
        {
            name: 'theme-storage',
            partialize: (state) => ({ darkMode: state.darkMode }),
            // Al recargar, persist recupera darkMode de localStorage y acá lo aplicamos al DOM
            onRehydrateStorage: () => (state) => {
                if (state) applyTheme(state.darkMode);
            },
        }
    )
);