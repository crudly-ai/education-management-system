import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Textarea } from '@/components/ui/form/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/overlay/modal';
import { Badge } from '@/components/ui/feedback/badge';
import { X, Upload, Bold, Italic, Underline, Link, List, AlignLeft, Image, Trash2 } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import { useToast } from '@/hooks/use-toast';
import { BlogPost, blogCategories } from '@/components/blog/blog-data';

interface BlogCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    blog?: BlogPost | null;
    onSuccess?: () => void;
}

export function BlogCreateModal({ open, onOpenChange, blog, onSuccess }: BlogCreateModalProps) {
    const { t } = useTranslations();
    const { toast } = useToast();
    const isEditing = !!blog;

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        tags: [] as string[],
        status: 'draft' as 'draft' | 'published' | 'scheduled',
        metaTitle: '',
        metaDescription: '',
        featuredImage: null as File | null
    });
    const [tagInput, setTagInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (blog) {
            setFormData({
                title: blog.title,
                excerpt: blog.excerpt,
                content: blog.content,
                category: blog.category,
                tags: blog.tags,
                status: blog.status,
                metaTitle: blog.title,
                metaDescription: blog.excerpt,
                featuredImage: null
            });
            setImagePreview(blog.featuredImage || null);
        } else {
            setFormData({
                title: '',
                excerpt: '',
                content: '',
                category: '',
                tags: [],
                status: 'draft',
                metaTitle: '',
                metaDescription: '',
                featuredImage: null
            });
            setImagePreview(null);
        }
    }, [blog, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title || !formData.content || !formData.category) {
            toast.error('Please fill in all required fields');
            return;
        }

        const action = isEditing ? 'updated' : 'created';
        toast.success(`Blog post ${action} successfully!`);
        onSuccess?.();
        onOpenChange(false);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const formatText = (command: string) => {
        document.execCommand(command, false);
        const editor = document.querySelector('[contenteditable]') as HTMLElement;
        if (editor) {
            setFormData(prev => ({ ...prev, content: editor.innerHTML }));
        }
    };

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        setFormData(prev => ({ ...prev, content: e.currentTarget.innerHTML }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error('Image size should be less than 2MB');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file');
                return;
            }
            
            setFormData(prev => ({ ...prev, featuredImage: file }));
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, featuredImage: null }));
        setImagePreview(null);
    };

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        <ModalTitle>{isEditing ? 'Edit Blog Post' : 'Create Blog Post'}</ModalTitle>
                    </ModalHeader>
                    
                    <div className="space-y-6 py-4">
                        {/* Title */}
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter blog post title"
                            />
                        </div>

                        {/* Category and Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Category *</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {blogCategories.map(category => (
                                            <SelectItem key={category.id} value={category.name}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <Label>Tags</Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Add tags (press Enter)"
                                        className="flex-1"
                                    />
                                    <Button type="button" onClick={handleAddTag} variant="outline">
                                        Add
                                    </Button>
                                </div>
                                {formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {tag}
                                                <X 
                                                    className="w-3 h-3 cursor-pointer" 
                                                    onClick={() => handleRemoveTag(tag)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div>
                            <Label htmlFor="excerpt">Excerpt</Label>
                            <Textarea
                                id="excerpt"
                                value={formData.excerpt}
                                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                placeholder="Brief description of the blog post"
                                rows={3}
                            />
                        </div>

                        {/* Featured Image */}
                        <div>
                            <Label>Featured Image</Label>
                            {imagePreview ? (
                                <div className="relative border rounded-lg p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="relative">
                                            <img 
                                                src={imagePreview} 
                                                alt="Featured image preview" 
                                                className="w-32 h-24 object-cover rounded-lg"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium mb-1">
                                                {formData.featuredImage?.name || 'Current image'}
                                            </p>
                                            <p className="text-xs text-muted-foreground mb-2">
                                                {formData.featuredImage ? 
                                                    `${(formData.featuredImage.size / 1024 / 1024).toFixed(2)} MB` : 
                                                    'Existing image'
                                                }
                                            </p>
                                            <div className="flex gap-2">
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => document.getElementById('image-upload')?.click()}
                                                >
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Change
                                                </Button>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={handleRemoveImage}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                            ) : (
                                <div 
                                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                >
                                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Rich Text Editor */}
                        <div>
                            <Label>Content *</Label>
                            <div className="border rounded-lg">
                                {/* Toolbar */}
                                <div className="border-b p-2 bg-muted/50">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => formatText('bold')}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Bold className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => formatText('italic')}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Italic className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => formatText('underline')}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Underline className="w-4 h-4" />
                                        </Button>
                                        <div className="w-px h-6 bg-border mx-1" />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => formatText('insertUnorderedList')}
                                            className="h-8 w-8 p-0"
                                        >
                                            <List className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => formatText('justifyLeft')}
                                            className="h-8 w-8 p-0"
                                        >
                                            <AlignLeft className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const url = prompt('Enter URL:');
                                                if (url) formatText('createLink');
                                            }}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Link className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                
                                {/* Editor */}
                                <div
                                    contentEditable
                                    className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
                                    onInput={handleContentChange}
                                    dangerouslySetInnerHTML={{ __html: formData.content || '<p>Write your blog content here...</p>' }}
                                />
                            </div>
                        </div>

                        {/* SEO Settings */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="font-medium">SEO Settings</h3>
                            
                            <div>
                                <Label htmlFor="metaTitle">Meta Title</Label>
                                <Input
                                    id="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                                    placeholder="SEO title for search engines"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="metaDescription">Meta Description</Label>
                                <Textarea
                                    id="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                                    placeholder="SEO description for search engines"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    <ModalFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="outline">
                            Save Draft
                        </Button>
                        <Button type="submit">
                            {isEditing ? 'Update Post' : 'Publish Post'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}