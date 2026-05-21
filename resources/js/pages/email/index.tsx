import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { EmailLayout } from '@/components/email/email-layout';

export default function EmailIndex() {
    const { t } = useTranslations();
    const breadcrumbs = createBreadcrumbs('email', 'index', 'Email');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Email')} />
            <div className="h-[calc(100vh-120px)]">
                <EmailLayout />
            </div>
        </AuthenticatedLayout>
    );
}