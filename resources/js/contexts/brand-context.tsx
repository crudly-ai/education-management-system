import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

interface BrandSettings {
  theme_color: string;
  custom_theme_color?: string;
  theme_mode: string;
  layout_direction: string;
  sidebar_style: string;
  sidebar_variant: string;
  footer_text: string;
  dark_logo: string;
  light_logo: string;
  favicon: string;
}

interface BrandContextType {
  settings: BrandSettings;
  getPrimaryColor: () => string;
  getSidebarStyles: () => React.CSSProperties;
  getSidebarClasses: () => string;
  getSidebarVariant: () => 'sidebar' | 'floating' | 'inset';
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const { systemSettings, storageUrl } = usePage().props as any;

  const settings: BrandSettings = {
    theme_color: systemSettings?.theme_color || 'blue',
    custom_theme_color: systemSettings?.custom_theme_color || '#3b82f6',
    theme_mode: systemSettings?.theme_mode || 'light',
    layout_direction: systemSettings?.layout_direction || 'ltr',
    sidebar_style: systemSettings?.sidebar_style || 'plain',
    sidebar_variant: systemSettings?.sidebar_variant || 'inset',
    footer_text: systemSettings?.footer_text || '© 2024 Crudly. All rights reserved.',
    dark_logo: systemSettings?.dark_logo || '',
    light_logo: systemSettings?.light_logo || '',
    favicon: systemSettings?.favicon || '',
  };

  const themeColors = {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    orange: '#f97316',
    red: '#ef4444',
    black: '#000000'
  };

  const getPrimaryColor = () => {
    if (settings.theme_color === 'custom') {
      return systemSettings?.custom_theme_color || '#3b82f6';
    }
    return themeColors[settings.theme_color as keyof typeof themeColors] || '#3b82f6';
  };

  useEffect(() => {
    const primaryColor = getPrimaryColor();
    const root = document.documentElement;

    // Convert hex to HSL for CSS custom properties
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Set CSS custom properties for theme color with !important
    const primaryHsl = hexToHsl(primaryColor);
    
    // Calculate appropriate foreground color based on background lightness
    const getForegroundColor = (bgColor: string) => {
      // For black or very dark colors, use white text
      if (bgColor === '#000000' || settings.theme_color === 'black') {
        return '0 0% 100%'; // Pure white
      }
      // For other colors, use light gray
      return '0 0% 98%';
    };
    
    const foregroundColor = getForegroundColor(primaryColor);

    // Create or update dynamic theme styles
    let themeStyle = document.getElementById('dynamic-theme-styles');
    if (!themeStyle) {
      themeStyle = document.createElement('style');
      themeStyle.id = 'dynamic-theme-styles';
      document.head.appendChild(themeStyle);
    }

    themeStyle.textContent = `
      html:root {
        --primary: ${primaryHsl} !important;
        --primary-foreground: ${foregroundColor} !important;
        --accent: ${primaryHsl} !important;
        --accent-foreground: ${foregroundColor} !important;
        --ring: ${primaryHsl} !important;
        --color-primary: ${primaryHsl} !important;
        --color-primary-foreground: ${foregroundColor} !important;
        --color-accent: ${primaryHsl} !important;
        --color-accent-foreground: ${foregroundColor} !important;
        --color-ring: ${primaryHsl} !important;
        --sidebar-primary: ${primaryHsl} !important;
        --sidebar-accent: ${primaryHsl} !important;
        --sidebar-ring: ${primaryHsl} !important;
        --color-sidebar-primary: ${primaryHsl} !important;
        --color-sidebar-accent: ${primaryHsl} !important;
        --color-sidebar-ring: ${primaryHsl} !important;
      }

      /* Apply primary color to buttons and interactive elements */
      .bg-primary, [data-variant="default"], button[data-variant="default"] {
        background-color: hsl(${primaryHsl}) !important;
        color: hsl(${foregroundColor}) !important;
      }

      .text-primary {
        color: hsl(${primaryHsl}) !important;
      }

      .border-primary {
        border-color: hsl(${primaryHsl}) !important;
      }

      .ring-primary {
        --tw-ring-color: hsl(${primaryHsl}) !important;
      }

      /* Target common button classes */
      .btn-primary, .button-primary {
        background-color: hsl(${primaryHsl}) !important;
        color: hsl(${foregroundColor}) !important;
      }

      /* Target links and navigation */
      .nav-link.active, .nav-item.active {
        color: hsl(${primaryHsl}) !important;
      }

      /* Target form elements */
      .form-control:focus, .input:focus {
        border-color: hsl(${primaryHsl}) !important;
        box-shadow: 0 0 0 2px hsla(${primaryHsl}, 0.2) !important;
      }
      
      /* Ensure proper text color for primary buttons */
      button[class*="bg-primary"], .bg-primary {
        color: hsl(${foregroundColor}) !important;
      }
      
      /* Dark mode - black theme */
      .dark {
        background-color: #000000 !important;
        color: #ffffff !important;
      }
      
      .dark body {
        background-color: #000000 !important;
        color: #ffffff !important;
      }
      
      .dark .bg-white {
        background-color: #1a1a1a !important;
        color: #ffffff !important;
      }
      
      .dark .bg-gray-50 {
        background-color: #2a2a2a !important;
        color: #ffffff !important;
      }
      
      .dark .bg-muted {
        background-color: #2a2a2a !important;
        color: #cccccc !important;
      }
      
      .dark .border {
        border-color: #404040 !important;
      }
      
      .dark .text-gray-900 {
        color: #ffffff !important;
      }
      
      .dark .text-gray-700 {
        color: #e0e0e0 !important;
      }
      
      .dark .text-gray-600 {
        color: #cccccc !important;
      }
      
      .dark .text-gray-500 {
        color: #999999 !important;
      }
      
      .dark .text-muted-foreground {
        color: #999999 !important;
      }
      
      .dark table {
        background-color: #1a1a1a !important;
        color: #ffffff !important;
      }
      
      .dark th {
        background-color: #2a2a2a !important;
        color: #ffffff !important;
        border-color: #404040 !important;
      }
      
      .dark td {
        border-color: #404040 !important;
        color: #ffffff !important;
      }
      
      .dark input, .dark textarea, .dark select {
        background-color: #2a2a2a !important;
        color: #ffffff !important;
        border-color: #404040 !important;
      }
      
      .dark button:not(.bg-primary):not([data-variant="default"]) {
        background-color: #2a2a2a !important;
        color: #ffffff !important;
        border-color: #404040 !important;
      }
      
      .dark button:not(.bg-primary):not([data-variant="default"]):hover {
        background-color: #3a3a3a !important;
      }
      
      .dark tr:hover {
        background-color: #2a2a2a !important;
      }
      
      .dark .hover\:bg-gray-50:hover {
        background-color: #2a2a2a !important;
      }
      
      .dark .hover\:bg-gray-100:hover {
        background-color: #3a3a3a !important;
      }
      
      .dark .bg-blue-50 {
        background-color: #1a365d !important;
        color: #ffffff !important;
      }
      
      .dark .bg-red-50 {
        background-color: #742a2a !important;
        color: #ffffff !important;
      }
      
      .dark .bg-green-50 {
        background-color: #2d5a2d !important;
        color: #ffffff !important;
      }
      
      .dark .bg-purple-50 {
        background-color: #553c9a !important;
        color: #ffffff !important;
      }
      
      /* Dark mode text colors for specific elements */
      .dark .text-green-800 {
        color: #bbf7d0 !important;
      }
      
      .dark .text-blue-800 {
        color: #dbeafe !important;
      }
      
      .dark .text-red-800 {
        color: #fecaca !important;
      }
      
      .dark .text-purple-800 {
        color: #e9d5ff !important;
      }
      
      .dark .text-yellow-800 {
        color: #fef3c7 !important;
      }
      
      /* Dark mode badge and role styling */
      .dark .bg-green-100 {
        background-color: #2d5a2d !important;
        color: #bbf7d0 !important;
      }
      
      .dark .bg-blue-100 {
        background-color: #1a365d !important;
        color: #dbeafe !important;
      }
      
      .dark .bg-gray-100 {
        background-color: #2a2a2a !important;
        color: #ffffff !important;
      }
      
      /* Dark mode project badges */
      .dark .bg-yellow-100 {
        background-color: #975a16 !important;
        color: #fef3c7 !important;
      }
      
      .dark .text-yellow-800 {
        color: #fef3c7 !important;
      }
      
      .dark .bg-red-100 {
        background-color: #742a2a !important;
        color: #fecaca !important;
      }
      
      .dark .text-red-800 {
        color: #fecaca !important;
      }
      
      .dark .text-gray-800 {
        color: #ffffff !important;
      }
      
      /* Dark mode project view backgrounds */
      .dark .bg-gradient-to-r {
        background: #2a2a2a !important;
      }
      
      .dark .from-blue-50 {
        background: #2a2a2a !important;
      }
      
      .dark .to-indigo-50 {
        background: #2a2a2a !important;
      }
      
      .dark .bg-blue-50 {
        background-color: #1a365d !important;
        color: #ffffff !important;
      }
      
      .dark .bg-red-50 {
        background-color: #742a2a !important;
        color: #ffffff !important;
      }
      
      .dark .bg-green-50 {
        background-color: #2d5a2d !important;
        color: #ffffff !important;
      }
      
      .dark .bg-purple-50 {
        background-color: #553c9a !important;
        color: #ffffff !important;
      }
      
      .dark .text-blue-600 {
        color: #60a5fa !important;
      }
      
      .dark .text-red-600 {
        color: #f87171 !important;
      }
      
      .dark .text-green-600 {
        color: #4ade80 !important;
      }
      
      .dark .text-purple-600 {
        color: #a78bfa !important;
      }
      
      .dark .text-orange-600 {
        color: #fb923c !important;
      }
      
      /* Fix text-primary for task titles and other primary text */
      .dark .text-primary {
        color: #60a5fa !important;
      }
      
      /* Dark mode workspace page */
      .dark .bg-background {
        background-color: #000000 !important;
        color: #ffffff !important;
      }
      
      .dark .text-foreground {
        color: #ffffff !important;
      }
      
      .dark .text-muted-foreground {
        color: #999999 !important;
      }
      
      .dark .text-card-foreground {
        color: #ffffff !important;
      }
      
      .dark .bg-card {
        background-color: #1a1a1a !important;
        color: #ffffff !important;
      }
      
      .dark .bg-muted {
        background-color: #2a2a2a !important;
        color: #ffffff !important;
      }
      
      .dark .border-border {
        border-color: #404040 !important;
      }
      
      .dark .border-t {
        border-top-color: #404040 !important;
      }
      
      /* Tour modal close button styling */
      button[data-test-id="button-close"] {
        border-radius: 8px !important;
      }
      
      .dark button[data-test-id="button-close"] svg path {
        fill: #ffffff !important;
      }
      
      /* RTL sidebar positioning */
      [dir="rtl"] [data-sidebar] {
        right: 0 !important;
        left: auto !important;
      }
      
      [dir="rtl"] .group[data-sidebar] ~ * {
        margin-right: var(--sidebar-width) !important;
        margin-left: 0 !important;
      }
      
      [dir="rtl"] [data-sidebar-trigger] {
        right: auto !important;
        left: 1rem !important;
      }
    `;

    // Set global RTL/LTR direction
    const isRTL = settings.layout_direction === 'rtl';
    root.dir = isRTL ? 'rtl' : 'ltr';
    document.body.dir = isRTL ? 'rtl' : 'ltr';

    // Set theme mode
    if (settings.theme_mode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else if (settings.theme_mode === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      // system mode
      root.classList.remove('light', 'dark');
    }

    // Apply sidebar styles
    let existingStyle = document.getElementById('brand-sidebar-styles');
    if (!existingStyle) {
      existingStyle = document.createElement('style');
      existingStyle.id = 'brand-sidebar-styles';
      document.head.appendChild(existingStyle);
    }

    if (settings.sidebar_style === 'colored' || settings.sidebar_style === 'gradient') {
      const sidebarBg = settings.sidebar_style === 'colored'
        ? primaryColor
        : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}80 100%)`;

      existingStyle.textContent = `
        [data-sidebar] {
          background: ${sidebarBg} !important;
        }
        [data-sidebar] .text-sidebar-foreground {
          color: white !important;
        }
        [data-sidebar] a, [data-sidebar] button {
          color: white !important;
        }
        [data-sidebar] [data-sidebar-trigger] {
          color: white !important;
        }
      `;
    } else {
      existingStyle.textContent = '';
    }

    // Update favicon
    if (settings.favicon) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = `${storageUrl}${settings.favicon}`;
    }

  }, [settings.theme_color, settings.custom_theme_color, settings.layout_direction, settings.theme_mode, settings.sidebar_style, settings.favicon]);

  const getSidebarStyles = (): React.CSSProperties => {
    const primaryColor = getPrimaryColor();

    if (settings.sidebar_style === 'colored') {
      return { backgroundColor: primaryColor };
    } else if (settings.sidebar_style === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}80 100%)`
      };
    }
    return {};
  };

  const getSidebarClasses = () => {
    let classes = '';
    // Additional classes can be added here if needed
    // The variant prop handles the main styling
    return classes;
  };
  
  const getSidebarVariant = () => {
    // Map our settings to sidebar component variants
    switch (settings.sidebar_variant) {
      case 'floating':
        return 'floating';
      case 'minimal':
        return 'sidebar'; // Use sidebar variant for minimal
      case 'inset':
      default:
        return 'inset';
    }
  };

  return (
    <BrandContext.Provider value={{
      settings,
      getPrimaryColor,
      getSidebarStyles,
      getSidebarClasses,
      getSidebarVariant
    }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}