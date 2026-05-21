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
import { RoleViewModalProps } from './types';

export function RoleViewModal({ open, onOpenChange, role, onEdit }: RoleViewModalProps) {
    const { t } = useTranslations();
    const { formatDateTime } = useFormatters();
    if (!role) return null;

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="sm:max-w-[800px]">
                <ModalHeader>
                    <ModalTitle>{t('Role')} {t('Details')}</ModalTitle>
                </ModalHeader>
                
                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{t('Name')}</h3>
                            <p className="mt-1 text-sm text-gray-900">{role.name}</p>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{t('Created At')}</h3>
                            <p className="mt-1 text-sm text-gray-900">
                                {formatDateTime(role.created_at)}
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{t('Updated At')}</h3>
                            <p className="mt-1 text-sm text-gray-900">
                                {formatDateTime(role.updated_at)}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-4">{t('Permissions')}</h3>
                        {role.permissions.length > 0 ? (
                            <div className="border rounded-lg p-4 max-h-80 overflow-y-auto">
                                {Object.entries(
                                    role.permissions.reduce((acc, permission) => {
                                        const parts = permission.name.split('_');
                                        const module = parts.length > 1 ? parts[parts.length - 1] : 'general';
                                        if (!acc[module]) acc[module] = [];
                                        acc[module].push(permission);
                                        return acc;
                                    }, {} as Record<string, typeof role.permissions>)
                                ).map(([module, modulePermissions]) => (
                                    <div key={module} className="mb-6 last:mb-0">
                                        <h4 className="font-medium text-gray-900 capitalize mb-3">
                                            {module === 'general' ? 'General' : module.replace('_', ' ')} Permissions
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 pl-4 border-l-2 border-gray-100">
                                            {modulePermissions.map((permission) => (
                                                <div
                                                    key={permission.id}
                                                    className="bg-blue-50 px-3 py-2 rounded-md"
                                                >
                                                    <span className="text-sm font-medium text-blue-800 capitalize">
                                                        {permission.name.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border rounded-lg p-8 text-center">
                                <p className="text-gray-500">{t('No permissions assigned')}</p>
                            </div>
                        )}
                    </div>
                </div>

                <ModalFooter>
                    {onEdit && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                onEdit(role);
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