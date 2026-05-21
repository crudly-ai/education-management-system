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
import { ResultViewModalProps } from './types';

export function ResultViewModal({ open, onOpenChange, result, onEdit }: ResultViewModalProps) {
    const { t } = useTranslations();
    const { formatDateTime } = useFormatters();
    if (!result) return null;

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="sm:max-w-[800px]">
                <ModalHeader>
                    <ModalTitle>{t('Result Details')}</ModalTitle>
                </ModalHeader>
                
                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{t('Student')}</h3>
                            <p className="mt-1 text-sm text-gray-900">
                                {result.student?.name || result.student?.title || '-'}
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{t('Exam')}</h3>
                            <p className="mt-1 text-sm text-gray-900">
                                {result.exam?.name || result.exam?.title || '-'}
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{t('Marks')}</h3>
                            <p className="mt-1 text-sm text-gray-900">{result.marks}</p>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{t('Status')}</h3>
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                result.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {result.status}
                            </span>
                        </div>
                        

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{t('Created At')}</h3>
                            <p className="mt-1 text-sm text-gray-900">
                                {formatDateTime(result.created_at)}
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{t('Updated At')}</h3>
                            <p className="mt-1 text-sm text-gray-900">
                                {formatDateTime(result.updated_at)}
                            </p>
                        </div>
                    </div>
                </div>

                <ModalFooter>
                    {onEdit && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                onEdit(result);
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