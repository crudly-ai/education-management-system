import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/form/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/navigation/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useFormatters } from '@/utils/formatters';
import { useTranslations } from '@/hooks/use-translations';
import { CrudlyProject } from '../types';

interface ProjectCardProps {
  project: CrudlyProject;
  onDelete: (slug: string) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const { t } = useTranslations();
  const { formatIcon, formatDate } = useFormatters();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {formatIcon(project.icon, 'w-8 h-8 text-primary')}
            <div>
              <h3 className="font-semibold text-lg">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.slug}`}>
                  <Edit className="w-4 h-4 mr-2" />
                  {t('Edit')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/crudly-builder?project=${project.slug}`} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('Open in Builder')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(project.slug)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('Delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('Updated')} {formatDate(project.updated_at)}</span>
          {project.is_public && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              {t('Public')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}