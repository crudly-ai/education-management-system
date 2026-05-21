import React from 'react';
import { Button } from '@/components/ui/form/button';
import { Download, Trash2, Eye, File, Image, Video, FileText, Square, CheckSquare } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';

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

interface MediaGalleryProps {
    media: MediaItem[];
    onDelete: (id: number) => void;
    onDownload: (id: number) => void;
    onPreview?: (item: MediaItem) => void;
    viewMode?: 'grid';
    onBulkDelete?: (ids: number[]) => void;
}

export function MediaGallery({ media, onDelete, onDownload, onPreview, onBulkDelete }: MediaGalleryProps) {
    const { t } = useTranslations();
    const [selectedItems, setSelectedItems] = React.useState<number[]>([]);
    const [bulkMode, setBulkMode] = React.useState(false);

    const toggleBulkMode = () => {
        setBulkMode(!bulkMode);
        setSelectedItems([]);
    };

    const toggleItemSelection = (id: number) => {
        setSelectedItems(prev => 
            prev.includes(id) 
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedItems(media.map(item => item.id));
    };

    const deselectAll = () => {
        setSelectedItems([]);
    };

    const handleBulkDelete = () => {
        if (onBulkDelete && selectedItems.length > 0) {
            onBulkDelete(selectedItems);
            setSelectedItems([]);
        }
    };
    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="w-6 h-6" />;
        if (type.startsWith('video/')) return <Video className="w-6 h-6" />;
        if (type === 'application/pdf') return <FileText className="w-6 h-6" />;
        return <File className="w-6 h-6" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (media.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                {t('No media files found')}
            </div>
        );
    }

    const BulkActions = () => (
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
            <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={toggleBulkMode}>
                    {bulkMode ? 'Cancel' : 'Select'}
                </Button>
                {bulkMode && (
                    <>
                        <Button variant="outline" size="sm" onClick={selectAll}>
                            Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={deselectAll}>
                            Deselect All
                        </Button>
                        <span className="text-sm text-gray-600">
                            {selectedItems.length} selected
                        </span>
                    </>
                )}
            </div>
            {bulkMode && selectedItems.length > 0 && (
                <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleBulkDelete}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected ({selectedItems.length})
                </Button>
            )}
        </div>
    );


    
    return (
        <div>
            <BulkActions />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {media.map((item) => (
                <div key={item.id} className={`border rounded-lg p-4 space-y-3 relative ${
                    selectedItems.includes(item.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}>
                    {bulkMode && (
                        <button
                            onClick={() => toggleItemSelection(item.id)}
                            className="absolute top-2 right-2 z-10"
                        >
                            {selectedItems.includes(item.id) ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                            )}
                        </button>
                    )}
                    <div className="flex items-center space-x-3">
                        {item.mime_type.startsWith('image/') && item.url ? (
                            <img 
                                src={item.url} 
                                alt={item.name}
                                loading="lazy"
                                className="w-12 h-12 object-cover rounded"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                {getFileIcon(item.mime_type)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                            {item.created_by && <p className="text-xs text-gray-400">by {item.created_by}</p>}
                        </div>
                    </div>

                    {!bulkMode && (
                        <div className="flex space-x-2">
                            {onPreview && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPreview(item)}
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDownload(item.id)}
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(item.id)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            ))}
            </div>
        </div>
    );
}