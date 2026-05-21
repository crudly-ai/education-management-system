import { ProjectViewContent } from '@/components/projects/project-view-content';
import AuthenticatedLayout from '@/layouts/authenticated-layout';

import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';

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

interface ProjectViewProps {
    project: Project;
}

export default function View({ project }: ProjectViewProps) {
    const { t } = useTranslations();

    const breadcrumbs = [
        { title: t('Project Management'), href: '/project-management' },
        { title: project.name, href: `/project-management/${project.id}` }
    ];

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.name} - ${t('Project Management')}`} />
            <ProjectViewContent project={project} />
        </AuthenticatedLayout>
    );
}