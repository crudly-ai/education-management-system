import { type BreadcrumbItem } from '@/types';
import { useTranslations } from '@/hooks/use-translations';

export const createBreadcrumbs = (module: string, action?: string, item?: string): BreadcrumbItem[] => {
    const { t } = useTranslations();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('Dashboard'), href: '/dashboard' }
    ];

    // Handle nested modules like 'crudly.projects'
    if (module.includes('.')) {
        const parts = module.split('.');
        if (parts[0] === 'crudly' && parts[1] === 'projects') {
            breadcrumbs.push({
                title: action || t('My Projects'),
                href: '/projects'
            });
        }
    } else {
        breadcrumbs.push({
            title: t(module.charAt(0).toUpperCase() + module.slice(1)),
            href: `/${module.toLowerCase()}`
        });
    }

    if (action && action !== 'index') {
        let actionTitle = action.charAt(0).toUpperCase() + action.slice(1);
        let actionHref = `/${module.toLowerCase()}`;

        if (action === 'create') {
            actionTitle = t('Create');
            actionHref += '/create';
        } else if (action === 'edit' && item) {
            actionTitle = `${t('Edit')} ${item}`;
            actionHref += `/${item}/edit`;
        } else if (action === 'show' && item) {
            actionTitle = item;
            actionHref += `/${item}`;
        }

        breadcrumbs.push({
            title: actionTitle,
            href: actionHref
        });
    }

    return breadcrumbs;
};