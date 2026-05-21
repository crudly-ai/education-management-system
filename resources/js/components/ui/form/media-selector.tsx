import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/form/button';
import { Label } from '@/components/ui/form/label';
import { MediaPicker } from './media-picker';
import { ImageIcon, X, FileIcon } from 'lucide-react';
import { useFormatters } from '@/utils/formatters';
import { useTranslations } from '@/hooks/use-translations';

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

interface MediaSelectorProps {
    selectedPaths?: string[];
    multiple?: boolean;
    label?: string;
    title?: string;
    onChange: (selectedPaths: string[]) => void;
}

export function MediaSelector({ selectedPaths = [], multiple = false, label = "Media", title, onChange }: MediaSelectorProps) {
    const { t } = useTranslations();
    const [showPicker, setShowPicker] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
    const { getMediaUrl } = useFormatters();

    const handleSelect = (media: MediaItem[]) => {
        setSelectedMedia(media);
        const paths = media.map(item => item.url.replace(/^.*\/storage\//, ''));
        onChange(paths);
        setShowPicker(false);
    };

    const removePath = (index: number) => {
        const newPaths = selectedPaths.filter((_, i) => i !== index);
        onChange(newPaths);
    };

    const removeAll = () => {
        onChange([]);
    };

    return (
        <div>
            <div className="mt-2">
                {selectedPaths.length > 0 ? (
                    <div className="space-y-2">
                        {selectedPaths.map((path, index) => {
                            const isImage = path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                            return (
                                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                                    {isImage ? (
                                        <img 
                                            src={getMediaUrl(path)} 
                                            alt={path.split('/').pop()}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                    ) : (
                                        <FileIcon className="w-8 h-8 text-gray-400" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{path.split('/').pop()}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removePath(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        })}
                        
                        <div className="flex space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowPicker(true)}
                                className="flex-1"
                            >
                                <ImageIcon className="w-4 h-4 mr-2" />
                                {multiple ? t('Add More') : t('Change')}
                            </Button>
                            {multiple && selectedPaths.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={removeAll}
                                >
                                    {t('Remove All')}
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPicker(true)}
                        className="w-full"
                    >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {t('Select')} {label}
                    </Button>
                )}
            </div>

            <MediaPicker
                open={showPicker}
                onClose={() => setShowPicker(false)}
                onSelect={handleSelect}
                multiple={multiple}
                selectedIds={selectedMedia.map(item => item.id)}
                title={title}
            />
        </div>
    );
}