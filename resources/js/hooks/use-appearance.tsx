import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());
    document.documentElement.classList.toggle('dark', isDark);
};

// Initialize theme from database settings (no localStorage)
export function initializeTheme() {
    // Theme will be applied by BrandProvider from database
    // This function kept for compatibility but does nothing
}

// Hook for appearance tabs component (database-driven)
export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');

    const updateAppearance = (mode: Appearance) => {
        setAppearance(mode);
        // No localStorage - will be saved to database via system settings
    };

    return { appearance, updateAppearance };
}
