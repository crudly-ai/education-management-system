import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { ErrorPageContent } from '@/components/error-pages/error-page-content';

export default function Maintenance() {
    const { t } = useTranslations();
    const breadcrumbs = createBreadcrumbs('error-pages', 'show', 'Maintenance');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="503 - Maintenance Mode" />
            <ErrorPageContent type="maintenance" />
        </AuthenticatedLayout>
    );
}