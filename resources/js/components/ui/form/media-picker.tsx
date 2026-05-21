import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/overlay/dialog';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { FileUpload } from './file-upload';
import { useMedia } from '@/hooks/use-media';
import { useTranslations } from '@/hooks/use-translations';
import { Search, Check, Folder, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaItem {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    url: string;
    created_at: string;
    created_by?: string;
}

interface MediaPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (selectedMedia: MediaItem[]) => void;
    multiple?: boolean;
    collection?: string;
    selectedIds?: number[];
    title?: string;
}

export function MediaPicker({ open, onClose, onSelect, multiple = false, collection, selectedIds = [], title }: MediaPickerProps) {
    const { t } = useTranslations();
    const [activeTab, setActiveTab] = useState('media');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [folderPath, setFolderPath] = useState<{id: number | null, name: string}[]>([{id: null, name: 'Root'}]);
    const [uploadMessage, setUploadMessage] = useState<string>('');
    const { media: mediaData, folders, loading, uploadFiles, refetch } = useMedia({
        search: searchTerm,
        folderId: currentFolderId,
        page: currentPage,
        enabled: open
    });
    
    const media = mediaData?.data || [];
    
    // Initialize selected media when component opens or selectedIds change
    React.useEffect(() => {
        if (open && selectedIds.length > 0) {
            fetchSelectedMedia(selectedIds);
        } else if (open && selectedIds.length === 0) {
            setSelectedMedia([]);
        }
    }, [open, selectedIds]);
    
    const fetchSelectedMedia = async (ids: number[]) => {
        if (!ids || ids.length === 0) {
            return;
        }
        
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch('/media/urls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ ids })
            });
            
            if (response.ok) {
                const urls = await response.json();
                const selectedItems = ids.map(id => ({
                    id,
                    name: `Media ${id}`,
                    file_name: `media_${id}`,
                    mime_type: 'image/jpeg',
                    size: 0,
                    url: urls[id] || '',
                    created_at: new Date().toISOString(),
                }));
                setSelectedMedia(selectedItems);
            }
        } catch (error) {
            console.error('Failed to fetch selected media:', error);
        }
    };

    const handleUpload = async (files: File[]) => {
        try {
            setUploadMessage(t('Uploading files...'));
            await uploadFiles(files, 'media', currentFolderId);
            setUploadMessage(t('Successfully uploaded') + ` ${files.length} ` + t('file(s)!'));
            
            // Switch to media tab after successful upload
            setTimeout(() => {
                setActiveTab('media');
                setUploadMessage('');
                refetch(); // Refresh media list
            }, 2000);
        } catch (error) {
            setUploadMessage(t('Upload failed. Please try again.'));
            setTimeout(() => setUploadMessage(''), 3000);
        }
    };
    
    const navigateToFolder = (folderId: number | null, folderName: string) => {
        setCurrentFolderId(folderId);
        setCurrentPage(1);
        
        if (folderId === null) {
            setFolderPath([{id: null, name: 'Root'}]);
        } else {
            const newPath = [...folderPath, {id: folderId, name: folderName}];
            setFolderPath(newPath);
        }
    };
    
    const navigateToPath = (index: number) => {
        const targetFolder = folderPath[index];
        setCurrentFolderId(targetFolder.id);
        setCurrentPage(1);
        setFolderPath(folderPath.slice(0, index + 1));
    };

    const handleMediaClick = (item: MediaItem) => {
        if (multiple) {
            setSelectedMedia(prev => {
                const exists = prev.find(m => m.id === item.id);
                if (exists) {
                    return prev.filter(m => m.id !== item.id);
                }
                return [...prev, item];
            });
        } else {
            setSelectedMedia([item]);
        }
    };

    const handleSelect = () => {
        onSelect(selectedMedia);
        onClose();
    };
    
    const handleClose = () => {
        // Reset to original selection on cancel
        if (selectedIds.length > 0) {
            fetchSelectedMedia(selectedIds);
        } else {
            setSelectedMedia([]);
        }
        onClose();
    };

    const totalPages = mediaData?.last_page || 1;
    const currentPageNum = mediaData?.current_page || 1;
    
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{title || t('Select Media')}</DialogTitle>
                    <DialogDescription>
                        {multiple ? t('Select one or more files from your media library') : t('Select a file from your media library')}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col h-full">
                    <div className="border-b p-4">
                        <div className="flex items-center justify-between mb-4">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="flex items-center justify-between">
                                    <TabsList>
                                        <TabsTrigger value="media">{t('Media')}</TabsTrigger>
                                        <TabsTrigger value="upload">{t('Upload')}</TabsTrigger>
                                    </TabsList>
                                    
                                    <div className="flex space-x-2">
                                        <Button variant="outline" onClick={handleClose}>
                                            {t('Cancel')}
                                        </Button>
                                        <Button 
                                            onClick={handleSelect}
                                            disabled={selectedMedia.length === 0}
                                        >
                                            {t('Select')} {selectedMedia.length > 0 && `(${selectedMedia.length})`}
                                        </Button>
                                    </div>
                                </div>
                            </Tabs>
                        </div>
                        
                        {activeTab === 'media' && (
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    {folderPath.map((folder, index) => (
                                        <React.Fragment key={index}>
                                            <button
                                                onClick={() => navigateToPath(index)}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                {folder.name}
                                            </button>
                                            {index < folderPath.length - 1 && <span className="text-gray-400">/</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                                
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder={t('Search files...')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsContent value="media">
                                {loading ? (
                                    <div className="text-center py-8">{t('Loading...')}</div>
                                ) : (
                                    <>
                                        {/* Folders */}
                                        {folders && folders.length > 0 && (
                                            <div className="mb-6">
                                                <h3 className="text-sm font-medium text-gray-700 mb-3">{t('Folders')}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {folders.map((folder) => (
                                                        <div 
                                                            key={folder.id}
                                                            className="border rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
                                                            onDoubleClick={() => navigateToFolder(folder.id, folder.name)}
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <Folder className="w-8 h-8 text-blue-500" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">{folder.name}</p>
                                                                    <p className="text-xs text-gray-500">{t('Folder')}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Media Files */}
                                        {media.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-700 mb-3">{t('Files')}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {media.map((item) => (
                                                        <div 
                                                            key={item.id} 
                                                            className={`border rounded-lg p-4 cursor-pointer transition-colors relative ${
                                                                selectedMedia.find(m => m.id === item.id) 
                                                                    ? 'border-blue-500 bg-blue-50' 
                                                                    : 'hover:border-gray-400'
                                                            }`}
                                                            onClick={() => handleMediaClick(item)}
                                                        >
                                                            {selectedMedia.find(m => m.id === item.id) && (
                                                                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                                                    <Check className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex items-center space-x-3">
                                                                {item.mime_type.startsWith('image/') && item.url ? (
                                                                    <img 
                                                                        src={item.url} 
                                                                        alt={item.name}
                                                                        className="w-12 h-12 object-cover rounded"
                                                                    />
                                                                ) : (
                                                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                                                        📄
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                                                    <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                                <div className="text-sm text-gray-500">
                                                    {t('Page')} {currentPageNum} {t('of')} {totalPages}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(currentPageNum - 1)}
                                                        disabled={currentPageNum <= 1}
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(currentPageNum + 1)}
                                                        disabled={currentPageNum >= totalPages}
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {folders?.length === 0 && media.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                {t('No files or folders found')}
                                            </div>
                                        )}
                                    </>
                                )}
                            </TabsContent>
                            
                            <TabsContent value="upload">
                                <div className="py-8">
                                    {uploadMessage && (
                                        <div className={`mb-4 p-3 rounded-md text-sm ${
                                            uploadMessage.includes('Successfully') 
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : uploadMessage.includes('failed')
                                                ? 'bg-red-50 text-red-700 border border-red-200'
                                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                                        }`}>
                                            {uploadMessage}
                                        </div>
                                    )}
                                    <FileUpload 
                                        onUpload={handleUpload}
                                        collection="media"
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}