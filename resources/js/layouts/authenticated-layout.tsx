import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AuthenticatedLayout({ children, breadcrumbs, ...props }: AuthenticatedLayoutProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayout>
    );
}