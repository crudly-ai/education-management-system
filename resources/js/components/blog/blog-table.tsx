import { useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Badge } from '@/components/ui/feedback/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/navigation/dropdown-menu';
import { Plus, Search, Eye, Edit, Trash2, MoreVertical, FileText, Users, Calendar } from 'lucide-react';
import { BlogPost, sampleBlogPosts, blogCategories, getBlogStats } from './blog-data';
import { useFormatters } from '@/utils/formatters';
import { usePermissions } from '@/hooks/use-permissions';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export interface BlogTableRef {
    refresh: () => void;
}

interface BlogTableProps {
    onCreateBlog?: () => void;
    onEditBlog?: (blog: BlogPost) => void;
    onViewBlog?: (blog: BlogPost) => void;
}

export const BlogTable = forwardRef<BlogTableRef, BlogTableProps>(({ 
    onCreateBlog, 
    onEditBlog, 
    onViewBlog 
}, ref) => {
    const [blogs, setBlogs] = useState<BlogPost[]>(sampleBlogPosts);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

    const { hasPermission } = usePermissions();
    const { formatDate } = useFormatters();
    const { t } = useTranslations();
    const { toast } = useToast();

    useImperativeHandle(ref, () => ({
        refresh: () => {
            setBlogs([...sampleBlogPosts]);
        }
    }));

    const stats = getBlogStats();

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || blog.status === selectedStatus;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const variants = {
            published: 'bg-green-100 text-green-800 border-green-200',
            draft: 'bg-gray-100 text-gray-800 border-gray-200',
            scheduled: 'bg-blue-100 text-blue-800 border-blue-200'
        };
        
        return (
            <Badge variant="outline" className={variants[status as keyof typeof variants]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const handleDelete = (blog: BlogPost) => {
        setSelectedBlog(blog);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedBlog) {
            setBlogs(blogs.filter(b => b.id !== selectedBlog.id));
            toast.success('Blog post deleted successfully');
            setDeleteDialogOpen(false);
            setSelectedBlog(null);
        }
    };

    const handleDialogClose = (open: boolean) => {
        setDeleteDialogOpen(open);
        if (!open) {
            setSelectedBlog(null);
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">{stats.drafts}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Blog Posts</CardTitle>
                        {hasPermission('create_blog') && (
                            <Button onClick={onCreateBlog}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Blog
                            </Button>
                        )}
                    </div>
                </CardHeader>
                
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search blog posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {blogCategories.map(category => (
                                    <SelectItem key={category.id} value={category.name}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-full sm:w-32">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Blog Posts Grid */}
                    {filteredBlogs.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">No blog posts found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' 
                                    ? 'Try adjusting your filters' 
                                    : 'Get started by creating your first blog post'
                                }
                            </p>
                            {hasPermission('create_blog') && (
                                <Button onClick={onCreateBlog}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Blog Post
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBlogs.map((blog) => (
                                <div key={blog.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        {/* Featured Image Placeholder */}
                                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg mb-1 hover:text-primary cursor-pointer"
                                                        onClick={() => onViewBlog?.(blog)}>
                                                        {blog.title}
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                                                        {blog.excerpt}
                                                    </p>
                                                </div>
                                                
                                                <DropdownMenu modal={false}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {hasPermission('view_blog') && (
                                                            <DropdownMenuItem onClick={() => onViewBlog?.(blog)}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('edit_blog') && (
                                                            <DropdownMenuItem onClick={() => onEditBlog?.(blog)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('delete_blog') && (
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDelete(blog)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-xs font-medium text-primary">
                                                            {getInitials(blog.author.name)}
                                                        </span>
                                                    </div>
                                                    <span>{blog.author.name}</span>
                                                </div>
                                                
                                                <span>•</span>
                                                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                                                <span>•</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {blog.category}
                                                </Badge>
                                                <span>•</span>
                                                {getStatusBadge(blog.status)}
                                                
                                                {blog.status === 'published' && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{blog.views} views</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={handleDialogClose}
                title="Delete Blog Post"
                description={`Are you sure you want to delete "${selectedBlog?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </div>
    );
});

BlogTable.displayName = 'BlogTable';