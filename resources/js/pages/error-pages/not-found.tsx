import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { ErrorPageContent } from '@/components/error-pages/error-page-content';

export default function NotFound() {
    const { t } = useTranslations();
    const breadcrumbs = createBreadcrumbs('error-pages', 'show', 'Not Found');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="404 - Not Found" />
            <ErrorPageContent type="not-found" />
        </AuthenticatedLayout>
    );
}