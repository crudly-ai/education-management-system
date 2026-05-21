import { Button } from '@/components/ui/form/button';
import {
    Modal,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from '@/components/ui/overlay/modal';
import { useTranslations } from '@/hooks/use-translations';

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText,
    cancelText,
    variant = 'default',
}: ConfirmationDialogProps) {
    const { t } = useTranslations();
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="sm:max-w-[425px]">
                <ModalHeader>
                    <ModalTitle>{title}</ModalTitle>
                    <ModalDescription>{description}</ModalDescription>
                </ModalHeader>
                <ModalFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {cancelText || t('Cancel')}
                    </Button>
                    <Button variant={variant} onClick={handleConfirm}>
                        {confirmText || t('Confirm')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}