export const trackActivity = async (action: string, details?: any) => {
    // Only track for authenticated users
    const metaAuth = document.querySelector('meta[name="user-authenticated"]');
    if (!metaAuth || metaAuth.getAttribute('content') !== 'true') {
        return;
    }

    try {
        await fetch('/api/track-activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify({
                action,
                page: window.location.pathname,
                details: details || {}
            })
        });
    } catch (error) {
        // Silent fail - don't break user experience
        console.error('Activity tracking failed:', error);
    }
};
