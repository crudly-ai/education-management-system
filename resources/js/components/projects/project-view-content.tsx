import { useState } from 'react';
import { useFormatters } from '@/utils/formatters';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/overlay/dialog';
import { MediaSelector } from '@/components/ui/form/media-selector';
import { Label } from '@/components/ui/form/label';
import { 
    Calendar, 
    DollarSign, 
    Users, 
    Clock, 
    Target,
    Briefcase,
    User,
    Building2,
    FileText,
    TrendingUp,
    File,
    Download,
    Upload,
    X
} from 'lucide-react';

interface Project {
    id: number;
    name: string;
    description: string;
    client: string;
    status: string;
    priority: string;
    start_date: string;
    end_date: string;
    budget: number;
    progress: number;
    project_manager: string;
    team_size: number;
    category: string;
    estimated_hours?: number;
    actual_hours?: number;
    team_members?: Array<{name: string; role: string; email: string}>;
    files?: Array<{name: string; size: string; type: string; uploaded_by: string; uploaded_at: string}>;
    created_at: string;
}

interface Props {
    project: Project;
}

export function ProjectViewContent({ project }: Props) {
    const { formatDate, formatCurrency } = useFormatters();
    const { t } = useTranslations();
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    const handleFileUpload = () => {
        if (selectedFiles.length > 0) {
            console.log('Adding files to project:', selectedFiles);
            setUploadModalOpen(false);
            setSelectedFiles([]);
        }
    };

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

    const calculateDaysRemaining = () => {
        const endDate = new Date(project.end_date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const calculateDuration = () => {
        const startDate = new Date(project.start_date);
        const endDate = new Date(project.end_date);
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = calculateDaysRemaining();
    const totalDuration = calculateDuration();

    return (
        <div className="p-6">
            <div className="w-full">
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <Briefcase className="h-10 w-10 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{project.name}</h1>
                                    <span className="text-sm text-gray-500 font-semibold bg-white px-3 py-1 rounded-full">#{project.id.toString().padStart(3, '0')}</span>
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    {getStatusBadge(project.status)}
                                    {getPriorityBadge(project.priority)}
                                </div>
                                <p className="text-gray-700 text-lg leading-relaxed max-w-4xl">{project.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <Card className="mb-8 border-0 shadow-lg">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                                <span className="text-lg font-semibold text-gray-900">{t('Project Progress')}</span>
                            </div>
                            <span className="text-2xl font-bold text-blue-600">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500 shadow-sm" 
                                style={{ width: `${project.progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>Started {formatDate(project.start_date)}</span>
                            <span>Due {formatDate(project.end_date)}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="xl:col-span-3 space-y-6">
                        {/* Project Overview */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <FileText className="h-5 w-5 text-gray-600" />
                                    {t('Project Overview')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Client')}</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">{project.client}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Target className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Category')}</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">{project.category}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <User className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Project Manager')}</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">{project.project_manager}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Users className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('Team Size')}</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">{project.team_size} {t('members')}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline & Budget */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                    <Calendar className="h-5 w-5 text-gray-600" />
                                    {t('Timeline & Budget')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 text-sm mb-4">{t('Timeline')}</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                                <Calendar className="h-4 w-4 text-blue-600" />
                                                <div>
                                                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">{t('Start Date')}</p>
                                                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(project.start_date)}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                                                <Calendar className="h-4 w-4 text-red-600" />
                                                <div>
                                                    <p className="text-xs font-medium text-red-600 uppercase tracking-wide">{t('End Date')}</p>
                                                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(project.end_date)}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                <Clock className="h-4 w-4 text-green-600" />
                                                <div>
                                                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide">{t('Duration')}</p>
                                                    <p className="text-sm font-semibold text-gray-900 mt-1">{totalDuration} {t('days')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900 text-sm mb-4">{t('Budget & Hours')}</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                <div>
                                                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide">{t('Total Budget')}</p>
                                                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(project.budget)}</p>
                                                </div>
                                            </div>
                                            
                                            {project.estimated_hours && (
                                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                                    <Clock className="h-4 w-4 text-blue-600" />
                                                    <div>
                                                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">{t('Estimated Hours')}</p>
                                                        <p className="text-sm font-semibold text-gray-900 mt-1">{project.estimated_hours}h</p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {project.actual_hours && (
                                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                                    <Clock className="h-4 w-4 text-purple-600" />
                                                    <div>
                                                        <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">{t('Actual Hours')}</p>
                                                        <p className="text-sm font-semibold text-gray-900 mt-1">{project.actual_hours}h</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Team & Files Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Team Members */}
                            {project.team_members && project.team_members.length > 0 && (
                                <Card className="border-0 shadow-lg">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                            <Users className="h-4 w-4 text-gray-600" />
                                            {t('Team Members')} ({project.team_members.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                            {project.team_members.map((member, index) => (
                                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                                                        {member.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 text-sm truncate">{member.name}</h4>
                                                        <p className="text-xs text-gray-600">{member.role}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Files & Documents */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                            <File className="h-4 w-4 text-gray-600" />
                                            {t('Files')} ({project.files?.length || 0})
                                        </CardTitle>
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setUploadModalOpen(true)}>
                                            <Upload className="h-4 w-4 mr-1" />
                                            {t('Upload')}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-80 overflow-y-auto">
                                        {project.files && project.files.length > 0 ? (
                                            project.files.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                            <FileText className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-medium text-gray-900 text-sm truncate">{file.name}</h4>
                                                            <p className="text-xs text-gray-500">{file.size} • {file.uploaded_by}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 flex-shrink-0">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <File className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                <p className="text-sm">{t('No files uploaded yet')}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Progress Stats */}
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-4">
                                <div className="text-center mb-4">
                                    <div className="text-2xl font-bold text-blue-600 mb-1">{project.progress}%</div>
                                    <div className="text-sm text-gray-600">{t('Complete')}</div>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('Status')}</span>
                                        {getStatusBadge(project.status)}
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('Priority')}</span>
                                        {getPriorityBadge(project.priority)}
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('Days Left')}</span>
                                        <span className={`font-medium ${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {daysRemaining < 0 ? `${Math.abs(daysRemaining)} overdue` : daysRemaining}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('Duration')}</span>
                                        <span className="font-medium">{totalDuration} days</span>
                                    </div>
                                    
                                    {project.estimated_hours && project.actual_hours && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('Hours')}</span>
                                            <span className="font-medium">
                                                {project.actual_hours}/{project.estimated_hours}h
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            
            {/* Upload File Modal */}
            <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            {t('Upload File')}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div>
                            <Label>{t('Select Files')}</Label>
                            <MediaSelector
                                selectedPaths={selectedFiles}
                                multiple={true}
                                label="Files"
                                title={t('Select Project Files')}
                                onChange={setSelectedFiles}
                            />
                        </div>
                        
                        <div className="flex items-center justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setUploadModalOpen(false);
                                    setSelectedFiles([]);
                                }}
                            >
                                <X className="w-4 h-4 mr-2" />
                                {t('Cancel')}
                            </Button>
                            <Button
                                onClick={handleFileUpload}
                                disabled={selectedFiles.length === 0}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {t('Add to Project')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}