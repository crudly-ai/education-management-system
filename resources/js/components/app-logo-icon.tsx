import { SVGAttributes } from 'react';
import { usePage } from '@inertiajs/react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    const { systemSettings, storageUrl } = usePage().props as any;
    
    // Determine which logo to use based on theme mode
    const isDark = document.documentElement.classList.contains('dark');
    const logoPath = isDark 
        ? systemSettings?.dark_logo 
        : systemSettings?.light_logo;
    
    const logoSrc = logoPath 
        ? `${storageUrl}${logoPath}` 
        : '/logo.png'; // fallback to default logo
    
    return (
        <img {...props} src={logoSrc} alt="Logo" />
    );
}
