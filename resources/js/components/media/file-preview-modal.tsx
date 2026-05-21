import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/overlay/dialog';
import { Button } from '@/components/ui/form/button';
import { Download } from 'lucide-react';
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

interface FilePreviewModalProps {
    media: MediaItem | null;
    open: boolean;
    onClose: () => void;
    onDownload: (id: number) => void;
}

export function FilePreviewModal({ media, open, onClose, onDownload }: FilePreviewModalProps) {
    const { t } = useTranslations();
    if (!media) return null;

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const renderPreview = () => {
        if (media.mime_type.startsWith('image/')) {
            return (
                <img 
                    src={media.url} 
                    alt={media.name}
                    className="max-w-full max-h-96 object-contain mx-auto"
                />
            );
        }
        
        if (media.mime_type.startsWith('video/')) {
            return (
                <video 
                    controls 
                    className="max-w-full max-h-96 mx-auto"
                    src={media.url}
                >
                    {t('Your browser does not support the video tag.')}
                </video>
            );
        }
        
        if (media.mime_type === 'application/pdf') {
            return (
                <iframe 
                    src={media.url}
                    className="w-full h-96 border"
                    title={media.name}
                />
            );
        }
        
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📄</span>
                </div>
                <p className="text-gray-600">{t('Preview not available for this file type')}</p>
                <p className="text-sm text-gray-500 mt-1">{media.mime_type}</p>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="truncate pr-8">{media.name}</DialogTitle>
                    <DialogDescription>
                        {t('Preview and download file')}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDownload(media.id)}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {t('Download')}
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {renderPreview()}
                    </div>
                    
                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">{t('File Information')}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-500">{t('File Name:')}</span>
                                <p className="truncate" title={media.file_name}>{media.file_name}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">{t('Size:')}</span>
                                <p>{formatFileSize(media.size)}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">{t('Type:')}</span>
                                <p>{media.mime_type}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">{t('Collection:')}</span>
                                <p className="capitalize">{media.collection_name}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">{t('Date:')}</span>
                                <p>{new Date(media.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">{t('Time:')}</span>
                                <p>{new Date(media.created_at).toLocaleTimeString()}</p>
                            </div>
                            {media.created_by && (
                                <div>
                                    <span className="font-medium text-gray-500">{t('Uploaded by:')}</span>
                                    <p>{media.created_by}</p>
                                </div>
                            )}
                            <div>
                                <span className="font-medium text-gray-500">{t('URL:')}</span>
                                <p className="truncate text-blue-600 cursor-pointer" 
                                   onClick={() => navigator.clipboard.writeText(media.url)}
                                   title={t('Click to copy')}>
                                    {media.url}
                                </p>
                            </div>
                        </div>
                        
                        {media.mime_type.startsWith('image/') && (
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="font-medium mb-3">{t('Image Details')}</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-500">{t('Format:')}</span>
                                        <p className="uppercase">{media.mime_type.split('/')[1]}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-500">{t('Estimated Dimensions:')}</span>
                                        <p className="text-gray-400">{t('Available after upload processing')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}