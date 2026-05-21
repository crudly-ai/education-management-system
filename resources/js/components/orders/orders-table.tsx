import { YajraDataTable } from '@/components/datatable';
import { useFormatters } from '@/utils/formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Eye, Edit, Trash2, Download, ChevronDown, User, DollarSign, ShoppingCart, Calendar, Mail } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/navigation/dropdown-menu';
import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { router } from '@inertiajs/react';

interface OrdersTableProps {
  onViewOrder?: (orderId: number) => void;
}

export interface OrdersTableRef {
  refresh: () => void;
}

export const OrdersTable = forwardRef<OrdersTableRef, OrdersTableProps>(({ 
  onViewOrder
}, ref) => {
  const { hasPermission } = usePermissions();
  const { formatDate, formatCurrency } = useFormatters();
  const { t } = useTranslations();
  const tableRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      if (tableRef.current) {
        tableRef.current.refresh();
      }
    }
  }));

  const columns = [
    {
      data: 'id',
      name: 'id',
      title: t('Order ID'),
      orderable: true,
      searchable: false,
      render: (data: string) => (
        <span className="font-mono text-sm">#ORD-{data.toString().padStart(4, '0')}</span>
      ),
    },
    {
      data: 'customer_name',
      name: 'customer_name',
      title: t('Customer'),
      orderable: true,
      searchable: true,
      render: (data: string, type: string, row: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{data}</span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {row.customer_email}
          </span>
        </div>
      ),
    },
    {
      data: 'type',
      name: 'type',
      title: t('Type'),
      orderable: true,
      searchable: false,
      render: (data: string) => getTypeBadge(data),
    },
    {
      data: 'status',
      name: 'status',
      title: t('Status'),
      orderable: true,
      searchable: false,
      render: (data: string) => getStatusBadge(data),
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
      data: 'created_at',
      name: 'created_at',
      title: t('Date'),
      orderable: true,
      searchable: false,
      render: (data: string) => formatDate(data),
    },
  ];

  const filters = [
    {
      key: 'type',
      label: t('Type'),
      type: 'select' as const,
      options: [
        { value: 'sale', label: t('Sale') },
        { value: 'refund', label: t('Refund') },
        { value: 'subscription', label: t('Subscription') }
      ],
      placeholder: t('Filter by type')
    },
    {
      key: 'status',
      label: t('Status'),
      type: 'select' as const,
      options: [
        { value: 'pending', label: t('Pending') },
        { value: 'processing', label: t('Processing') },
        { value: 'completed', label: t('Completed') },
        { value: 'cancelled', label: t('Cancelled') },
        { value: 'refunded', label: t('Refunded') }
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
    window.open(`/orders/export?format=${format}`, '_blank');
  };

  const customActions = (
    <div className="flex gap-2">
      {hasPermission('export_orders') && (
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
    </div>
  );

  const customRowActions = (item: any) => (
    <>
      {hasPermission('view_orders') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewOrder(item.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {hasPermission('edit_orders') && (
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {hasPermission('delete_orders') && (
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </>
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const className = variants[status as keyof typeof variants] || variants.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      sale: 'bg-green-100 text-green-800 border-green-200',
      refund: 'bg-red-100 text-red-800 border-red-200',
      subscription: 'bg-purple-100 text-purple-800 border-purple-200'
    };

    const className = variants[type as keyof typeof variants] || variants.sale;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const handleViewOrder = (orderId: number) => {
    if (onViewOrder) {
      onViewOrder(orderId);
    } else {
      router.get(`/orders/${orderId}`);
    }
  };

  const renderGridItem = (order: any) => (
    <Card className="bg-white border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-2 border-blue-200">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-mono text-sm font-medium">
                  #ORD-{order.id.toString().padStart(4, '0')}
                </h3>
                <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {customRowActions(order)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">{order.customer_name}</p>
                <p className="text-xs text-gray-500">{order.customer_email}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {getTypeBadge(order.type)}
              {getStatusBadge(order.status)}
            </div>
            <div className="text-lg font-bold">
              <span>{formatCurrency(order.amount)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <YajraDataTable
      ref={tableRef}
      url="/orders"
      columns={columns}
      title={t('Orders')}
      customActions={customActions}
      customRowActions={customRowActions}
      filters={filters}
      gridViewEnabled={true}
      renderGridItem={renderGridItem}
      emptyStateIcon={<ShoppingCart className="h-8 w-8 text-gray-400" />}
    />
  );
});

OrdersTable.displayName = 'OrdersTable';