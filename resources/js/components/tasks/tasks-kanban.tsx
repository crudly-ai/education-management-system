import { useFormatters } from '@/utils/formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/form/button';
import { Toaster } from '@/components/ui/feedback/toaster';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/feedback/badge';
import { Plus, Eye, Edit, Trash2, User, Calendar, Clock, List, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/navigation/dropdown-menu';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { router } from '@inertiajs/react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { TaskCreateModal } from '@/pages/tasks/create';
import { TaskViewModal } from '@/pages/tasks/view';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, useDroppable, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Task {
    id: number;
    title: string;
    description: string;
    priority: string;
    assigned_to: string;
    project: string;
    due_date: string;
    created_at: string;
}

interface KanbanData {
    'To Do': Task[];
    'In Progress': Task[];
    'Review': Task[];
    'Done': Task[];
}

interface TasksKanbanProps {
  onCreateTask?: () => void;
  onDeleteTask?: (task: any) => void;
  onViewTask?: (task: any) => void;
  onBackToList?: () => void;
  showCreateModal?: boolean;
  showDeleteDialog?: boolean;
  showViewModal?: boolean;
  showListViewButton?: boolean;
}

export interface TasksKanbanRef {
  refresh: () => void;
}

export const TasksKanban = forwardRef<TasksKanbanRef, TasksKanbanProps>(({ 
  onCreateTask,
  onDeleteTask,
  onViewTask,
  onBackToList,
  showCreateModal = true,
  showDeleteDialog = true,
  showViewModal = true,
  showListViewButton = true
}, ref) => {
    const { hasPermission } = usePermissions();
    const { formatDate } = useFormatters();
    const { t } = useTranslations();
    const { toast } = useToast();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewTask, setViewTask] = useState<Task | null>(null);
    const [kanbanData, setKanbanData] = useState<KanbanData>({
        'To Do': [],
        'In Progress': [],
        'Review': [],
        'Done': []
    });
    const [loading, setLoading] = useState(true);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
        refresh: fetchKanbanData
    }));

    useEffect(() => {
        fetchKanbanData();
        
        const handleRefresh = () => {
            fetchKanbanData();
        };

        window.addEventListener('refreshKanban', handleRefresh);
        window.addEventListener('taskCreated', handleRefresh);
        return () => {
            window.removeEventListener('refreshKanban', handleRefresh);
            window.removeEventListener('taskCreated', handleRefresh);
        };
    }, []);

    const fetchKanbanData = async () => {
        try {
            const response = await fetch('/task-management/kanban', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const data = await response.json();
            setKanbanData(data);
        } catch (error) {
            // Use sample data for preview
            setKanbanData({
                'To Do': [
                    {
                        id: 1,
                        title: 'Design Homepage',
                        description: 'Create wireframes and mockups for the new homepage design',
                        priority: 'High',
                        assigned_to: 'John Smith',
                        project: 'Website Redesign',
                        due_date: '2024-02-15',
                        created_at: '2024-01-20'
                    },
                    {
                        id: 2,
                        title: 'Setup Database',
                        description: 'Configure production database with proper indexes',
                        priority: 'Medium',
                        assigned_to: 'Sarah Johnson',
                        project: 'Backend API',
                        due_date: '2024-02-20',
                        created_at: '2024-01-22'
                    }
                ],
                'In Progress': [
                    {
                        id: 3,
                        title: 'User Authentication',
                        description: 'Implement JWT-based authentication system',
                        priority: 'High',
                        assigned_to: 'Mike Wilson',
                        project: 'Backend API',
                        due_date: '2024-02-18',
                        created_at: '2024-01-18'
                    }
                ],
                'Review': [
                    {
                        id: 4,
                        title: 'Mobile Responsive',
                        description: 'Make the application mobile responsive',
                        priority: 'Medium',
                        assigned_to: 'Emily Davis',
                        project: 'Website Redesign',
                        due_date: '2024-02-12',
                        created_at: '2024-01-15'
                    }
                ],
                'Done': [
                    {
                        id: 5,
                        title: 'Project Setup',
                        description: 'Initialize project structure and dependencies',
                        priority: 'Low',
                        assigned_to: 'John Smith',
                        project: 'Backend API',
                        due_date: '2024-01-30',
                        created_at: '2024-01-10'
                    }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const getPriorityBadge = (priority: string) => {
        const variants = {
            High: 'bg-red-100 text-red-800 border-red-200',
            Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Low: 'bg-green-100 text-green-800 border-green-200'
        };

        const className = variants[priority as keyof typeof variants] || variants.Medium;

        return (
            <Badge variant="outline" className={className}>
                {priority}
            </Badge>
        );
    };

    const getStatusColor = (status: string) => {
        const colors = {
            'To Do': 'border-gray-300 bg-gray-50',
            'In Progress': 'border-blue-300 bg-blue-50',
            'Review': 'border-yellow-300 bg-yellow-50',
            'Done': 'border-green-300 bg-green-50'
        };
        return colors[status as keyof typeof colors] || colors['To Do'];
    };

    const handleViewTask = (task: Task) => {
        if (onViewTask) {
            onViewTask(task);
        } else {
            setViewTask(task);
            setViewModalOpen(true);
        }
    };

    const DraggableTaskCard = ({ task }: { task: Task }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ 
            id: `task-${task.id}`,
            data: { type: 'task', task }
        });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
        };

        return (
            <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
                {renderTaskCard(task)}
            </div>
        );
    };

    const renderTaskCard = (task: Task) => (
        <Card key={task.id} className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm text-primary hover:underline"
                            onClick={() => handleViewTask(task)}>
                            {task.title}
                        </h4>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {hasPermission('view_tasks') && (
                                    <DropdownMenuItem onClick={() => handleViewTask(task)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        {t('View')}
                                    </DropdownMenuItem>
                                )}
                                {hasPermission('edit_tasks') && (
                                    <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" />
                                        {t('Edit')}
                                    </DropdownMenuItem>
                                )}
                                {hasPermission('delete_tasks') && (
                                    <DropdownMenuItem 
                                        onClick={() => {
                                            if (onDeleteTask) {
                                                onDeleteTask(task);
                                            } else {
                                                setSelectedTask(task);
                                                setDeleteDialogOpen(true);
                                            }
                                        }}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {t('Delete')}
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                    <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                    
                    <div className="flex items-center justify-between">
                        {getPriorityBadge(task.priority)}
                    </div>
                    
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            <span>{task.assigned_to}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(task.due_date)}</span>
                        </div>
                    </div>
                    
                    {task.project && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {task.project}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const DroppableColumn = ({ status, tasks }: { status: string; tasks: Task[] }) => {
        const { setNodeRef, isOver } = useDroppable({ 
            id: `column-${status}`,
            data: { type: 'column', status }
        });
        
        return (
            <div key={status} className="flex-1 min-w-80">
                <Card className={`h-full ${getStatusColor(status)} ${isOver ? 'ring-2 ring-blue-400' : ''}`}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-sm">
                            <span>{t(status)}</span>
                            <Badge variant="secondary" className="text-xs">
                                {tasks.length}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div ref={setNodeRef} className="min-h-[400px]">
                            <SortableContext items={tasks.map(t => `task-${t.id}`)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                                    {tasks.map(task => (
                                        <DraggableTaskCard key={task.id} task={task} />
                                    ))}
                                    {tasks.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <div className="text-xs">{t('Drop tasks here')}</div>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const taskId = String(active.id).replace('task-', '');
        const task = Object.values(kanbanData).flat().find(t => t.id === Number(taskId));
        setActiveTask(task || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        setOverId(over ? String(over.id) : null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        setOverId(null);
        
        if (!over || !active) return;

        const taskId = String(active.id).replace('task-', '');
        const activeTask = Object.values(kanbanData).flat().find(t => t.id === Number(taskId));
        
        if (!activeTask) return;

        let newStatus = '';
        const overId = String(over.id);
        
        if (overId.startsWith('column-')) {
            newStatus = overId.replace('column-', '');
        } else if (overId.startsWith('task-')) {
            const targetTaskId = overId.replace('task-', '');
            for (const [status, tasks] of Object.entries(kanbanData)) {
                if (tasks.some(t => t.id === Number(targetTaskId))) {
                    newStatus = status;
                    break;
                }
            }
        }

        const currentStatus = getTaskStatus(Number(taskId));

        if (newStatus && newStatus !== currentStatus) {
            setKanbanData(prevData => {
                const updatedData = { ...prevData };
                
                Object.keys(updatedData).forEach(status => {
                    updatedData[status] = updatedData[status].filter(t => t.id !== Number(taskId));
                });
                
                updatedData[newStatus] = [...updatedData[newStatus], activeTask];
                
                return updatedData;
            });
            
            toast.success(t('Task status updated'));
        }
    };

    const getTaskStatus = (taskId: number) => {
        for (const [status, tasks] of Object.entries(kanbanData)) {
            if (tasks.some(t => t.id === taskId)) {
                return status;
            }
        }
        return '';
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">{t('Loading...')}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-semibold">{t('Tasks Kanban')}</h1>
                    {showListViewButton && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onBackToList || (() => router.get('/task-management'))}
                        >
                            <List className="w-4 h-4 mr-2" />
                            {t('List View')}
                        </Button>
                    )}
                </div>
                
                <div className="flex gap-2">
                    {hasPermission('create_tasks') && (
                        <Button onClick={onCreateTask || (() => setCreateModalOpen(true))}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('Create Task')}
                        </Button>
                    )}
                </div>
            </div>

            <DndContext
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 overflow-x-auto pb-4">
                    {Object.entries(kanbanData).map(([status, tasks]) => 
                        <DroppableColumn key={status} status={status} tasks={tasks} />
                    )}
                </div>
                <DragOverlay>
                    {activeTask ? renderTaskCard(activeTask) : null}
                </DragOverlay>
            </DndContext>

            {showCreateModal && (
                <TaskCreateModal 
                    open={createModalOpen} 
                    onOpenChange={setCreateModalOpen} 
                />
            )}
            
            {showViewModal && (
                <TaskViewModal
                    open={viewModalOpen}
                    onOpenChange={setViewModalOpen}
                    task={viewTask}
                    onEdit={(task) => {
                        setViewModalOpen(false);
                    }}
                    onDelete={(task) => {
                        setViewModalOpen(false);
                        setSelectedTask(task);
                        setDeleteDialogOpen(true);
                    }}
                />
            )}

            {showDeleteDialog && (
                <ConfirmationDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title={t('Delete Task')}
                    description={`${t('Are you sure?')} ${t('This action cannot be undone')}`}
                    confirmText={t('Delete')}
                    variant="destructive"
                    onConfirm={() => {
                        router.delete(`/tasks/${selectedTask?.id}`, {
                            onSuccess: () => {
                                toast.success(t('Task deleted successfully'));
                                fetchKanbanData();
                                setDeleteDialogOpen(false);
                            },
                            onError: () => {
                                toast.error(t('Failed to delete task'), { description: t('Please try again') });
                            },
                        });
                    }}
                />
            )}
            
            <Toaster />
        </div>
    );
});

TasksKanban.displayName = 'TasksKanban';