import { useTranslations } from '@/hooks/use-translations';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/feedback/badge';
import { Button } from '@/components/ui/form/button';
import { Separator } from '@/components/ui/layout/separator';
import { Download, Mail, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
    showActions?: boolean;
}

export function InvoiceViewLayout({ showActions = true }: Props) {
    const { t } = useTranslations();
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    const invoice = {
        number: 'INV-2024-001',
        date: '2024-01-15',
        dueDate: '2024-02-14',
        status: 'paid',
        company: {
            name: 'Laravel Starter Kit',
            address: '123 Business Street',
            city: 'San Francisco, CA 94102',
            phone: '+1 (555) 123-4567',
            email: 'hello@laravelstarter.com',
            website: 'www.laravelstarter.com'
        },
        client: {
            name: 'Acme Corporation',
            contact: 'John Smith',
            address: '456 Client Avenue',
            city: 'New York, NY 10001',
            phone: '+1 (555) 987-6543',
            email: 'john@acmecorp.com'
        },
        items: [
            {
                description: 'Web Development Services',
                quantity: 40,
                rate: 125.00,
                taxRate: 10.0,
                taxAmount: 500.00,
                amount: 5500.00
            },
            {
                description: 'UI/UX Design',
                quantity: 20,
                rate: 100.00,
                taxRate: 8.5,
                taxAmount: 170.00,
                amount: 2170.00
            },
            {
                description: 'Project Management',
                quantity: 10,
                rate: 150.00,
                taxRate: 5.0,
                taxAmount: 75.00,
                amount: 1575.00
            }
        ],
        subtotal: 8500.00,
        discount: 850.00,
        discountType: 'fixed',
        taxAmount: 745.00,
        total: 8395.00,
        amountPaid: 8395.00,
        balance: 0.00,
        notes: 'Thank you for your business! Payment was received on time.',
        terms: 'Net 30 days. Late payments may be subject to fees.'
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            paid: 'default',
            pending: 'secondary',
            overdue: 'destructive'
        } as const;

        return (
            <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    useEffect(() => {
        const generateQR = async () => {
            const qrData = {
                invoiceNumber: invoice.number,
                amount: invoice.total,
                dueDate: invoice.dueDate,
                paymentUrl: `https://pay.company.com/${invoice.number.toLowerCase()}`
            };

            try {
                const url = await QRCode.toDataURL(JSON.stringify(qrData));
                setQrCodeUrl(url);
            } catch (err) {
                console.error('Error generating QR code:', err);
            }
        };

        generateQR();
    }, []);

    return (
        <div className="px-4 py-6">
            <div className="max-w-4xl mx-auto">
                {showActions && (
                    <div className="flex justify-end items-center mb-6">
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Mail className="w-4 h-4 mr-2" />
                                {t('Send')}
                            </Button>
                            <Button variant="outline" size="sm">
                                <Printer className="w-4 h-4 mr-2" />
                                {t('Print')}
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                {t('Download')}
                            </Button>
                        </div>
                    </div>
                )}

                <Card>
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-primary mb-2">{t('INVOICE')}</h2>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">{t('Invoice #')}:</span> {invoice.number}</p>
                                    <p><span className="font-medium">{t('Date')}:</span> {invoice.date}</p>
                                    <p><span className="font-medium">{t('Due Date')}:</span> {invoice.dueDate}</p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-3">
                                {getStatusBadge(invoice.status)}
                                {qrCodeUrl && (
                                    <div className="text-center">
                                        <img src={qrCodeUrl} alt="Invoice QR Code" className="w-20 h-20" />
                                        <p className="text-xs text-muted-foreground mt-1">{t('Scan to Pay')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="font-semibold text-lg mb-3">{t('From')}:</h3>
                                <div className="space-y-1 text-sm">
                                    <p className="font-medium">{invoice.company.name}</p>
                                    <p>{invoice.company.address}</p>
                                    <p>{invoice.company.city}</p>
                                    <p>{invoice.company.phone}</p>
                                    <p>{invoice.company.email}</p>
                                    <p>{invoice.company.website}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-3">{t('Bill To')}:</h3>
                                <div className="space-y-1 text-sm">
                                    <p className="font-medium">{invoice.client.name}</p>
                                    <p>{t('Attn')}: {invoice.client.contact}</p>
                                    <p>{invoice.client.address}</p>
                                    <p>{invoice.client.city}</p>
                                    <p>{invoice.client.phone}</p>
                                    <p>{invoice.client.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-4 font-medium">{t('Description')}</th>
                                            <th className="text-center p-4 font-medium w-16">{t('Qty')}</th>
                                            <th className="text-right p-4 font-medium w-20">{t('Rate')}</th>
                                            <th className="text-right p-4 font-medium w-16">{t('Tax%')}</th>
                                            <th className="text-right p-4 font-medium w-24">{t('Tax Amount')}</th>
                                            <th className="text-right p-4 font-medium w-28">{t('Amount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items.map((item, index) => (
                                            <tr key={index} className="border-t">
                                                <td className="p-4">{item.description}</td>
                                                <td className="p-4 text-center">{item.quantity}</td>
                                                <td className="p-4 text-right">{formatCurrency(item.rate)}</td>
                                                <td className="p-4 text-right">{item.taxRate}%</td>
                                                <td className="p-4 text-right">{formatCurrency(item.taxAmount)}</td>
                                                <td className="p-4 text-right font-medium">{formatCurrency(item.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end mb-8">
                            <div className="w-80">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>{t('Subtotal')}:</span>
                                        <span>{formatCurrency(invoice.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                        <span>{t('Discount')} ({invoice.discountType === 'percentage' ? `${invoice.discount}%` : t('Fixed')}):</span>
                                        <span>-{formatCurrency(invoice.discount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('Tax')}:</span>
                                        <span>{formatCurrency(invoice.taxAmount)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>{t('Total')}:</span>
                                        <span>{formatCurrency(invoice.total)}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span>{t('Amount Paid')}:</span>
                                        <span>{formatCurrency(invoice.amountPaid)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>{t('Balance Due')}:</span>
                                        <span className={invoice.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                                            {formatCurrency(invoice.balance)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="font-medium mb-2">{t('Notes')}:</h4>
                                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">{t('Terms & Conditions')}:</h4>
                                <p className="text-sm text-muted-foreground">{invoice.terms}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t text-center">
                            <p className="text-sm text-muted-foreground">
                                {t('Thank you for your business!')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}