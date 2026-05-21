import { ConfirmationDialog, YajraDataTable } from '@/components/datatable';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { DataTableColumn } from '@/types/crud';

interface CrudIndexProps {
    title: string;
    entityName: string;
    entityType: string;
    columns: DataTableColumn[];
    CreateModal?: React.ComponentType<any>;
    EditModal?: React.ComponentType<any>;
    ViewModal?: React.ComponentType<any>;
    data?: any;
    selectedItemKey?: string;
    customActions?: React.ReactNode;
    customRowActions?: (item: any) => React.ReactNode;
}

export default function CrudIndex({
    title,
    entityName,
    entityType,
    columns,
    CreateModal,
    EditModal,
    ViewModal,
    data = {},
    selectedItemKey = 'item',
    customActions,
    customRowActions
}: CrudIndexProps) {
    const { hasPermission } = usePermissions();
    
    const can = {
        create: hasPermission(`create_${entityType}`),
        edit: hasPermission(`edit_${entityType}`),
        delete: hasPermission(`delete_${entityType}`),
        view: hasPermission(`view_${entityType}`),
    };

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const tableRef = useRef<any>(null);

    const handleCreate = () => setCreateModalOpen(true);

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        setEditModalOpen(true);
    };

    const handleView = (item: any) => {
        setSelectedItem(item);
        setViewModalOpen(true);
    };

    const handleDelete = (item: any) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedItem) {
            router.delete(`/${entityName}/${selectedItem.id}`, {
                onSuccess: () => {
                    window.dispatchEvent(new CustomEvent('refreshDataTable'));
                },
            });
        }
    };

    const handleEditFromView = (item: any) => {
        setSelectedItem(item);
        setViewModalOpen(false);
        setEditModalOpen(true);
    };

    useEffect(() => {
        const handleRefresh = () => {
            if (tableRef.current) {
                tableRef.current.refresh();
            }
        };

        window.addEventListener('refreshDataTable', handleRefresh);
        return () => window.removeEventListener('refreshDataTable', handleRefresh);
    }, []);

    const breadcrumbs = createBreadcrumbs(entityName);

    const createModalProps = {
        open: createModalOpen,
        onOpenChange: setCreateModalOpen,
        ...data
    };

    const editModalProps = {
        open: editModalOpen,
        onOpenChange: setEditModalOpen,
        [selectedItemKey]: selectedItem,
        ...data
    };

    const viewModalProps = {
        open: viewModalOpen,
        onOpenChange: setViewModalOpen,
        [selectedItemKey]: selectedItem,
        onEdit: can.edit ? handleEditFromView : undefined
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="p-6">
                <YajraDataTable
                    ref={tableRef}
                    url={`/${entityName}`}
                    columns={columns}
                    title={title}
                    customActions={customActions}
                    customRowActions={customRowActions}
                />

                {can.create && CreateModal && <CreateModal {...createModalProps} />}
                {can.edit && EditModal && <EditModal {...editModalProps} />}
                {can.view && ViewModal && <ViewModal {...viewModalProps} />}

                <ConfirmationDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title={`Delete ${entityType}`}
                    description={`Are you sure you want to delete "${selectedItem?.name || selectedItem?.title || selectedItem?.full_name || selectedItem?.employee_id || 'this item'}"? This action cannot be undone.`}
                    onConfirm={confirmDelete}
                    confirmText="Delete"
                    variant="destructive"
                />
            </div>
        </AuthenticatedLayout>
    );
}