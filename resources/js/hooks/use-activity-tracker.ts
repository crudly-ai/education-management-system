import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { trackActivity } from '@/utils/activity-tracker';

export const useActivityTracker = (pageName?: string) => {
    const { auth } = usePage().props as any;

    // Auto-track page views
    useEffect(() => {
        if (auth?.user) {
            const page = pageName || window.location.pathname.replace(/\//g, '_').replace(/^_/, '') || 'home';
            trackActivity(`page_viewed_${page}`);
        }
    }, [auth?.user, pageName]);

    // Return tracking function for manual events
    return {
        track: trackActivity
    };
};
