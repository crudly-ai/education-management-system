import { OrdersTable } from '@/components/orders/orders-table';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { useRef } from 'react';

export default function OrdersIndex() {
    const { t } = useTranslations();
    const tableRef = useRef<any>(null);

    const breadcrumbs = createBreadcrumbs('orders');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Orders')} />
            <div className="p-6">
                <OrdersTable ref={tableRef} />
            </div>
        </AuthenticatedLayout>
    );
}