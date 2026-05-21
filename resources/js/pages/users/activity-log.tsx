import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/feedback/badge';
import { Button } from '@/components/ui/form/button';
import { useTranslations } from '@/hooks/use-translations';
import { useFormatters } from '@/utils/formatters';
import { Toaster } from '@/components/ui/feedback/toaster';
import { 
    Activity, 
    Globe, 
    LogIn, 
    LogOut, 
    Mail,
    FileText,
    Download,
    Save,
    Trash2,
    Eye,
    MessageSquare,
    Clock,
    Monitor
} from 'lucide-react';

interface ActivityLogProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface ActivityItem {
    id: number;
    log_name: string;
    description: string;
    properties: {
        action?: string;
        page?: string;
        details?: any;
        ip_address?: string;
        user_agent?: string;
    };
    created_at: string;
}

export default function ActivityLog({ user }: ActivityLogProps) {
    const { t } = useTranslations();
    const { formatDateTime } = useFormatters();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadActivities();
    }, [currentPage]);

    const loadActivities = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/users/${user.id}/activities?page=${currentPage}`);
            const data = await response.json();
            setActivities(data.data);
            setTotalPages(data.last_page);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to load activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        if (action.includes('logged_in')) return <LogIn className="h-4 w-4" />;
        if (action.includes('logged_out')) return <LogOut className="h-4 w-4" />;
        if (action.includes('registered')) return <Activity className="h-4 w-4" />;
        if (action.includes('email_verified')) return <Mail className="h-4 w-4" />;
        if (action.includes('created')) return <FileText className="h-4 w-4" />;
        if (action.includes('download')) return <Download className="h-4 w-4" />;
        if (action.includes('save')) return <Save className="h-4 w-4" />;
        if (action.includes('delete')) return <Trash2 className="h-4 w-4" />;
        if (action.includes('page_viewed')) return <Eye className="h-4 w-4" />;
        if (action.includes('chat') || action.includes('message')) return <MessageSquare className="h-4 w-4" />;
        return <Activity className="h-4 w-4" />;
    };

    const getActionColor = (action: string) => {
        if (action.includes('logged_in') || action.includes('registered')) return 'success';
        if (action.includes('logged_out')) return 'secondary';
        if (action.includes('delete')) return 'destructive';
        if (action.includes('email_verified')) return 'default';
        if (action.includes('created') || action.includes('save')) return 'default';
        if (action.includes('chat') || action.includes('message')) return 'secondary';
        return 'secondary';
    };

    const formatActionName = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const breadcrumbs = createBreadcrumbs('users', user.name, 'Activity Log');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name} - ${t('Activity Log')}`} />
            <div className="p-6">
                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Activity className="h-5 w-5" />
                                    {t('Activity Log')}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {user.name} • {user.email} • {total} {t('activities')}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-sm text-muted-foreground">{t('Loading...')}</p>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground mb-2">{t('No activities found')}</h3>
                                <p className="text-sm text-muted-foreground">{t('This user has no recorded activities yet')}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activities.map((activity, index) => (
                                    <div
                                        key={activity.id}
                                        className="relative border rounded-lg p-4 hover:shadow-sm transition-all"
                                    >
                                        {index !== activities.length - 1 && (
                                            <div className="absolute left-[27px] top-[52px] bottom-[-12px] w-[2px] bg-gray-200"></div>
                                        )}
                                        <div className="flex items-start gap-4">
                                            <div className="relative z-10 p-2 rounded-full bg-background border-2 border-gray-200">
                                                {getActionIcon(activity.description)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div className="flex-1">
                                                        <Badge variant={getActionColor(activity.description)} className="mb-2">
                                                            {formatActionName(activity.description)}
                                                        </Badge>
                                                        {activity.properties?.details && Object.keys(activity.properties.details).length > 0 && (
                                                            <div className="text-sm text-muted-foreground mt-2">
                                                                {Object.entries(activity.properties.details).map(([key, value]) => (
                                                                    <div key={key} className="flex items-center gap-2">
                                                                        <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                                                                        <span>{String(value)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDateTime(activity.created_at)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                    {activity.properties?.ip_address && (
                                                        <div className="flex items-center gap-1">
                                                            <Globe className="h-3 w-3" />
                                                            <span>{activity.properties.ip_address}</span>
                                                        </div>
                                                    )}
                                                    {activity.properties?.page && (
                                                        <div className="flex items-center gap-1">
                                                            <Monitor className="h-3 w-3" />
                                                            <span>{activity.properties.page}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            {t('Showing')} {activities.length} {t('of')} {total} {t('activities')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                {t('Previous')}
                                            </Button>
                                            <span className="text-sm text-muted-foreground">
                                                {t('Page')} {currentPage} {t('of')} {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                {t('Next')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Toaster />
        </AuthenticatedLayout>
    );
}
