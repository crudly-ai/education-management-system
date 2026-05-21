import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Textarea } from '@/components/ui/form/textarea';
import { Checkbox } from '@/components/ui/form/checkbox';
import { IconSelector } from '@/components/ui/form/icon-selector';
import {
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from '@/components/ui/overlay/modal';
import { useForm, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/feedback/toaster';

interface ProjectCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProjectCreateModal({ open, onOpenChange }: ProjectCreateModalProps) {
    const { t } = useTranslations();
    const { toast } = useToast();
    const { auth } = usePage().props as any;
    const isAdmin = auth?.user?.roles?.some((role: any) => role.name === 'Admin');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        icon: 'Building2',
        is_public: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/projects', {
            onSuccess: (page) => {
                toast.success(t('Project created successfully'));
                reset();
                onOpenChange(false);
                
                // For admin users, refresh the datatable
                if (isAdmin) {
                    window.dispatchEvent(new CustomEvent('refreshDataTable'));
                } else {
                    // For non-admin users, the backend will redirect to crudly-builder
                    // No additional action needed as Inertia handles the redirect
                }
            },
            onError: () => {
                toast.error(t('Failed to create project'), { description: t('Please check the form and try again') });
            },
        });
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
            <ModalContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        <ModalTitle>{t('Create Project')}</ModalTitle>
                    </ModalHeader>
                    
                    <div className="space-y-6 py-4">
                        <div>
                            <Label htmlFor="name">{t('Name')} *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                placeholder={t('Enter project name')}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="description">{t('Description')}</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                error={errors.description}
                                placeholder={t('Enter project description')}
                                rows={3}
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        <div>
                            <Label htmlFor="icon">{t('Icon')}</Label>
                            <IconSelector
                                value={data.icon}
                                onValueChange={(value) => setData('icon', value)}
                                placeholder={t('Choose an icon...')}
                            />
                            {errors.icon && <p className="text-red-500 text-sm mt-1">{errors.icon}</p>}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_public"
                                checked={data.is_public}
                                onCheckedChange={(checked) => setData('is_public', !!checked)}
                            />
                            <Label htmlFor="is_public" className="text-sm cursor-pointer">
                                {t('Make this project public')}
                            </Label>
                        </div>
                    </div>

                    <ModalFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            {t('Cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {t('Create Project')}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
            <Toaster />
        </Modal>
    );
}