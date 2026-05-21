import { useTranslations } from '@/hooks/use-translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/feedback/badge';
import { useFormatters } from '@/utils/formatters';
import { ShoppingCart, User, Mail, Calendar, MapPin, CreditCard, Truck, Package, Phone } from 'lucide-react';

interface OrderViewContentProps {
    order: {
        id: number;
        customer_name: string;
        customer_email: string;
        type: string;
        status: string;
        amount: number;
        created_at: string;
        items?: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
    };
}

export function OrderViewContent({ order }: OrderViewContentProps) {
    const { t } = useTranslations();
    const { formatDate, formatCurrency } = useFormatters();

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-800'
        };

        const className = variants[status as keyof typeof variants] || variants.pending;

        return (
            <Badge className={className}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getTypeBadge = (type: string) => {
        const variants = {
            sale: 'bg-green-100 text-green-800',
            refund: 'bg-red-100 text-red-800',
            subscription: 'bg-purple-100 text-purple-800'
        };

        const className = variants[type as keyof typeof variants] || variants.sale;

        return (
            <Badge className={className}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-2 border-blue-200">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Order #ORD-{order.id.toString().padStart(4, '0')}</h1>
                    <p className="text-gray-500">{formatDate(order.created_at)}</p>
                    <p className="text-sm text-gray-500">Tracking: TRK-{order.id.toString().padStart(8, '0')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {t('Customer Information')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-500">{t('Name')}</label>
                            <p className="text-lg font-medium">{order.customer_name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">{t('Email')}</label>
                            <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                {order.customer_email}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Phone</label>
                            <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                +1 (555) 123-4567
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Customer ID</label>
                            <p className="text-sm font-mono">#CUST-{order.id.toString().padStart(4, '0')}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Shipping Address
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="font-medium">123 Main Street</p>
                        <p>Apt 4B</p>
                        <p>New York, NY 10001</p>
                        <p>United States</p>
                        <div className="pt-2 border-t">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Truck className="h-4 w-4" />
                                <span>Standard Shipping</span>
                            </div>
                            <p className="text-sm text-gray-500">Est. Delivery: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            {t('Order Details')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500">{t('Type')}</span>
                            {getTypeBadge(order.type)}
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500">{t('Status')}</span>
                            {getStatusBadge(order.status)}
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500">Payment Method</span>
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">**** 4242</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500">{t('Date')}</span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {formatDate(order.created_at)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {order.items && order.items.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            {t('Order Items')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3">{t('Item')}</th>
                                        <th className="text-center py-3 w-20">{t('Quantity')}</th>
                                        <th className="text-right py-3 w-24">{t('Price')}</th>
                                        <th className="text-right py-3 w-28">{t('Total')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-3">
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-sm text-gray-500">SKU: PRD-{(index + 1).toString().padStart(3, '0')}</p>
                                                </div>
                                            </td>
                                            <td className="text-center py-3">{item.quantity}</td>
                                            <td className="text-right py-3">{formatCurrency(item.price)}</td>
                                            <td className="text-right py-3 font-medium">
                                                {formatCurrency(item.quantity * item.price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(order.items ? order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) : order.amount * 0.9)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>{formatCurrency(order.amount * 0.05)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>{formatCurrency(order.amount * 0.05)}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t font-bold text-lg">
                            <span>{t('Total Amount')}:</span>
                            <span>{formatCurrency(order.amount)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-medium mb-2">Order Notes:</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            Thank you for your order! Your items will be carefully packaged and shipped within 1-2 business days. You will receive a tracking number once your order ships.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Need Help?</h4>
                        <p className="text-sm text-gray-600">
                            Contact our support team at <span className="font-medium">support@company.com</span> or call <span className="font-medium">+1 (555) 123-4567</span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}