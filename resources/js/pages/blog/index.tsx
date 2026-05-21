import { useState, useRef } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { BlogTable, BlogTableRef } from '@/components/blog/blog-table';
import { BlogCreateModal } from './create';
import { BlogViewModal } from './view';
import { BlogPost } from '@/components/blog/blog-data';

export default function BlogIndex() {
    const { t } = useTranslations();
    const tableRef = useRef<BlogTableRef>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

    const breadcrumbs = createBreadcrumbs('blog', 'index', 'Blog');

    const handleCreateBlog = () => {
        setSelectedBlog(null);
        setCreateModalOpen(true);
    };

    const handleViewBlog = (blog: BlogPost) => {
        setSelectedBlog(blog);
        setViewModalOpen(true);
    };

    const handleEditBlog = (blog: BlogPost) => {
        setSelectedBlog(blog);
        setCreateModalOpen(true);
    };

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Blog')} />
            <div className="p-6">
                <BlogTable
                    ref={tableRef}
                    onCreateBlog={handleCreateBlog}
                    onViewBlog={handleViewBlog}
                    onEditBlog={handleEditBlog}
                />
            </div>

            <BlogCreateModal
                open={createModalOpen}
                onOpenChange={(open) => {
                    setCreateModalOpen(open);
                    if (!open) setSelectedBlog(null);
                }}
                blog={selectedBlog}
                onSuccess={() => {
                    tableRef.current?.refresh();
                    setSelectedBlog(null);
                    setCreateModalOpen(false);
                }}
            />

            <BlogViewModal
                open={viewModalOpen}
                onOpenChange={(open) => {
                    setViewModalOpen(open);
                    if (!open) setSelectedBlog(null);
                }}
                blog={selectedBlog}
                onEdit={(blog) => {
                    setSelectedBlog(blog);
                    setViewModalOpen(false);
                    setCreateModalOpen(true);
                }}
            />
        </AuthenticatedLayout>
    );
}