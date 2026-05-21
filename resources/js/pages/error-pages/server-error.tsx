import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { ErrorPageContent } from '@/components/error-pages/error-page-content';

export default function ServerError() {
    const { t } = useTranslations();
    const breadcrumbs = createBreadcrumbs('error-pages', 'show', 'Server Error');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title="500 - Internal Server Error" />
            <ErrorPageContent type="server-error" />
        </AuthenticatedLayout>
    );
}