import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { ChatLayout } from '@/components/chat/chat-layout';

export default function ChatIndex() {
    const { t } = useTranslations();
    const breadcrumbs = createBreadcrumbs('chat', 'index', 'Chat');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Chat')} />
            <div className="h-[calc(100vh-120px)]">
                <ChatLayout />
            </div>
        </AuthenticatedLayout>
    );
}