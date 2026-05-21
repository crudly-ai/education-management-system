import { YajraDataTable } from '@/components/datatable';
import { useFormatters } from '@/utils/formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Plus, Eye, Edit, Trash2, Download, Users, Calendar, FolderOpen, ChevronDown, User, DollarSign, Briefcase } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/navigation/dropdown-menu';
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { router } from '@inertiajs/react';
import { ProjectCreateModal } from '@/pages/projects/create';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Toaster } from '@/components/ui/feedback/toaster';

interface ProjectsTableProps {
  onCreateProject?: () => void;
  onDeleteProject?: (project: any) => void;
  onViewProject?: (projectId: number) => void;
  showCreateModal?: boolean;
  showDeleteDialog?: boolean;
}

export interface ProjectsTableRef {
  refresh: () => void;
}

export const ProjectsTable = forwardRef<ProjectsTableRef, ProjectsTableProps>(({ 
  onCreateProject, 
  onDeleteProject,
  onViewProject,
  showCreateModal = true,
  showDeleteDialog = true
}, ref) => {
  const { hasPermission } = usePermissions();
  const { formatDate, formatCurrency } = useFormatters();
  const { t } = useTranslations();
  const { toast } = useToast();
  const tableRef = useRef<any>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

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

    window.addEventListener('projectCreated', handleRefresh);
    return () => window.removeEventListener('projectCreated', handleRefresh);
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
      data: 'name',
      name: 'name',
      title: t('Project Name'),
      orderable: true,
      searchable: true,
      render: (data: string, type: string, row: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary cursor-pointer hover:underline"
                onClick={() => handleViewProject(row.id)}>
            {data}
          </span>
          <span className="text-xs text-gray-500 truncate max-w-xs">{row.description}</span>
        </div>
      ),
    },
    {
      data: 'client',
      name: 'client',
      title: t('Client'),
      orderable: true,
      searchable: true,
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
      data: 'progress',
      name: 'progress',
      title: t('Progress'),
      orderable: true,
      searchable: false,
      render: (data: number) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${data}%` }}
            ></div>
          </div>
          <span className="text-xs font-medium">{data}%</span>
        </div>
      ),
    },
    {
      data: 'budget',
      name: 'budget',
      title: t('Budget'),
      orderable: true,
      searchable: false,
      render: (data: number) => (
        <span className="font-medium">{formatCurrency(data)}</span>
      ),
    },
    {
      data: 'end_date',
      name: 'end_date',
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
        { value: 'active', label: t('Active') },
        { value: 'completed', label: t('Completed') },
        { value: 'on_hold', label: t('On Hold') },
        { value: 'cancelled', label: t('Cancelled') }
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
      key: 'date_from',
      label: t('Start Date From'),
      type: 'date' as const,
      placeholder: t('Select start date')
    },
    {
      key: 'date_to',
      label: t('End Date To'),
      type: 'date' as const,
      placeholder: t('Select end date')
    }
  ];

  const handleExport = (format: string) => {
    window.open(`/projects/export?format=${format}`, '_blank');
  };

  const customActions = (
    <div className="flex gap-2">
      {hasPermission('export_projects') && (
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
      {hasPermission('create_projects') && (
        <Button onClick={onCreateProject || (() => setCreateModalOpen(true))}>
          <Plus className="w-4 h-4 mr-2" />
          {t('Create Project')}
        </Button>
      )}
    </div>
  );

  const customRowActions = (item: any) => (
    <>
      {hasPermission('view_projects') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewProject(item.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {hasPermission('edit_projects') && (
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {hasPermission('delete_projects') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (onDeleteProject) {
              onDeleteProject(item);
            } else {
              setSelectedProject(item);
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
      active: 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800 border-blue-200',
      on_hold: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800 border-red-200'
    };

    const className = variants[status as keyof typeof variants] || variants.active;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800 border-red-200',
      medium: 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800 border-gray-200',
      low: 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800 border-blue-200'
    };

    const className = variants[priority as keyof typeof variants] || variants.medium;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const handleViewProject = (projectId: number) => {
    if (onViewProject) {
      onViewProject(projectId);
    } else {
      router.get(`/project-management/${projectId}`);
    }
  };

  const renderGridItem = (project: any) => (
    <Card className="bg-white border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-2 border-blue-200">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary cursor-pointer hover:underline text-sm"
                  onClick={() => handleViewProject(project.id)}>
                {project.name}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
            </div>
            <div className="flex items-center gap-1">
              {customRowActions(project)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium">Client:</span>
              <span>{project.client}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <User className="h-3 w-3" />
              <span>{project.project_manager}</span>
              <Users className="h-3 w-3 ml-2" />
              <span>{project.team_size} members</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {getStatusBadge(project.status)}
              {getPriorityBadge(project.priority)}
            </div>
            <div className="flex items-center gap-1 text-sm font-medium">
              <DollarSign className="h-3 w-3" />
              <span>{formatCurrency(project.budget)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(project.start_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Due: {formatDate(project.end_date)}</span>
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
        url="/project-management"
        columns={columns}
        title={t('Projects')}
        customActions={customActions}
        customRowActions={customRowActions}
        filters={filters}
        gridViewEnabled={true}
        renderGridItem={renderGridItem}
        emptyStateIcon={<Briefcase className="h-8 w-8 text-gray-400" />}
      />
      
      {showCreateModal && (
        <ProjectCreateModal 
          open={createModalOpen} 
          onOpenChange={setCreateModalOpen} 
        />
      )}
      
      {showDeleteDialog && (
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={t('Delete Project')}
          description={`${t('Are you sure?')} ${t('This action cannot be undone')}`}
          confirmText={t('Delete')}
          variant="destructive"
          onConfirm={() => {
            router.delete(`/projects/${selectedProject?.id}`, {
              onSuccess: () => {
                toast.success(t('Project deleted successfully'));
                if (tableRef.current) {
                  tableRef.current.refresh();
                }
                setDeleteDialogOpen(false);
              },
              onError: () => {
                toast.error(t('Failed to delete project'), { description: t('Please try again') });
              },
            });
          }}
        />
      )}
      
      <Toaster />
    </>
  );
});

ProjectsTable.displayName = 'ProjectsTable';