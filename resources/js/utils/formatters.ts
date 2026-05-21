import { usePage } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import { Building2 } from 'lucide-react';
import React from 'react';

interface SystemSettings {
    date_format: string;
    time_format: string;
    currency_symbol: string;
    currency_position: string;
    decimal_separator: string;
    thousand_separator: string;
}

export const useFormatters = () => {
    const { systemSettings, storageUrl } = usePage().props as { systemSettings: SystemSettings; storageUrl: string };
    
    const getMediaUrl = (path: string): string => {
        if (!path) return '';
        return `${storageUrl}${path}`;
    };

    const formatCurrency = (amount: number | string | null | undefined): string => {
        const numAmount = Number(amount) || 0;
        const formatted = numAmount.toFixed(2)
            .replace('.', systemSettings.decimal_separator)
            .replace(/\B(?=(\d{3})+(?!\d))/g, systemSettings.thousand_separator);
        
        return systemSettings.currency_position === 'before' 
            ? `${systemSettings.currency_symbol}${formatted}` 
            : `${formatted}${systemSettings.currency_symbol}`;
    };

    const formatDate = (date: string | Date): string => {
        if (!date) return '';
        const d = new Date(date);
        
        if (isNaN(d.getTime())) return '';
        
        if (systemSettings.date_format === 'Y-m-d') {
            return d.toISOString().split('T')[0];
        } else if (systemSettings.date_format === 'm/d/Y') {
            return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
        } else if (systemSettings.date_format === 'd/m/Y') {
            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        } else if (systemSettings.date_format === 'd-m-Y') {
            return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
        }
        return d.toISOString().split('T')[0];
    };

    const formatTime = (date: string | Date): string => {
        if (!date) return '';
        const d = new Date(date);
        
        if (isNaN(d.getTime())) return '';
        
        return systemSettings.time_format === '12' 
            ? d.toLocaleTimeString('en-US') 
            : d.toLocaleTimeString('en-GB');
    };

    const formatDateTime = (date: string | Date): string => {
        return `${formatDate(date)} ${formatTime(date)}`;
    };

    const formatIcon = (iconName: string | null | undefined, className: string = 'h-4 w-4') => {
        if (!iconName) return React.createElement(Building2, { className });
        const IconComponent = (LucideIcons as any)[iconName];
        return IconComponent ? React.createElement(IconComponent, { className }) : React.createElement(Building2, { className });
    };

    return {
        formatCurrency,
        formatDate,
        formatTime,
        formatDateTime,
        getMediaUrl,
        formatIcon,
    };
};