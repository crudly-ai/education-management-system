import { YajraDataTable } from '@/components/datatable';
import { useFormatters } from '@/utils/formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Plus, Eye, Edit, Trash2, Download, Users, Calendar, CheckSquare, ChevronDown, User, Clock, Kanban } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/navigation/dropdown-menu';
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { router } from '@inertiajs/react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Toaster } from '@/components/ui/feedback/toaster';
import { TaskCreateModal } from '@/pages/tasks/create';
import { TaskViewModal } from '@/pages/tasks/view';

interface TasksTableProps {
  onCreateTask?: () => void;
  onDeleteTask?: (task: any) => void;
  onViewTask?: (task: any) => void;
  onViewKanban?: () => void;
  showCreateModal?: boolean;
  showDeleteDialog?: boolean;
  showViewModal?: boolean;
}

export interface TasksTableRef {
  refresh: () => void;
}

export const TasksTable = forwardRef<TasksTableRef, TasksTableProps>(({ 
  onCreateTask, 
  onDeleteTask,
  onViewTask,
  onViewKanban,
  showCreateModal = true,
  showDeleteDialog = true,
  showViewModal = true
}, ref) => {
  const { hasPermission } = usePermissions();
  const { formatDate } = useFormatters();
  const { t } = useTranslations();
  const { toast } = useToast();
  const tableRef = useRef<any>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewTask, setViewTask] = useState<any>(null);

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
    return () => window.removeEventListener('refreshDataTable', handleRefresh);
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      if (tableRef.current) {
        tableRef.current.refresh();
      }
    };

    window.addEventListener('taskCreated', handleRefresh);
    return () => window.removeEventListener('taskCreated', handleRefresh);
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
      data: 'title',
      name: 'title',
      title: t('Task Title'),
      orderable: true,
      searchable: true,
      render: (data: string, type: string, row: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary cursor-pointer hover:underline"
                onClick={() => handleViewTask(row)}>
            {data}
          </span>
          <span className="text-xs text-gray-500 truncate max-w-xs">{row.description}</span>
        </div>
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
    {
      data: 'priority',
      name: 'priority',
      title: t('Priority'),
      orderable: true,
      searchable: false,
      render: (data: string) => getPriorityBadge(data),
    },
    {
      data: 'assigned_to',
      name: 'assigned_to',
      title: t('Assigned To'),
      orderable: true,
      searchable: true,
    },
    {
      data: 'project',
      name: 'project',
      title: t('Project'),
      orderable: true,
      searchable: true,
    },
    {
      data: 'due_date',
      name: 'due_date',
      title: t('Due Date'),
      orderable: true,
      searchable: false,
      render: (data: string) => formatDate(data),
    },
  ];

  const filters = [
    {
      key: 'status',
      label: t('Status'),
      type: 'select' as const,
      options: [
        { value: 'to_do', label: t('To Do') },
        { value: 'in_progress', label: t('In Progress') },
        { value: 'review', label: t('Review') },
        { value: 'done', label: t('Done') }
      ],
      placeholder: t('Filter by status')
    },
    {
      key: 'priority',
      label: t('Priority'),
      type: 'select' as const,
      options: [
        { value: 'high', label: t('High') },
        { value: 'medium', label: t('Medium') },
        { value: 'low', label: t('Low') }
      ],
      placeholder: t('Filter by priority')
    },
    {
      key: 'assigned_to',
      label: t('Assigned To'),
      type: 'text' as const,
      placeholder: t('Filter by assignee')
    }
  ];

  const handleExport = (format: string) => {
    window.open(`/tasks/export?format=${format}`, '_blank');
  };

  const customActions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={onViewKanban || (() => router.get('/task-management/kanban'))}
      >
        <Kanban className="w-4 h-4 mr-2" />
        {t('Kanban View')}
      </Button>
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
      {hasPermission('create_tasks') && (
        <Button onClick={onCreateTask || (() => setCreateModalOpen(true))}>
          <Plus className="w-4 h-4 mr-2" />
          {t('Create Task')}
        </Button>
      )}
    </div>
  );

  const customRowActions = (item: any) => (
    <>
      {hasPermission('view_tasks') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewTask(item)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {hasPermission('edit_tasks') && (
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {hasPermission('delete_tasks') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (onDeleteTask) {
              onDeleteTask(item);
            } else {
              setSelectedTask(item);
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
      'To Do': 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800 border-gray-200',
      'In Progress': 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800 border-blue-200',
      'Review': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800 border-yellow-200',
      'Done': 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800 border-green-200'
    };

    const className = variants[status as keyof typeof variants] || variants['To Do'];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      High: 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800 border-red-200',
      Medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800 border-yellow-200',
      Low: 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800 border-green-200'
    };

    const className = variants[priority as keyof typeof variants] || variants.Medium;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {priority}
      </span>
    );
  };

  const handleViewTask = (task: any) => {
    if (onViewTask) {
      onViewTask(task);
    } else {
      setViewTask(task);
      setViewModalOpen(true);
    }
  };

  const renderGridItem = (task: any) => (
    <Card className="bg-white border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center border-2 border-green-200">
              <CheckSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary cursor-pointer hover:underline text-sm"
                  onClick={() => handleViewTask(task)}>
                {task.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
            </div>
            <div className="flex items-center gap-1">
              {customRowActions(task)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium">Project:</span>
              <span>{task.project}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <User className="h-3 w-3" />
              <span>{task.assigned_to}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Created: {formatDate(task.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Due: {formatDate(task.due_date)}</span>
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
        url="/task-management"
        columns={columns}
        title={t('Tasks')}
        customActions={customActions}
        customRowActions={customRowActions}
        filters={filters}
        gridViewEnabled={true}
        renderGridItem={renderGridItem}
        emptyStateIcon={<CheckSquare className="h-8 w-8 text-gray-400" />}
      />
      
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
            // TODO: Open edit modal
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
                if (tableRef.current) {
                  tableRef.current.refresh();
                }
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
    </>
  );
});

TasksTable.displayName = 'TasksTable';