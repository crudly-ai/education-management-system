import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Checkbox } from '@/components/ui/form/checkbox';
import {
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from '@/components/ui/overlay/modal';
import { router, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/feedback/toaster';
import { RoleEditModalProps, RoleFormData } from './types';

export function RoleEditModal({ open, onOpenChange, role, permissions }: RoleEditModalProps) {
    const { t } = useTranslations();
    const { toast } = useToast();
    const { data, setData, put, processing, errors, reset } = useForm<RoleFormData>({
        name: '',
        permissions: [],
    });

    useEffect(() => {
        if (role && open) {
            setData({
                name: role.name,
                permissions: role.permissions.map((p) => p.name),
            });
        } else if (!open) {
            reset();
        }
    }, [role, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (role) {
            put(`/roles/${role.id}`, {
                onSuccess: () => {
                    toast.success(t('Role updated successfully'));
                    reset();
                    onOpenChange(false);
                    window.dispatchEvent(new CustomEvent('refreshDataTable'));
                },
                onError: () => {
                    toast.error(t('Failed to update role'), { description: t('Please check the form and try again') });
                },
            });
        }
    };

    const handlePermissionChange = (permissionName: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData('permissions', data.permissions.filter((p) => p !== permissionName));
        }
    };

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    if (!role) return null;

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent className="sm:max-w-[800px]">
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        <ModalTitle>{t('Edit Role')}</ModalTitle>
                    </ModalHeader>
                    
                    <div className="space-y-6 py-4">
                        <div>
                            <Label htmlFor="name">{t('Name')} *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <Label>{t('Permissions')}</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const allPermissions = permissions.map(p => p.name);
                                        const isAllSelected = allPermissions.every(p => data.permissions.includes(p));
                                        setData('permissions', isAllSelected ? [] : allPermissions);
                                    }}
                                >
                                    {permissions.every(p => data.permissions.includes(p.name)) ? t('Deselect All') : t('Select All')}
                                </Button>
                            </div>
                            
                            <div className="border rounded-lg p-4 max-h-80 overflow-y-auto">
                                {Object.entries(
                                    permissions.reduce((acc, permission) => {
                                        const parts = permission.name.split('_');
                                        const module = parts.length > 1 ? parts[parts.length - 1] : 'general';
                                        if (!acc[module]) acc[module] = [];
                                        acc[module].push(permission);
                                        return acc;
                                    }, {} as Record<string, typeof permissions>)
                                ).map(([module, modulePermissions]) => (
                                    <div key={module} className="mb-6 last:mb-0">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-gray-900 capitalize">
                                                {module === 'general' ? 'General' : module.replace('_', ' ')} Permissions
                                            </h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const modulePerms = modulePermissions.map(p => p.name);
                                                    const isModuleSelected = modulePerms.every(p => data.permissions.includes(p));
                                                    if (isModuleSelected) {
                                                        setData('permissions', data.permissions.filter(p => !modulePerms.includes(p)));
                                                    } else {
                                                        setData('permissions', [...new Set([...data.permissions, ...modulePerms])]);
                                                    }
                                                }}
                                                className="text-xs h-6"
                                            >
                                                {modulePermissions.every(p => data.permissions.includes(p.name)) ? t('Deselect') : t('Select')} {t('All')}
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-gray-100">
                                            {modulePermissions.map((permission) => (
                                                <div key={permission.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`permission-${permission.id}`}
                                                        checked={data.permissions.includes(permission.name)}
                                                        onCheckedChange={(checked) =>
                                                            handlePermissionChange(permission.name, !!checked)
                                                        }
                                                    />
                                                    <Label htmlFor={`permission-${permission.id}`} className="text-sm cursor-pointer capitalize">
                                                        {permission.name.replace(/_/g, ' ')}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <ModalFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            {t('Cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {t('Update Role')}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
            <Toaster />
        </Modal>
    );
}