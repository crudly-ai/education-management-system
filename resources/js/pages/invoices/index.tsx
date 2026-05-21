import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head, router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef } from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { InvoicesTable, InvoicesTableRef } from '@/components/invoices/invoices-table';

export default function InvoicesIndex() {
    const { t } = useTranslations();
    const { toast } = useToast();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const tableRef = useRef<InvoicesTableRef>(null);



    const breadcrumbs = createBreadcrumbs('invoices');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Invoices')} />
            <div className="p-6">
                <InvoicesTable
                    ref={tableRef}
                    onCreateInvoice={() => router.get('/invoices/create')}
                    onDeleteInvoice={(invoice) => {
                        setSelectedInvoice(invoice);
                        setDeleteDialogOpen(true);
                    }}
                    showDeleteDialog={false}
                />

                <ConfirmationDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title={t('Delete Invoice')}
                    description={`${t('Are you sure?')} ${t('This action cannot be undone')}`}
                    confirmText={t('Delete')}
                    variant="destructive"
                    onConfirm={() => {
                        router.delete(`/invoices/${selectedInvoice?.id}`, {
                            onSuccess: () => {
                                toast.success(t('Invoice deleted successfully'));
                                tableRef.current?.refresh();
                                setDeleteDialogOpen(false);
                            },
                            onError: () => {
                                toast.error(t('Failed to delete invoice'), { description: t('Please try again') });
                            },
                        });
                    }}
                />

            </div>
        </AuthenticatedLayout>
    );
}
