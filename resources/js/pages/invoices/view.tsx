import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import Heading from '@/components/heading';
import { InvoiceViewLayout } from '@/components/invoices/invoice-view-layout';

export default function Invoice() {
    const { t } = useTranslations();
    const breadcrumbs = createBreadcrumbs('invoices', 'show', 'INV-2024-001');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Invoice')} />
            <div className="px-4 py-6">
                <Heading title={t('Invoice')} description={t('Professional invoice template')} />
            </div>
            <InvoiceViewLayout />
        </AuthenticatedLayout>
    );
}
