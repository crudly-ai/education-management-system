import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { TasksKanban as TasksKanbanComponent } from '@/components/tasks/tasks-kanban';

export default function TasksKanban() {
    const { t } = useTranslations();
    const breadcrumbs = createBreadcrumbs('task-management');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Tasks Kanban')} />
            <TasksKanbanComponent />
        </AuthenticatedLayout>
    );
}