import { Button } from '@/components/ui/form/button';
import { Badge } from '@/components/ui/feedback/badge';
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/overlay/modal';
import { Eye, Edit, Calendar, User, Tag, Heart, MessageCircle } from 'lucide-react';
import { BlogPost } from '@/components/blog/blog-data';
import { useFormatters } from '@/utils/formatters';
import { usePermissions } from '@/hooks/use-permissions';

interface BlogViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    blog: BlogPost | null;
    onEdit?: (blog: BlogPost) => void;
}

export function BlogViewModal({ open, onOpenChange, blog, onEdit }: BlogViewModalProps) {
    const { formatDate } = useFormatters();
    const { hasPermission } = usePermissions();

    if (!blog) return null;

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

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

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <ModalHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <ModalTitle className="text-xl mb-2">{blog.title}</ModalTitle>
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
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                                </div>
                                <span>•</span>
                                {getStatusBadge(blog.status)}
                            </div>
                        </div>
                        
                        {hasPermission('edit_blog') && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                    onEdit?.(blog);
                                    onOpenChange(false);
                                }}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        )}
                    </div>
                </ModalHeader>
                
                <div className="space-y-6 py-4">
                    {/* Featured Image Placeholder */}
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <Eye className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">Featured Image</p>
                        </div>
                    </div>

                    {/* Meta Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{blog.views}</div>
                            <div className="text-sm text-muted-foreground">Views</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-500">{blog.likes}</div>
                            <div className="text-sm text-muted-foreground">Likes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-500">{blog.comments}</div>
                            <div className="text-sm text-muted-foreground">Comments</div>
                        </div>
                    </div>

                    {/* Category and Tags */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Category:</span>
                            <Badge variant="outline">{blog.category}</Badge>
                        </div>
                        
                        {blog.tags.length > 0 && (
                            <div className="flex items-start gap-2">
                                <span className="text-sm font-medium mt-1">Tags:</span>
                                <div className="flex flex-wrap gap-2">
                                    {blog.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Excerpt */}
                    {blog.excerpt && (
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                            <p className="text-blue-800 italic">{blog.excerpt}</p>
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                    </div>

                    {/* Engagement Actions */}
                    {blog.status === 'published' && (
                        <div className="flex items-center gap-4 pt-6 border-t">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Heart className="w-4 h-4" />
                                Like ({blog.likes})
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                Comment ({blog.comments})
                            </Button>
                        </div>
                    )}
                </div>

                <ModalFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}