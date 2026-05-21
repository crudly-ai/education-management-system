import { ProjectsTable } from '@/components/projects/projects-table';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { useRef } from 'react';

export default function Index() {
    const { t } = useTranslations();
    const tableRef = useRef<any>(null);

    const breadcrumbs = createBreadcrumbs('projects');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Project Management')} />
            <div className="p-6">
                <ProjectsTable ref={tableRef} />
            </div>
        </AuthenticatedLayout>
    );
}