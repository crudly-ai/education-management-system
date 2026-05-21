import { ErrorPageContent } from '@/components/error-pages/error-page-content';
import { Head } from '@inertiajs/react';

interface ErrorPageProps {
    type: 'unauthorized' | 'forbidden' | 'not-found' | 'server-error' | 'maintenance';
}

export default function ErrorPage({ type }: ErrorPageProps) {
    const titles = {
        'unauthorized': '401 - Unauthorized',
        'forbidden': '403 - Forbidden', 
        'not-found': '404 - Page Not Found',
        'server-error': '500 - Server Error',
        'maintenance': '503 - Maintenance'
    };

    return (
        <>
            <Head title={titles[type]} />
            <ErrorPageContent type={type} />
        </>
    );
}