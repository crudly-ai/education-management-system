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
import { useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/feedback/toaster';


interface MediaItem {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    collection_name: string;
    url: string;
    created_at: string;
    created_by?: string;
}

interface Role {
    id: number;
    name: string;
}

interface UserCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roles: Role[];
}

export function UserCreateModal({ open, onOpenChange, roles }: UserCreateModalProps) {
    const { t } = useTranslations();
    const { toast } = useToast();

    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        roles: [] as string[],
        avatar: '' as string,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/users', {
            onSuccess: () => {
                toast.success(t('User created successfully'));
                reset();
                onOpenChange(false);
                window.dispatchEvent(new CustomEvent('refreshDataTable'));
            },
            onError: () => {
                toast.error(t('Failed to create user'), { description: t('Please check the form and try again') });
            },
        });
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

    useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open]);

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent className="sm:max-w-[800px]">
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        <ModalTitle>{t('Create User')}</ModalTitle>
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
                            <Label htmlFor="password">{t('Password')} *</Label>
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
                            {t('Create User')}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
            <Toaster />
        </Modal>
    );
}