import { useBrand } from '@/contexts/brand-context';
import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo({ collapsed = false }: { collapsed?: boolean }) {
    const { settings } = useBrand();
    const { storageUrl } = usePage().props as any;
    
    const getCurrentLogo = () => {
        const isDark = settings.theme_mode === 'dark' || 
                      (settings.theme_mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        if (isDark && settings.dark_logo) {
            return `${storageUrl}${settings.dark_logo}`;
        } else if (!isDark && settings.light_logo) {
            return `${storageUrl}${settings.light_logo}`;
        }
        
        // Fallback to default logos
        return collapsed ? '/logo-icon.png' : '/logo.png';
    };

    return (
        <div className={`flex items-center justify-center rounded-md ${collapsed ? '' : ''}`}>
            <img 
                src={getCurrentLogo()} 
                alt="Logo" 
                className={collapsed ? 'h-8 w-8 object-scale-down' : 'h-10 w-auto object-scale-down'} 
            />
        </div>
    );
}
