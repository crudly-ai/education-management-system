import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/overlay/dialog';
import { Input } from '@/components/ui/form/input';
import { Textarea } from '@/components/ui/form/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { DatePicker } from '@/components/ui/form/date-picker';
import { Label } from '@/components/ui/form/label';
import { Button } from '@/components/ui/form/button';
import { useForm } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, Save, X } from 'lucide-react';

interface TaskCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TaskCreateModal({ open, onOpenChange }: TaskCreateModalProps) {
    const { t } = useTranslations();
    const { toast } = useToast();

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        assigned_to: '',
        project: '',
        due_date: '',
        estimated_hours: '',
        tags: '',
    });

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        post('/task-management', {
            onSuccess: () => {
                toast.success(t('Task created successfully'));
                onOpenChange(false);
                reset();
                window.dispatchEvent(new CustomEvent('refreshDataTable'));
                window.dispatchEvent(new CustomEvent('refreshKanban'));
            },
            onError: () => {
                toast.error(t('Failed to create task'), { 
                    description: t('Please check the form and try again') 
                });
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5" />
                        {t('Create New Task')}
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleCreateTask} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Label htmlFor="title">{t('Task Title')} *</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                error={errors.title}
                                placeholder={t('Enter task title')}
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="status">{t('Status')} *</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="To Do">{t('To Do')}</SelectItem>
                                    <SelectItem value="In Progress">{t('In Progress')}</SelectItem>
                                    <SelectItem value="Review">{t('Review')}</SelectItem>
                                    <SelectItem value="Done">{t('Done')}</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
                        </div>
                        
                        <div>
                            <Label htmlFor="priority">{t('Priority')} *</Label>
                            <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select priority')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High">{t('High')}</SelectItem>
                                    <SelectItem value="Medium">{t('Medium')}</SelectItem>
                                    <SelectItem value="Low">{t('Low')}</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.priority && <p className="text-sm text-red-600 mt-1">{errors.priority}</p>}
                        </div>
                        
                        <div>
                            <Label htmlFor="assigned_to">{t('Assigned To')} *</Label>
                            <Input
                                id="assigned_to"
                                value={data.assigned_to}
                                onChange={(e) => setData('assigned_to', e.target.value)}
                                error={errors.assigned_to}
                                placeholder={t('Enter assignee name')}
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="project">{t('Project')}</Label>
                            <Select value={data.project} onValueChange={(value) => setData('project', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('Select project')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="E-commerce Platform">{t('E-commerce Platform')}</SelectItem>
                                    <SelectItem value="Mobile Banking App">{t('Mobile Banking App')}</SelectItem>
                                    <SelectItem value="CRM System">{t('CRM System')}</SelectItem>
                                    <SelectItem value="Data Analytics Dashboard">{t('Data Analytics Dashboard')}</SelectItem>
                                    <SelectItem value="IoT Monitoring System">{t('IoT Monitoring System')}</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.project && <p className="text-sm text-red-600 mt-1">{errors.project}</p>}
                        </div>
                        
                        <div>
                            <Label htmlFor="due_date">{t('Due Date')} *</Label>
                            <DatePicker
                                value={data.due_date}
                                onChange={(value) => setData('due_date', value)}
                                placeholder={t('Select due date')}
                            />
                            {errors.due_date && <p className="text-sm text-red-600 mt-1">{errors.due_date}</p>}
                        </div>
                        
                        <div>
                            <Label htmlFor="estimated_hours">{t('Estimated Hours')}</Label>
                            <Input
                                id="estimated_hours"
                                type="number"
                                value={data.estimated_hours}
                                onChange={(e) => setData('estimated_hours', e.target.value)}
                                error={errors.estimated_hours}
                                placeholder={t('Enter estimated hours')}
                                min="0"
                                step="0.5"
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="tags">{t('Tags')}</Label>
                            <Input
                                id="tags"
                                value={data.tags}
                                onChange={(e) => setData('tags', e.target.value)}
                                error={errors.tags}
                                placeholder={t('Enter tags (comma separated)')}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <Label htmlFor="description">{t('Description')}</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder={t('Enter task description')}
                            rows={4}
                        />
                        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            <X className="w-4 h-4 mr-2" />
                            {t('Cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? t('Creating...') : t('Create Task')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}