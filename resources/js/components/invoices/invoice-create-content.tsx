import { useForm } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Textarea } from '@/components/ui/form/textarea';
import { DatePicker } from '@/components/ui/form/date-picker';
import Heading from '@/components/heading';
import { Plus, Trash2, Save, Send, Eye, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/overlay/dialog';
import InputError from '@/components/input-error';

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    taxRate: number;
    taxAmount: number;
    total: number;
}

export function InvoiceCreateContent() {
    const { t } = useTranslations();
    const [showClientModal, setShowClientModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        number: `INV-2024-${String(Date.now()).slice(-3).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        clientId: '',
        clientDetails: {
            name: '',
            email: '',
            address: '',
            phone: ''
        },
        items: [
            {
                id: '1',
                description: '',
                quantity: 1,
                rate: 0,
                taxRate: 0,
                taxAmount: 0,
                total: 0
            }
        ] as InvoiceItem[],
        subtotal: 0,
        discount: 0,
        discountType: 'fixed',
        totalTax: 0,
        total: 0,
        paymentTerms: 'net_30',
        notes: ''
    });

    const clients = [
        { id: '1', name: 'Acme Corporation', email: 'contact@acme.com' },
        { id: '2', name: 'Tech Solutions Ltd', email: 'info@techsolutions.com' },
        { id: '3', name: 'Digital Agency Inc', email: 'hello@digitalagency.com' }
    ];

    const itemTemplates = [
        { name: 'Web Development', rate: 125 },
        { name: 'UI/UX Design', rate: 100 },
        { name: 'Project Management', rate: 150 },
        { name: 'Consultation', rate: 200 }
    ];

    const calculateItemTotal = (item: InvoiceItem) => {
        const subtotal = item.quantity * item.rate;
        const taxAmount = (subtotal * item.taxRate) / 100;
        return subtotal + taxAmount;
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };

        newItems[index].taxAmount = (newItems[index].quantity * newItems[index].rate * newItems[index].taxRate) / 100;
        newItems[index].total = calculateItemTotal(newItems[index]);

        setData('items', newItems);
        calculateTotals(newItems);
    };

    const addItem = () => {
        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            description: '',
            quantity: 1,
            rate: 0,
            taxRate: 0,
            taxAmount: 0,
            total: 0
        };
        const newItems = [...data.items, newItem];
        setData('items', newItems);
    };

    const removeItem = (index: number) => {
        if (data.items.length > 1) {
            const newItems = data.items.filter((_, i) => i !== index);
            setData('items', newItems);
            calculateTotals(newItems);
        }
    };

    const calculateTotals = (items: InvoiceItem[]) => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
        const discountAmount = data.discountType === 'percentage' ? (subtotal * data.discount) / 100 : data.discount;
        const total = subtotal - discountAmount + totalTax;

        setData(prev => ({
            ...prev,
            subtotal,
            totalTax,
            total
        }));
    };

    const handleSubmit = (action: 'draft' | 'send') => {
        // No action needed - this is just a demo
        console.log('Invoice action:', action, data);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="px-4 py-6">
            <Heading title={t('Create Invoice')} description={t('Create a new invoice for your client')} />

            <div className="mt-8 space-y-6">
                {/* Invoice Header */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">{t('Invoice Details')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="number">{t('Invoice Number')}</Label>
                            <Input
                                id="number"
                                value={data.number}
                                readOnly
                                className="bg-muted"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">{t('Status')}</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">{t('Draft')}</SelectItem>
                                    <SelectItem value="pending">{t('Pending')}</SelectItem>
                                    <SelectItem value="sent">{t('Sent')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">{t('Invoice Date')}</Label>
                            <DatePicker
                                value={data.date}
                                onChange={(value) => setData('date', value)}
                                placeholder={t('Select invoice date')}
                            />
                            <InputError message={errors.date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">{t('Due Date')}</Label>
                            <DatePicker
                                value={data.dueDate}
                                onChange={(value) => setData('dueDate', value)}
                                placeholder={t('Select due date')}
                            />
                            <InputError message={errors.dueDate} />
                        </div>
                    </CardContent>
                </Card>

                {/* Client Details */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-semibold">{t('Client Details')}</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => setShowClientModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                {t('New Client')}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="client">{t('Select Client')}</Label>
                            <Select value={data.clientId} onValueChange={(value) => setData('clientId', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Choose a client')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name} - {client.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice Items */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-semibold">{t('Invoice Items')}</CardTitle>
                            <Button onClick={addItem}>
                                <Plus className="w-4 h-4 mr-2" />
                                {t('Add Item')}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left p-3 text-sm font-semibold w-48">{t('Template')}</th>
                                        <th className="text-left p-3 text-sm font-semibold">{t('Description')}</th>
                                        <th className="text-center p-3 text-sm font-semibold w-20">{t('Qty')}</th>
                                        <th className="text-right p-3 text-sm font-semibold w-24">{t('Rate')}</th>
                                        <th className="text-right p-3 text-sm font-semibold w-20">{t('Tax%')}</th>
                                        <th className="text-right p-3 text-sm font-semibold w-24">{t('Tax Amount')}</th>
                                        <th className="text-right p-3 text-sm font-semibold w-28">{t('Total')}</th>
                                        <th className="text-center p-3 text-sm font-semibold w-16">{t('Action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((item, index) => (
                                        <tr key={item.id} className="border-b hover:bg-muted/30">
                                            <td className="p-3">
                                                <Select onValueChange={(value) => {
                                                    const template = itemTemplates.find(t => t.name === value);
                                                    if (template) {
                                                        updateItem(index, 'description', template.name);
                                                        updateItem(index, 'rate', template.rate);
                                                    }
                                                }}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('Select template')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {itemTemplates.map((template) => (
                                                            <SelectItem key={template.name} value={template.name}>
                                                                {template.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                    placeholder={t('Item description')}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    className="text-center"
                                                    min="1"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    type="number"
                                                    value={item.rate}
                                                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                                    className="text-right"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    type="number"
                                                    value={item.taxRate}
                                                    onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                                                    className="text-right"
                                                    step="0.1"
                                                    max="100"
                                                />
                                            </td>
                                            <td className="p-3 text-right text-sm font-medium text-muted-foreground">
                                                {formatCurrency(item.taxAmount)}
                                            </td>
                                            <td className="p-3 text-right font-semibold">
                                                {formatCurrency(item.total)}
                                            </td>
                                            <td className="p-3 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                    disabled={data.items.length === 1}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Totals and Settings */}
                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">{t('Additional Settings')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="paymentTerms">{t('Payment Terms')}</Label>
                                <Select value={data.paymentTerms} onValueChange={(value) => setData('paymentTerms', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="due_on_receipt">{t('Due on Receipt')}</SelectItem>
                                        <SelectItem value="net_15">{t('Net 15 days')}</SelectItem>
                                        <SelectItem value="net_30">{t('Net 30 days')}</SelectItem>
                                        <SelectItem value="net_60">{t('Net 60 days')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">{t('Notes')}</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder={t('Additional notes or terms')}
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">{t('Invoice Summary')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('Subtotal')}:</span>
                                <span className="font-medium">{formatCurrency(data.subtotal)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Label className="flex-1 text-muted-foreground">{t('Discount')}:</Label>
                                <Select value={data.discountType} onValueChange={(value) => setData('discountType', value)}>
                                    <SelectTrigger className="w-24">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">$</SelectItem>
                                        <SelectItem value="percentage">%</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    value={data.discount}
                                    onChange={(e) => setData('discount', parseFloat(e.target.value) || 0)}
                                    className="w-24"
                                    step="0.01"
                                />
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('Tax')}:</span>
                                <span className="font-medium">{formatCurrency(data.totalTax)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-4 mt-4">
                                <span>{t('Total')}:</span>
                                <span className="text-primary">{formatCurrency(data.total)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Form Actions */}
                <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        {t('Cancel')}
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowPreview(true)}>
                            <Eye className="w-4 h-4 mr-2" />
                            {t('Preview')}
                        </Button>
                        <Button variant="outline" onClick={() => handleSubmit('draft')}>
                            <Save className="w-4 h-4 mr-2" />
                            {t('Save as Draft')}
                        </Button>
                        <Button onClick={() => handleSubmit('send')}>
                            <Send className="w-4 h-4 mr-2" />
                            {t('Save & Send')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Client Modal */}
            <Dialog open={showClientModal} onOpenChange={setShowClientModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Add New Client')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="clientName">{t('Client Name')}</Label>
                            <Input
                                id="clientName"
                                value={data.clientDetails.name}
                                onChange={(e) => setData('clientDetails', { ...data.clientDetails, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="clientEmail">{t('Email')}</Label>
                            <Input
                                id="clientEmail"
                                type="email"
                                value={data.clientDetails.email}
                                onChange={(e) => setData('clientDetails', { ...data.clientDetails, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="clientAddress">{t('Address')}</Label>
                            <Textarea
                                id="clientAddress"
                                value={data.clientDetails.address}
                                onChange={(e) => setData('clientDetails', { ...data.clientDetails, address: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="clientPhone">{t('Phone')}</Label>
                            <Input
                                id="clientPhone"
                                value={data.clientDetails.phone}
                                onChange={(e) => setData('clientDetails', { ...data.clientDetails, phone: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowClientModal(false)}>
                                {t('Cancel')}
                            </Button>
                            <Button onClick={() => setShowClientModal(false)}>
                                {t('Add Client')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}