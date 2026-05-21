import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

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

interface UseMediaProps {
    collection?: string;
    search?: string;
    folderId?: number | null;
    page?: number;
    enabled?: boolean;
}

export function useMedia({ collection, search, folderId, page = 1, enabled = true }: UseMediaProps = {}) {
    const [media, setMedia] = useState<any>(null);
    const [folders, setFolders] = useState<any[]>([]);
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (collection) params.append('collection', collection);
            if (search) params.append('search', search);
            if (folderId !== undefined) params.append('folder_id', folderId?.toString() || '0');
            params.append('page', page.toString());

            const response = await fetch(`/media?${params}`);
            const data = await response.json();
            setMedia(data.media);
            setFolders(data.folders || []);
            setConfig(data.config || null);
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setLoading(false);
        }
    };

    const uploadFiles = async (files: File[], uploadCollection?: string, uploadFolderId?: number | null) => {
        setLoading(true);
        try {
            // Get fresh CSRF token from server
            const csrfResponse = await fetch('/csrf-token');
            const csrfData = await csrfResponse.json();
            const freshToken = csrfData.csrf_token;
            
            const formData = new FormData();
            files.forEach(file => formData.append('files[]', file));
            if (uploadCollection) formData.append('collection', uploadCollection);
            if (uploadFolderId !== undefined) formData.append('folder_id', uploadFolderId?.toString() || '');

            const response = await fetch('/media/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': freshToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Upload error:', errorData);
                throw new Error(errorData.error || `Upload failed: ${response.status}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Upload failed');
            }
            
            await fetchMedia();
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteMedia = async (mediaId: number) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            await fetch(`/media/${mediaId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            await fetchMedia();
        } catch (error) {
            console.error('Failed to delete media:', error);
        }
    };

    const bulkDeleteMedia = async (mediaIds: number[]) => {
        try {
            await Promise.all(
                mediaIds.map(id => {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                    return fetch(`/media/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRF-TOKEN': csrfToken,
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    });
                })
            
            );
            await fetchMedia();
        } catch (error) {
            console.error('Failed to bulk delete media:', error);
        }
    };

    const downloadMedia = (mediaId: number) => {
        window.open(`/media/${mediaId}/download`, '_blank');
    };

    const createFolder = async (name: string, parentId?: number | null) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch('/media/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ name, parent_id: parentId }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to create folder');
            }
            
            await fetchMedia();
        } catch (error) {
            console.error('Failed to create folder:', error);
            throw error;
        }
    };

    const deleteFolder = async (folderId: number) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch(`/media/folders/${folderId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete folder');
            }
            
            await fetchMedia();
        } catch (error) {
            console.error('Failed to delete folder:', error);
            throw error;
        }
    };

    const updateFolder = async (folderId: number, name: string) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch(`/media/folders/${folderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ name }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update folder');
            }
            
            await fetchMedia();
        } catch (error) {
            console.error('Failed to update folder:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (enabled) {
            fetchMedia();
        }
    }, [collection, search, folderId, page, enabled]);

    return {
        media,
        folders,
        config,
        loading,
        uploadFiles,
        deleteMedia,
        bulkDeleteMedia,
        downloadMedia,
        createFolder,
        updateFolder,
        deleteFolder,
        refetch: fetchMedia,
    };
}