import { Button } from '@/components/ui/form/button';
import {
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from '@/components/ui/overlay/modal';
import { useTranslations } from '@/hooks/use-translations';
import { useFormatters } from '@/utils/formatters';

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    created_at: string;
    updated_at: string;
}

interface UserViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    onEdit?: (user: User) => void;
}

export function UserViewModal({ open, onOpenChange, user, onEdit }: UserViewModalProps) {
    const { t } = useTranslations();
    const { formatDateTime } = useFormatters();
    if (!user) return null;

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="sm:max-w-[800px]">
                <ModalHeader>
                    <ModalTitle>{t('User Details')}</ModalTitle>
                </ModalHeader>
                
                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{t('Name')}</h3>
                            <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{t('Email')}</h3>
                            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{t('Created At')}</h3>
                            <p className="mt-1 text-sm text-gray-900">
                                {formatDateTime(user.created_at)}
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{t('Updated At')}</h3>
                            <p className="mt-1 text-sm text-gray-900">
                                {formatDateTime(user.updated_at)}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-4">{t('Roles')}</h3>
                        {user.roles.length > 0 ? (
                            <div className="border rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {user.roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className="bg-green-50 px-3 py-2 rounded-md"
                                        >
                                            <span className="text-sm font-medium text-green-800 capitalize">
                                                {role.name.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="border rounded-lg p-8 text-center">
                                <p className="text-gray-500">{t('No roles assigned')}</p>
                            </div>
                        )}
                    </div>
                </div>

                <ModalFooter>
                    {onEdit && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                onEdit(user);
                                onOpenChange(false);
                            }}
                        >
                            {t('Edit')}
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('Close')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}