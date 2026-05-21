import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { OrderViewContent } from '@/components/orders/order-view-content';

interface OrderViewProps {
    order: {
        id: number;
        customer_name: string;
        customer_email: string;
        type: string;
        status: string;
        amount: number;
        created_at: string;
        items?: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
    };
}

export default function OrderView({ order }: OrderViewProps) {
    const { t } = useTranslations();

    const breadcrumbs = createBreadcrumbs('orders', 'show', `#ORD-${order.id.toString().padStart(4, '0')}`);

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('Order')} #ORD-${order.id.toString().padStart(4, '0')}`} />
            <div className="p-6">
                <OrderViewContent order={order} />
            </div>
        </AuthenticatedLayout>
    );
}