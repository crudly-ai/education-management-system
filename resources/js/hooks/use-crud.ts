import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';

export function useCrud<T extends { id: number; name: string }>(entityName: string, entityType: string) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const tableRef = useRef<any>(null);
    const { hasPermission } = usePermissions();

    const can = {
        create: hasPermission(`create_${entityType}`),
        edit: hasPermission(`edit_${entityType}`),
        delete: hasPermission(`delete_${entityType}`),
        view: hasPermission(`view_${entityType}`),
    };

    const handlers = {
        handleCreate: () => setCreateModalOpen(true),
        handleEdit: (item: T) => {
            setSelectedItem(item);
            setEditModalOpen(true);
        },
        handleView: (item: T) => {
            setSelectedItem(item);
            setViewModalOpen(true);
        },
        handleDelete: (item: T) => {
            setSelectedItem(item);
            setDeleteDialogOpen(true);
        },
        confirmDelete: () => {
            if (selectedItem) {
                router.delete(`/${entityName}/${selectedItem.id}`, {
                    onSuccess: () => {
                        window.dispatchEvent(new CustomEvent('refreshDataTable'));
                    },
                });
            }
        },
        handleEditFromView: (item: T) => {
            setSelectedItem(item);
            setViewModalOpen(false);
            setEditModalOpen(true);
        },
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

    return {
        // State
        createModalOpen,
        setCreateModalOpen,
        editModalOpen,
        setEditModalOpen,
        viewModalOpen,
        setViewModalOpen,
        deleteDialogOpen,
        setDeleteDialogOpen,
        selectedItem,
        setSelectedItem,
        tableRef,
        
        // Permissions
        can,
        
        // Handlers
        ...handlers,
    };
}