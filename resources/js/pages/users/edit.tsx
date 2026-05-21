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
import { MediaSelector } from '@/components/ui/form/media-selector';
import { router, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/feedback/toaster';
import { getMediaUrl } from '@/utils/formatters';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    avatar?: string;
    avatar_url?: string;
}

interface UserEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    roles: Role[];
}



export function UserEditModal({ open, onOpenChange, user, roles }: UserEditModalProps) {
    const { t } = useTranslations();
    const { toast } = useToast();

    
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        roles: [] as string[],
        avatar: '' as string,
    });

    useEffect(() => {
        if (user && open) {
            setData({
                name: user.name,
                email: user.email,
                password: '',
                roles: user.roles.map((r) => r.name),
                avatar: user.avatar || '',
            });
        } else if (!open) {
            reset();
        }
    }, [user, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            put(`/users/${user.id}`, {
                onSuccess: () => {
                    toast.success(t('User updated successfully'));
                    reset();
                    onOpenChange(false);
                    window.dispatchEvent(new CustomEvent('refreshDataTable'));
                },
                onError: () => {
                    toast.error(t('Failed to update user'), { description: t('Please check the form and try again') });
                },
            });
        }
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleName]);
        } else {
            setData('roles', data.roles.filter((r) => r !== roleName));
        }
    };

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    if (!user) return null;

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent className="sm:max-w-[800px]">
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        <ModalTitle>{t('Edit User')}</ModalTitle>
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
                            <Label htmlFor="email">{t('Email')} *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <Label htmlFor="password">{t('Password (leave blank to keep current)')}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <Label>{t('Avatar')}</Label>
                            <MediaSelector
                                selectedPaths={data.avatar ? [data.avatar] : []}
                                multiple={false}
                                label="Avatar"
                                title={t('Select User Avatar')}
                                onChange={(paths) => setData('avatar', paths[0] || '')}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <Label>{t('Roles')}</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const allRoles = roles.map(r => r.name);
                                        const isAllSelected = allRoles.every(r => data.roles.includes(r));
                                        setData('roles', isAllSelected ? [] : allRoles);
                                    }}
                                >
                                    {roles.every(r => data.roles.includes(r.name)) ? t('Deselect All') : t('Select All')}
                                </Button>
                            </div>
                            
                            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    {roles.map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={data.roles.includes(role.name)}
                                                onCheckedChange={(checked) =>
                                                    handleRoleChange(role.name, !!checked)
                                                }
                                            />
                                            <Label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer capitalize">
                                                {role.name.replace(/_/g, ' ')}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <ModalFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            {t('Cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {t('Update User')}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
            <Toaster />
        </Modal>
    );
}