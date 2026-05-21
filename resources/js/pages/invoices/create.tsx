import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { InvoiceCreateContent } from '@/components/invoices/invoice-create-content';
import { useTranslations } from '@/hooks/use-translations';

export default function CreateInvoice() {
    const { t } = useTranslations();
    const breadcrumbs = createBreadcrumbs('invoices', 'create');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Create Invoice')} />
            <InvoiceCreateContent />
        </AuthenticatedLayout>
    );
}
