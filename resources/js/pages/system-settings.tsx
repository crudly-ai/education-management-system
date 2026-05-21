import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';

import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { SystemSettingsForm } from '@/components/system-settings/system-settings-form';
import { SystemSettings } from '@/components/system-settings/types';

export default function SystemSettingsPage({ settings, fileTypes }: { settings: SystemSettings; fileTypes: Array<{value: string; label: string}> }) {
    const { t } = useTranslations();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('System Settings'),
            href: '/system-settings',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('System Settings')} />

            <div className="px-4 py-6">
                <SystemSettingsForm
                    settings={settings}
                    fileTypes={fileTypes}
                />
            </div>
        </AppLayout>
    );
}
