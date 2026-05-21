import { YajraDataTable } from '@/components/datatable';
import { useFormatters } from '@/utils/formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/feedback/badge';
import { Plus, Eye, Edit, Trash2, Download, Mail, Calendar, Receipt, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/navigation/dropdown-menu';
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { router } from '@inertiajs/react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Toaster } from '@/components/ui/feedback/toaster';

interface InvoicesTableProps {
  onCreateInvoice?: () => void;
  onDeleteInvoice?: (invoice: any) => void;
  onViewInvoice?: (invoiceNumber: string) => void;
  showDeleteDialog?: boolean;
}

export interface InvoicesTableRef {
  refresh: () => void;
}

export const InvoicesTable = forwardRef<InvoicesTableRef, InvoicesTableProps>(({
  onCreateInvoice,
  onDeleteInvoice,
  onViewInvoice,
  showDeleteDialog = true
}, ref) => {
  const { hasPermission } = usePermissions();
  const { formatDate, formatCurrency } = useFormatters();
  const { t } = useTranslations();
  const { toast } = useToast();
  const tableRef = useRef<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      if (tableRef.current) {
        tableRef.current.refresh();
      }
    }
  }));

  useEffect(() => {
    const handleRefresh = () => {
      if (tableRef.current) {
        tableRef.current.refresh();
      }
    };

    window.addEventListener('refreshDataTable', handleRefresh);
    window.addEventListener('invoiceCreated', handleRefresh);
    return () => {
      window.removeEventListener('refreshDataTable', handleRefresh);
      window.removeEventListener('invoiceCreated', handleRefresh);
    };
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
      data: 'number',
      name: 'number',
      title: t('Invoice #'),
      orderable: true,
      searchable: true,
      render: (data: string) => (
        <span className="font-medium text-primary cursor-pointer hover:underline"
              onClick={() => handleViewInvoice(data)}>
          {data}
        </span>
      ),
    },
    {
      data: 'client',
      name: 'client',
      title: t('Client'),
      orderable: true,
      searchable: true,
    },
    {
      data: 'date',
      name: 'date',
      title: t('Date'),
      orderable: true,
      searchable: false,
      render: (data: string) => formatDate(data),
    },
    {
      data: 'due_date',
      name: 'due_date',
      title: t('Due Date'),
      orderable: true,
      searchable: false,
      render: (data: string) => formatDate(data),
    },
    {
      data: 'amount',
      name: 'amount',
      title: t('Amount'),
      orderable: true,
      searchable: false,
      render: (data: number) => (
        <span className="font-medium">{formatCurrency(data)}</span>
      ),
    },
    {
      data: 'status',
      name: 'status',
      title: t('Status'),
      orderable: true,
      searchable: false,
      render: (data: string) => getStatusBadge(data),
    },
  ];

  const filters = [
    {
      key: 'status',
      label: t('Status'),
      type: 'select' as const,
      options: [
        { value: 'paid', label: t('Paid') },
        { value: 'pending', label: t('Pending') },
        { value: 'overdue', label: t('Overdue') },
        { value: 'draft', label: t('Draft') }
      ],
      placeholder: t('Filter by status')
    },
    {
      key: 'date_from',
      label: t('Date From'),
      type: 'date' as const,
      placeholder: t('Select start date')
    },
    {
      key: 'date_to',
      label: t('Date To'),
      type: 'date' as const,
      placeholder: t('Select end date')
    }
  ];

  const handleExport = (format: string) => {
    window.open(`/invoices/export?format=${format}`, '_blank');
  };

  const customActions = (
    <div className="flex gap-2">
      {hasPermission('export_invoice') && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t('Export')}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              {t('Export as CSV')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              {t('Export as Excel')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              {t('Export as PDF')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {hasPermission('create_invoice') && (
        <Button onClick={onCreateInvoice || (() => router.get('/invoices/create'))}>
          <Plus className="w-4 h-4 mr-2" />
          {t('Create Invoice')}
        </Button>
      )}
    </div>
  );

  const customRowActions = (item: any) => (
    <>
      {hasPermission('view_invoice') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewInvoice(item.number)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {hasPermission('edit_invoice') && (
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="sm">
        <Mail className="h-4 w-4" />
      </Button>
      {hasPermission('delete_invoice') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (onDeleteInvoice) {
              onDeleteInvoice(item);
            } else {
              setSelectedInvoice(item);
              setDeleteDialogOpen(true);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </>
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: { variant: 'default' as const, color: 'text-green-600' },
      pending: { variant: 'secondary' as const, color: 'text-yellow-600' },
      overdue: { variant: 'destructive' as const, color: 'text-red-600' },
      draft: { variant: 'outline' as const, color: 'text-gray-600' }
    };

    const config = variants[status as keyof typeof variants] || variants.draft;

    return (
      <Badge variant={config.variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleViewInvoice = (invoiceNumber: string) => {
    if (onViewInvoice) {
      onViewInvoice(invoiceNumber);
    } else {
      router.get(`/invoices/${invoiceNumber}`);
    }
  };

  const renderGridItem = (invoice: any) => (
    <Card className="bg-white border">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-2 border-blue-200">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary cursor-pointer hover:underline text-sm"
                  onClick={() => handleViewInvoice(invoice.number)}>
                {invoice.number}
              </h3>
              <p className="text-xs text-gray-500 truncate">{invoice.client}</p>
            </div>
            <div className="flex items-center gap-1">
              {customRowActions(invoice)}
            </div>
          </div>

          <div className="flex justify-between items-center">
            {getStatusBadge(invoice.status)}
            <span className="font-medium text-sm">{formatCurrency(invoice.amount)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(invoice.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Due: {formatDate(invoice.due_date)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <YajraDataTable
        ref={tableRef}
        url="/invoices"
        columns={columns}
        title={t('Invoices')}
        customActions={customActions}
        customRowActions={customRowActions}
        filters={filters}
        gridViewEnabled={true}
        renderGridItem={renderGridItem}
        emptyStateIcon={<Receipt className="h-8 w-8 text-gray-400" />}
      />

      {showDeleteDialog && (
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
                if (tableRef.current) {
                  tableRef.current.refresh();
                }
                setDeleteDialogOpen(false);
              },
              onError: () => {
                toast.error(t('Failed to delete invoice'), { description: t('Please try again') });
              },
            });
          }}
        />
      )}

      <Toaster />
    </>
  );
});

InvoicesTable.displayName = 'InvoicesTable';