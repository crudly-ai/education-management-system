import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/overlay/dialog';
import { Badge } from '@/components/ui/feedback/badge';
import { Button } from '@/components/ui/form/button';
import { useTranslations } from '@/hooks/use-translations';
import { useFormatters } from '@/utils/formatters';
import { CheckSquare, User, Calendar, Clock, Building2, Flag, X, Edit, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

interface Task {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    assigned_to: string;
    project: string;
    due_date: string;
    created_at: string;
}

interface TaskViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task | null;
    onEdit?: (task: Task) => void;
    onDelete?: (task: Task) => void;
}

export function TaskViewModal({ open, onOpenChange, task, onEdit, onDelete }: TaskViewModalProps) {
    const { t } = useTranslations();
    const { formatDate } = useFormatters();
    const { hasPermission } = usePermissions();

    if (!task) return null;

    const getPriorityBadge = (priority: string) => {
        const variants = {
            High: 'bg-red-100 text-red-800 border-red-200',
            Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Low: 'bg-green-100 text-green-800 border-green-200'
        };
        const className = variants[priority as keyof typeof variants] || variants.Medium;
        return <Badge variant="outline" className={className}>{priority}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            'To Do': 'bg-gray-100 text-gray-800 border-gray-200',
            'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
            'Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Done': 'bg-green-100 text-green-800 border-green-200'
        };
        const className = variants[status as keyof typeof variants] || variants['To Do'];
        return <Badge variant="outline" className={className}>{status}</Badge>;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 pr-8">
                        <CheckSquare className="h-5 w-5" />
                        {t('Task Details')}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                    {/* Header with title and actions */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h2>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(task.status)}
                                {getPriorityBadge(task.priority)}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            {hasPermission('edit_tasks') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit?.(task)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                            {hasPermission('delete_tasks') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete?.(task)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">{t('Description')}</h3>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{task.description}</p>
                        </div>
                    )}

                    {/* Task Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">{t('Assigned To')}</p>
                                    <p className="text-sm font-medium">{task.assigned_to}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">{t('Project')}</p>
                                    <p className="text-sm font-medium">{task.project || t('No project assigned')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">{t('Due Date')}</p>
                                    <p className="text-sm font-medium">{formatDate(task.due_date)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">{t('Created')}</p>
                                    <p className="text-sm font-medium">{formatDate(task.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Section */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">{t('Activity')}</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>{t('Task created on')} {formatDate(task.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="w-4 h-4 mr-2" />
                            {t('Close')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}