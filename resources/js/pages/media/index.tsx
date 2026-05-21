import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { FileUpload } from '@/components/ui/form/file-upload';
import { MediaGallery } from '@/components/media/media-gallery';
import { FilePreviewModal } from '@/components/media/file-preview-modal';
import { useTranslations } from '@/hooks/use-translations';

import { useMedia } from '@/hooks/use-media';

import { Input } from '@/components/ui/form/input';
import { Button } from '@/components/ui/form/button';
import { Search, ArrowUpDown, Folder, FolderPlus, Home, Edit2, Trash2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/overlay/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/navigation/dropdown-menu';

interface MediaItem {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    collection_name: string;
    url: string;
    created_at: string;
    created_by?: string;
}

interface MediaPageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
}

export default function MediaIndex({ auth }: MediaPageProps) {
    const { t } = useTranslations();
    const [searchTerm, setSearchTerm] = useState('');
    const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [folderPath, setFolderPath] = useState<{id: number | null, name: string}[]>([{id: null, name: 'Root'}]);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolder, setEditingFolder] = useState<{id: number, name: string} | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<{type: 'file' | 'folder' | 'bulk', id: number, name: string} | null>(null);
    const [bulkDeleteIds, setBulkDeleteIds] = useState<number[]>([]);
    const [deleteError, setDeleteError] = useState<string | null>(null);


    const { media: mediaData, folders, config, loading, uploadFiles, deleteMedia, bulkDeleteMedia, downloadMedia, createFolder, updateFolder, deleteFolder } = useMedia({
        search: searchTerm,
        folderId: currentFolderId,
        page: currentPage
    });

    const sortedItems = useMemo(() => {
        const sortedFolders = [...folders].sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        const mediaItems = mediaData?.data || [];
        const sortedMedia = [...mediaItems].sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'date':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
                case 'size':
                    comparison = a.size - b.size;
                    break;
                case 'type':
                    comparison = a.mime_type.localeCompare(b.mime_type);
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return { folders: sortedFolders, media: sortedMedia };
    }, [folders, mediaData, sortBy, sortOrder]);

    const handleUpload = (files: File[]) => {
        uploadFiles(files, undefined, currentFolderId);
    };



    const handleFolderClick = (folderId: number, folderName: string) => {
        setCurrentFolderId(folderId);
        setFolderPath([...folderPath, {id: folderId, name: folderName}]);
    };

    const handleBreadcrumbClick = (index: number) => {
        const newPath = folderPath.slice(0, index + 1);
        setFolderPath(newPath);
        setCurrentFolderId(newPath[newPath.length - 1].id);
    };

    const handleCreateFolder = async () => {
        if (newFolderName.trim()) {
            await createFolder(newFolderName.trim(), currentFolderId);
            setNewFolderName('');
            setShowCreateFolder(false);
        }
    };

    const handleUpdateFolder = async () => {
        if (editingFolder && editingFolder.name.trim()) {
            await updateFolder(editingFolder.id, editingFolder.name.trim());
            setEditingFolder(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!showDeleteConfirm) return;

        setDeleteError(null);
        try {
            if (showDeleteConfirm.type === 'file') {
                await deleteMedia(showDeleteConfirm.id);
                setShowDeleteConfirm(null);
            } else if (showDeleteConfirm.type === 'bulk') {
                await bulkDeleteMedia(bulkDeleteIds);
                setShowDeleteConfirm(null);
                setBulkDeleteIds([]);
            } else {
                await deleteFolder(showDeleteConfirm.id);
                setShowDeleteConfirm(null);
            }
        } catch (error: any) {
            setDeleteError(error.message || 'Delete failed');
        }
    };



    const handlePreview = (item: MediaItem) => {
        setPreviewMedia(item);
    };

    const breadcrumbs = createBreadcrumbs('media');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Media Library')} />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t('Media Library')}</h1>
                        <p className="text-gray-600">{t('Manage your files and media')}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-6 border-b bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <h3 className="text-lg font-semibold">{t('Upload Files')}</h3>
                                {config && (
                                    <div className="text-sm text-muted-foreground">
                                        {t('Max')}: {config.max_upload_size_mb}MB | {t('Allowed')}: {config.allowed_extensions.join(', ')}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder={t('Search files')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date">{t('Date')}</SelectItem>
                                        <SelectItem value="name">{t('Name')}</SelectItem>
                                        <SelectItem value="size">{t('Size')}</SelectItem>
                                        <SelectItem value="type">{t('Type')}</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                >
                                    <ArrowUpDown className="w-4 h-4" />
                                </Button>

                                <div className="flex items-center space-x-2">
                                    <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <FolderPlus className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{t('Create New Folder')}</DialogTitle>
                                                <DialogDescription>{t('Enter a name for the new folder')}</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <Input
                                                    placeholder={t('Folder name')}
                                                    value={newFolderName}
                                                    onChange={(e) => setNewFolderName(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                                                />
                                                <div className="flex justify-end space-x-2">
                                                    <Button variant="outline" onClick={() => setShowCreateFolder(false)}>{t('Cancel')}</Button>
                                                    <Button onClick={handleCreateFolder}>{t('Create')}</Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                        <FileUpload
                            onUpload={handleUpload}
                            collection="media"
                            maxSize={config ? config.max_upload_size_mb * 1024 * 1024 : 10 * 1024 * 1024}
                            allowedExtensions={config?.allowed_extensions}
                        />
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-muted-foreground">{t('Loading')}...</div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedItems.folders.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {sortedItems.folders.map((folder) => (
                                            <div
                                                key={folder.id}
                                                className="relative flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 group"
                                            >
                                                <div
                                                    className="cursor-pointer flex flex-col items-center w-full"
                                                    onClick={() => handleFolderClick(folder.id, folder.name)}
                                                >
                                                    <Folder className="w-12 h-12 text-blue-500 mb-2" />
                                                    <span className="text-sm font-medium text-center">{folder.name}</span>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => setEditingFolder({id: folder.id, name: folder.name})}>
                                                            <Edit2 className="w-4 h-4 mr-2" />
                                                            {t('Rename')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setShowDeleteConfirm({type: 'folder', id: folder.id, name: folder.name})}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            {t('Delete')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <MediaGallery
                                    media={sortedItems.media}
                                    onDelete={(id) => setShowDeleteConfirm({type: 'file', id, name: sortedItems.media.find(m => m.id === id)?.name || 'file'})}
                                    onBulkDelete={(ids) => { setBulkDeleteIds(ids); setShowDeleteConfirm({type: 'bulk', id: ids.length, name: `${ids.length} files`}); }}
                                    onDownload={downloadMedia}
                                    onPreview={handlePreview}
                                    viewMode="grid"
                                />

                                {/* Pagination */}
                                {mediaData && mediaData.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-muted-foreground">
                                            {t('Showing')} {mediaData.from || 0} {t('to')} {mediaData.to || 0} {t('of')} {mediaData.total} {t('results')}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                {t('Previous')}
                                            </Button>

                                            <div className="flex items-center space-x-1">
                                                {Array.from({ length: Math.min(5, mediaData.last_page) }, (_, i) => {
                                                    const page = i + 1;
                                                    return (
                                                        <Button
                                                            key={page}
                                                            variant={currentPage === page ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setCurrentPage(page)}
                                                            className="w-8 h-8 p-0"
                                                        >
                                                            {page}
                                                        </Button>
                                                    );
                                                })}
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                disabled={currentPage === mediaData.last_page}
                                            >
                                                {t('Next')}
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FilePreviewModal
                media={previewMedia}
                open={!!previewMedia}
                onClose={() => setPreviewMedia(null)}
                onDownload={downloadMedia}
            />

            {/* Edit Folder Dialog */}
            <Dialog open={!!editingFolder} onOpenChange={() => setEditingFolder(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Rename Folder')}</DialogTitle>
                        <DialogDescription>{t('Enter a new name for the folder')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder={t('Folder name')}
                            value={editingFolder?.name || ''}
                            onChange={(e) => setEditingFolder(prev => prev ? {...prev, name: e.target.value} : null)}
                            onKeyPress={(e) => e.key === 'Enter' && handleUpdateFolder()}
                        />
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setEditingFolder(null)}>{t('Cancel')}</Button>
                            <Button onClick={handleUpdateFolder}>{t('Save')}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!showDeleteConfirm} onOpenChange={() => { setShowDeleteConfirm(null); setDeleteError(null); setBulkDeleteIds([]); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Confirm Delete')}</DialogTitle>
                        <DialogDescription>{t('This action cannot be undone')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {deleteError ? (
                            <>
                                <p className="text-red-600">{deleteError}</p>
                                <div className="flex justify-end">
                                    <Button onClick={() => { setShowDeleteConfirm(null); setDeleteError(null); setBulkDeleteIds([]); }}>{t('OK')}</Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p>{t('Are you sure you want to delete')} {showDeleteConfirm?.type} "{showDeleteConfirm?.name}"?</p>
                                <p className="text-sm text-gray-500">{t('This action cannot be undone')}.</p>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>{t('Cancel')}</Button>
                                    <Button variant="destructive" onClick={handleDeleteConfirm}>{t('Delete')}</Button>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>


        </AppLayout>
    );
}