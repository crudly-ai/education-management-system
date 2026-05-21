import { Card, CardContent } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/form/button';
import { Shield, Lock, FileQuestion, ServerCrash, Wrench, ArrowLeft, Home, RefreshCw, Clock } from 'lucide-react';

interface ErrorPageContentProps {
    type: 'unauthorized' | 'forbidden' | 'not-found' | 'server-error' | 'maintenance';
    showActions?: boolean;
}

export function ErrorPageContent({ type, showActions = true }: ErrorPageContentProps) {
    const errorConfigs = {
        unauthorized: {
            code: '401',
            title: 'Unauthorized',
            icon: Shield,
            bgColor: 'bg-red-100',
            iconColor: 'text-red-600',
            message: "You don't have permission to access this resource. Please contact your administrator if you believe this is an error."
        },
        forbidden: {
            code: '403',
            title: 'Forbidden',
            icon: Lock,
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600',
            message: "Access to this resource is forbidden. You don't have the necessary permissions to view this page."
        },
        'not-found': {
            code: '404',
            title: 'Page Not Found',
            icon: FileQuestion,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            message: "The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL."
        },
        'server-error': {
            code: '500',
            title: 'Internal Server Error',
            icon: ServerCrash,
            bgColor: 'bg-red-100',
            iconColor: 'text-red-600',
            message: "Something went wrong on our end. We're working to fix this issue. Please try again later."
        },
        maintenance: {
            code: '503',
            title: 'Maintenance Mode',
            icon: Wrench,
            bgColor: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            message: "We're currently performing scheduled maintenance to improve your experience. We'll be back shortly."
        }
    };

    const config = errorConfigs[type];
    const IconComponent = config.icon;

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardContent className="p-8 text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${config.bgColor} flex items-center justify-center`}>
                        <IconComponent className={`w-10 h-10 ${config.iconColor}`} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{config.code}</h1>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">{config.title}</h2>
                    <p className="text-gray-600 mb-6">{config.message}</p>
                    
                    {type === 'maintenance' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center gap-2 text-yellow-800">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">Estimated downtime: 30 minutes</span>
                            </div>
                        </div>
                    )}

                    {showActions && (
                        <div className="space-y-3">

                            {type === 'not-found' && (
                                <Button onClick={() => window.location.href = '/dashboard'} variant="outline" className="w-full">
                                    <Home className="w-4 h-4 mr-2" />
                                    Go Home
                                </Button>
                            )}
                            <Button onClick={() => window.history.back()} className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}