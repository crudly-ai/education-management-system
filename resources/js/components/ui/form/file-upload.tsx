import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, Video, Music } from 'lucide-react';
import { Button } from './button';
import { useTranslations } from '@/hooks/use-translations';

interface FileUploadProps {
    onUpload: (files: File[]) => void;
    collection?: string;
    multiple?: boolean;
    accept?: string;
    maxSize?: number;
    allowedExtensions?: string[];
    className?: string;
}

export function FileUpload({
    onUpload,
    collection = 'default',
    multiple = true,
    accept,
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedExtensions,
    className = ''
}: FileUploadProps) {
    const { t } = useTranslations();
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
        setUploadedFiles(prev => [...prev, ...acceptedFiles]);
        
        // Handle rejected files
        const rejectedMessages = fileRejections.map(rejection => {
            const { file, errors } = rejection;
            const errorMessages = errors.map((error: any) => {
                if (error.code === 'file-too-large') {
                    return `${file.name}: ${t('File too large (max')} ${formatFileSize(maxSize)})`;
                }
                if (error.code === 'file-invalid-type') {
                    return `${file.name}: ${t('Invalid file type')}`;
                }
                return `${file.name}: ${error.message}`;
            });
            return errorMessages.join(', ');
        });
        
        setRejectedFiles(rejectedMessages);
        
        // Clear rejected messages after 5 seconds
        if (rejectedMessages.length > 0) {
            setTimeout(() => setRejectedFiles([]), 5000);
        }
    }, [maxSize]);

    // Build accept object from allowed extensions using MIME types
    const mimeMapping: Record<string, string> = {
        'jpeg': 'image/jpeg', 'jpg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif',
        'webp': 'image/webp', 'svg': 'image/svg+xml', 'mp4': 'video/mp4', 'avi': 'video/x-msvideo',
        'mov': 'video/quicktime', 'wmv': 'video/x-ms-wmv', 'pdf': 'application/pdf',
        'doc': 'application/msword', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt': 'text/plain', 'csv': 'text/csv'
    };
    
    const acceptObject = accept ? { [accept]: [] } : 
        allowedExtensions ? allowedExtensions.reduce((acc, ext) => {
            const mimeType = mimeMapping[ext.toLowerCase()];
            if (mimeType) {
                acc[mimeType] = [];
            }
            return acc;
        }, {} as Record<string, string[]>) : undefined;

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple,
        accept: acceptObject,
        maxSize
    });

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
        if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
        if (file.type.startsWith('audio/')) return <Music className="w-4 h-4" />;
        return <File className="w-4 h-4" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                {isDragActive ? (
                    <p className="text-primary">{t('Drop the files here...')}</p>
                ) : (
                    <div>
                        <p className="text-gray-600 mb-4">
                            {t('Drag & drop files here, or click to select files')}
                        </p>
                        <Button type="button" variant="outline">
                            {t('Choose Files')}
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                            {t('Maximum file size')}: {formatFileSize(maxSize)}
                            {allowedExtensions && (
                                <><br />{t('Allowed')}: {allowedExtensions.join(', ')}</>
                            )}
                        </p>
                    </div>
                )}
            </div>

            {rejectedFiles.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="font-medium text-sm text-red-800 mb-2">{t('Files Rejected')}:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                        {rejectedFiles.map((message, index) => (
                            <li key={index}>• {message}</li>
                        ))}
                    </ul>
                </div>
            )}

            {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{t('Selected Files')}:</h4>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setUploadedFiles([])}
                            >
                                {t('Clear All')}
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    onUpload(uploadedFiles);
                                    setUploadedFiles([]);
                                }}
                            >
                                {t('Upload Files')}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                            >
                                <div className="flex items-center space-x-2">
                                    {getFileIcon(file)}
                                    <span className="text-sm font-medium">{file.name}</span>
                                    <span className="text-xs text-gray-500">
                                        ({formatFileSize(file.size)})
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="h-6 w-6 p-0"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}