import { usePage } from '@inertiajs/react';

export const useTranslations = () => {
    const { translations, locale } = usePage().props as any;
    
    const t = (key: string, replacements?: Record<string, string>) => {
        let translation = translations?.[key] || key;
        
        if (replacements) {
            Object.entries(replacements).forEach(([placeholder, value]) => {
                translation = translation.replace(`:${placeholder}`, value);
            });
        }
        
        return translation;
    };
    
    return { t, locale };
};