import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { ErrorPageContent } from '@/components/error-pages/error-page-content';

export default function Forbidden() {
    const { t } = useTranslations();
    const breadcrumbs = createBreadcrumbs('error-pages', 'show', 'Forbidden');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="403 - Forbidden" />
            <ErrorPageContent type="forbidden" />
        </AuthenticatedLayout>
    );
}