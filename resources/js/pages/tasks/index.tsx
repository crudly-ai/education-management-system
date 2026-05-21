import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head, router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef } from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { TaskCreateModal } from './create';
import { TaskViewModal } from './view';
import { TasksTable, TasksTableRef } from '@/components/tasks/tasks-table';

export default function TasksIndex() {
    const { t } = useTranslations();
    const { toast } = useToast();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewTask, setViewTask] = useState<any>(null);
    const tableRef = useRef<TasksTableRef>(null);

    const handleViewTask = (task: any) => {
        setViewTask(task);
        setViewModalOpen(true);
    };

    const breadcrumbs = createBreadcrumbs('Tasks');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Tasks')} />
            <div className="p-6">
                <TasksTable
                    ref={tableRef}
                    onCreateTask={() => setCreateModalOpen(true)}
                    onDeleteTask={(task) => {
                        setSelectedTask(task);
                        setDeleteDialogOpen(true);
                    }}
                    onViewTask={handleViewTask}
                    showCreateModal={false}
                    showDeleteDialog={false}
                    showViewModal={false}
                />

                <ConfirmationDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title={t('Delete Task')}
                    description={`${t('Are you sure?')} ${t('This action cannot be undone')}`}
                    confirmText={t('Delete')}
                    variant="destructive"
                    onConfirm={() => {
                        router.delete(`/tasks/${selectedTask?.id}`, {
                            onSuccess: () => {
                                toast.success(t('Task deleted successfully'));
                                tableRef.current?.refresh();
                                setDeleteDialogOpen(false);
                            },
                            onError: () => {
                                toast.error(t('Failed to delete task'), { description: t('Please try again') });
                            },
                        });
                    }}
                />

                <TaskCreateModal
                    open={createModalOpen}
                    onOpenChange={setCreateModalOpen}
                />

                <TaskViewModal
                    open={viewModalOpen}
                    onOpenChange={setViewModalOpen}
                    task={viewTask}
                    onEdit={(task) => {
                        setViewModalOpen(false);
                        // TODO: Open edit modal
                    }}
                    onDelete={(task) => {
                        setViewModalOpen(false);
                        setSelectedTask(task);
                        setDeleteDialogOpen(true);
                    }}
                />


            </div>
        </AuthenticatedLayout>
    );
}