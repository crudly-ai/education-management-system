import { YajraDataTable } from '@/components/datatable';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head, router } from '@inertiajs/react';
import { useFormatters } from '@/utils/formatters';
import { UserCreateModal } from './create';
import { UserEditModal } from './edit';
import { UserViewModal } from './view';
import { UserIndexProps } from './types';
import { usePermissions } from '@/hooks/use-permissions';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/form/button';
import { Toaster } from '@/components/ui/feedback/toaster';
import { Card, CardContent, CardHeader } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/feedback/badge';

import { Plus, Eye, Edit, Trash2, Mail, Calendar, Users, BookOpen, UserCheck, Activity } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function Index({ roles, roleOptions = [] }: UserIndexProps) {
    const { hasPermission } = usePermissions();
    const { formatDate, formatDateTime, getMediaUrl } = useFormatters();
    const { t } = useTranslations();
    const { toast } = useToast();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
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
            data: 'avatar',
            name: 'avatar',
            title: t('Avatar'),
            orderable: false,
            searchable: false,
            render: (data: string | null) => (
                data ? (
                    <img 
                        src={getMediaUrl(data)} 
                        alt={t('Avatar')} 
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border border-blue-200">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                )
            ),
        },
        {
            data: 'name',
            name: 'name',
            title: t('Name'),
            orderable: true,
            searchable: true,
        },
        {
            data: 'email',
            name: 'email',
            title: t('Email'),
            orderable: true,
            searchable: true,
        },
        {
            data: 'roles_count',
            name: 'roles_count',
            title: t('Roles Count'),
            orderable: false,
            searchable: false,
            render: (data: number) => (
                <span className="text-sm text-gray-600">
                    {data} {data === 1 ? t('role') : t('roles')}
                </span>
            ),
        },
        {
            data: 'roles_list',
            name: 'roles_list',
            title: t('Roles'),
            orderable: false,
            searchable: false,
            render: (data: string[]) => (
                <div className="flex flex-wrap gap-1">
                    {data.slice(0, 3).map((role, index) => (
                        <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {role.replace('_', ' ').toUpperCase()}
                        </span>
                    ))}
                    {data.length > 3 && (
                        <span className="text-xs text-gray-500">+{data.length - 3} {t('more')}</span>
                    )}
                </div>
            ),
        },
        {
            data: 'email_verified',
            name: 'email_verified_at',
            title: t('Email Verified'),
            orderable: true,
            searchable: false,
            render: (data: boolean) => (
                <Badge variant={data ? 'default' : 'destructive'} className="text-xs">
                    {data ? t('Verified') : t('Not Verified')}
                </Badge>
            ),
        },
        {
            data: 'created_at_formatted',
            name: 'created_at',
            title: t('Created At'),
            orderable: true,
            searchable: false,
            render: (data: string) => formatDateTime(data),
        },
        {
            data: 'email_verified_at_formatted',
            name: 'email_verified_at',
            title: t('Verified At'),
            orderable: true,
            searchable: false,
            render: (data: string | null) => data ? formatDateTime(data) : '-',
        },
    ];

    const filters = [
        {
            key: 'role_filter',
            label: t('Roles'),
            type: 'select' as const,
            options: roleOptions,
            placeholder: t('Filter by role')
        },
        {
            key: 'date_from',
            label: t('Created From'),
            type: 'date' as const,
            placeholder: t('Select start date')
        },
        {
            key: 'date_to',
            label: t('Created To'),
            type: 'date' as const,
            placeholder: t('Select end date')
        }
    ];

    const customActions = (
        <>
            {hasPermission('create_user') && (
                <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('Create User')}
                </Button>
            )}
        </>
    );

    const customRowActions = (item: any) => (
        <>
            {hasPermission('view_user') && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setSelectedUser(item);
                        setViewModalOpen(true);
                    }}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            )}
            {hasPermission('view_user') && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.visit(`/users/${item.id}/activity-log`)}
                    title="View Activity Log"
                >
                    <Activity className="h-4 w-4" />
                </Button>
            )}
            {hasPermission('edit_user') && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setSelectedUser(item);
                        setEditModalOpen(true);
                    }}
                >
                    <Edit className="h-4 w-4" />
                </Button>
            )}
            {hasPermission('manage_all_user') && !item.roles_list?.includes('Admin') && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        window.location.href = `/impersonate/take/${item.id}`;
                    }}
                    title={t('Impersonate User')}
                >
                    <UserCheck className="h-4 w-4" />
                </Button>
            )}
            {hasPermission('delete_user') && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setSelectedUser(item);
                        setDeleteDialogOpen(true);
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </>
    );

    const renderGridItem = (user: any) => (
        <Card className="bg-white border">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header with Avatar */}
                    <div className="flex items-center gap-3">
                        {user.avatar ? (
                            <img 
                                src={getMediaUrl(user.avatar)} 
                                alt={user.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-2 border-blue-200">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-sm">{user.name}</h3>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            {customRowActions(user)}
                        </div>
                    </div>
                    
                    {/* Roles */}
                    <div className="flex flex-wrap gap-1">
                        {user.roles_list.slice(0, 3).map((role: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                                {role.replace('_', ' ')}
                            </Badge>
                        ))}
                        {user.roles_list.length > 3 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                                +{user.roles_list.length - 3}
                            </Badge>
                        )}
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{user.roles_count} {user.roles_count === 1 ? t('role') : t('roles')}</span>
                            </div>
                            <Badge variant={user.email_verified ? 'default' : 'destructive'} className="text-xs px-2 py-0.5 w-fit">
                                {user.email_verified ? t('Verified') : t('Not Verified')}
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-1 text-right">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDateTime(user.created_at_formatted)}</span>
                            </div>
                            {user.email_verified_at_formatted && (
                                <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{formatDateTime(user.email_verified_at_formatted)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const breadcrumbs = createBreadcrumbs('users');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Users')} />
            <div className="p-6">
                <YajraDataTable
                    ref={tableRef}
                    url="/users"
                    columns={columns}
                    title={t('Users')}
                    customActions={customActions}
                    customRowActions={customRowActions}
                    filters={filters}
                    gridViewEnabled={true}
                    renderGridItem={renderGridItem}
                    emptyStateIcon={<BookOpen className="h-8 w-8 text-gray-400" />}
                />
            
                {hasPermission('create_user') && (
                    <UserCreateModal
                        open={createModalOpen}
                        onOpenChange={setCreateModalOpen}
                        roles={roles}
                    />
                )}
                
                {hasPermission('edit_user') && (
                    <UserEditModal
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        user={selectedUser}
                        roles={roles}
                    />
                )}
                
                {hasPermission('view_user') && (
                    <UserViewModal
                        open={viewModalOpen}
                        onOpenChange={setViewModalOpen}
                        user={selectedUser}
                        onEdit={hasPermission('edit_user') ? (user) => {
                            setSelectedUser(user);
                            setViewModalOpen(false);
                            setEditModalOpen(true);
                        } : undefined}
                    />
                )}
                
                <ConfirmationDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title={t('Delete User')}
                    description={`${t('Are you sure?')} ${t('This action cannot be undone')}`}
                    confirmText={t('Delete')}
                    variant="destructive"
                    onConfirm={() => {
                        router.delete(`/users/${selectedUser.id}`, {
                            onSuccess: () => {
                                toast.success(t('User deleted successfully'));
                                window.dispatchEvent(new CustomEvent('refreshDataTable'));
                                setDeleteDialogOpen(false);
                            },
                            onError: () => {
                                toast.error(t('Failed to delete user'), { description: t('Please try again') });
                            },
                        });
                    }}
                />
                <Toaster />
            </div>
        </AuthenticatedLayout>
    );
}