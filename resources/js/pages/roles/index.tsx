import { YajraDataTable } from '@/components/datatable';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head, router } from '@inertiajs/react';
import { useFormatters } from '@/utils/formatters';
import { RoleCreateModal } from './create';
import { RoleEditModal } from './edit';
import { RoleViewModal } from './view';
import { RoleIndexProps } from './types';
import { usePermissions } from '@/hooks/use-permissions';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/form/button';
import { Toaster } from '@/components/ui/feedback/toaster';
import { Card, CardContent, CardHeader } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/feedback/badge';
import { Plus, Eye, Edit, Trash2, Calendar, Shield, Users } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function Index({ permissions, permissionOptions = [] }: RoleIndexProps & { permissionOptions: { value: string; label: string }[] }) {
    const { hasPermission } = usePermissions();
    const { t } = useTranslations();
    const { toast } = useToast();
    const { formatDate } = useFormatters();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const tableRef = useRef<any>(null);

    useEffect(() => {
        const handleRefresh = () => {
            if (tableRef.current) {
                tableRef.current.refresh();
            }
        };

        window.addEventListener('refreshDataTable', handleRefresh);
        return () => window.removeEventListener('refreshDataTable', handleRefresh);
    }, []);

    const columns = [
        {
            data: 'id',
            name: 'id',
            title: t('ID'),
            orderable: true,
            searchable: false,
        },
        {
            data: 'name',
            name: 'name',
            title: t('Name'),
            orderable: true,
            searchable: true,
        },
        {
            data: 'permissions_count',
            name: 'permissions_count',
            title: t('Permissions Count'),
            orderable: false,
            searchable: false,
            render: (data: number) => (
                <span className="text-sm text-gray-600">
                    {data} {data === 1 ? t('permission') : t('permissions')}
                </span>
            ),
        },
        {
            data: 'permissions_list',
            name: 'permissions_list',
            title: t('Permissions'),
            orderable: false,
            searchable: false,
            render: (data: string[]) => (
                <div className="flex flex-wrap gap-1 max-w-xs">
                    {data.slice(0, 2).map((permission, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-1 capitalize">
                            {permission.replace(/_/g, ' ')}
                        </Badge>
                    ))}
                    {data.length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-1 text-gray-500">
                            +{data.length - 2} {t('more')}
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            data: 'created_at_formatted',
            name: 'created_at',
            title: t('Created At'),
            orderable: true,
            searchable: false,
            render: (data: string) => formatDate(data),
        },
    ];

    const filters = [
        {
            key: 'permission_filter',
            label: t('Permission'),
            type: 'select' as const,
            options: permissionOptions,
            placeholder: t('Filter by permission')
        },
        {
            key: 'date_from',
            label: 'Created From',
            type: 'date' as const,
            placeholder: 'Select start date'
        },
        {
            key: 'date_to',
            label: 'Created To',
            type: 'date' as const,
            placeholder: 'Select end date'
        }
    ];

    const customActions = (
        <>
            {hasPermission('create_role') && (
                <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('Create Role')}
                </Button>
            )}
        </>
    );

    const customRowActions = (item: any) => (
        <>
            {hasPermission('view_role') && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setSelectedRole(item);
                        setViewModalOpen(true);
                    }}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            )}
            {hasPermission('edit_role') && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setSelectedRole(item);
                        setEditModalOpen(true);
                    }}
                >
                    <Edit className="h-4 w-4" />
                </Button>
            )}
            {hasPermission('delete_role') && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setSelectedRole(item);
                        setDeleteDialogOpen(true);
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </>
    );

    const renderGridItem = (role: any) => (
        <Card className="bg-white border">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center border-2 border-purple-200">
                            <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-sm">{role.name}</h3>
                            <p className="text-xs text-gray-500">{role.permissions_count} {role.permissions_count === 1 ? t('permission') : t('permissions')}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            {customRowActions(role)}
                        </div>
                    </div>
                    
                    {/* Permissions */}
                    <div className="flex flex-wrap gap-1">
                        {role.permissions_list.slice(0, 3).map((permission: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                                {permission.replace('_', ' ')}
                            </Badge>
                        ))}
                        {role.permissions_list.length > 3 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                                +{role.permissions_list.length - 3}
                            </Badge>
                        )}
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                        <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span>{role.permissions_count} {role.permissions_count === 1 ? t('permission') : t('permissions')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(role.created_at_formatted)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const breadcrumbs = createBreadcrumbs('roles');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Roles')} />
            <div className="p-6">
                <YajraDataTable
                    ref={tableRef}
                    url="/roles"
                    columns={columns}
                    title={t('Roles')}
                    customActions={customActions}
                    customRowActions={customRowActions}
                    filters={filters}
                    gridViewEnabled={true}
                    renderGridItem={renderGridItem}
                    emptyStateIcon={<Shield className="h-8 w-8 text-gray-400" />}
                />
            
                {hasPermission('create_role') && (
                    <RoleCreateModal
                        open={createModalOpen}
                        onOpenChange={setCreateModalOpen}
                        permissions={permissions}
                    />
                )}
                
                {hasPermission('edit_role') && (
                    <RoleEditModal
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        role={selectedRole}
                        permissions={permissions}
                    />
                )}
                
                {hasPermission('view_role') && (
                    <RoleViewModal
                        open={viewModalOpen}
                        onOpenChange={setViewModalOpen}
                        role={selectedRole}
                        onEdit={hasPermission('edit_role') ? (role) => {
                            setSelectedRole(role);
                            setViewModalOpen(false);
                            setEditModalOpen(true);
                        } : undefined}
                    />
                )}
                
                <ConfirmationDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title={t('Delete Role')}
                    description={`Are you sure you want to delete ${selectedRole?.name}? This action cannot be undone.`}
                    confirmText={t('Delete')}
                    variant="destructive"
                    onConfirm={() => {
                        router.delete(`/roles/${selectedRole.id}`, {
                            onSuccess: () => {
                                toast.success(t('Role deleted successfully'));
                                window.dispatchEvent(new CustomEvent('refreshDataTable'));
                                setDeleteDialogOpen(false);
                            },
                            onError: () => {
                                toast.error(t('Failed to delete role'), { description: t('Please try again') });
                            },
                        });
                    }}
                />
                <Toaster />
            </div>
        </AuthenticatedLayout>
    );
}