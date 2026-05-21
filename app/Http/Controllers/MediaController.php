<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\MediaFolder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Yajra\DataTables\Facades\DataTables;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('manage_media')) {
            abort(403, 'You do not have permission to access media library.');
        }
        
        if (($request->wantsJson() || $request->ajax()) && $request->has('draw')) {
            $query = Media::with(['user', 'folder'])->select('media_library.*');
            

            
            if ($request->folder_id) {
                $query->where('folder_id', $request->folder_id);
            } elseif ($request->folder_id === '0') {
                $query->whereNull('folder_id');
            }
            
            return DataTables::of($query)
                ->addColumn('formatted_data', function ($media) {
                    return $this->formatMediaResponse($media);
                })
                ->addColumn('created_at_formatted', function ($media) {
                    return $media->created_at->format('Y-m-d H:i:s');
                })
                ->filterColumn('name', function($query, $keyword) {
                    $query->where('name', 'like', "%{$keyword}%");
                })
                ->make(true);
        }
        
        $query = Media::with(['user', 'folder'])->latest();
        

        
        if ($request->folder_id) {
            $query->where('folder_id', $request->folder_id);
        } elseif ($request->folder_id === '0') {
            $query->whereNull('folder_id');
        }
        
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        
        $media = $query->paginate(12)->through(function ($item) {
            return $this->formatMediaResponse($item);
        });
        
        $folders = MediaFolder::where('parent_id', $request->folder_id ?: null)
            ->with('user')
            ->get()
            ->map(function ($folder) {
                return [
                    'id' => $folder->id,
                    'name' => $folder->name,
                    'type' => 'folder',
                    'created_at' => $folder->created_at,
                    'created_by' => $folder->user ? $folder->user->name : null,
                ];
            });
        
        return response()->json([
            'media' => $media,
            'folders' => $folders,
            'config' => $this->getMediaConfig()
        ]);
    }

    public function upload(Request $request)
    {
        if (!auth()->user()->can('upload_media')) {
            abort(403, 'You do not have permission to upload media.');
        }
        
        // Get system settings
        $allowedExtensions = json_decode(\App\Models\SystemSetting::get('storage_allowed_extensions', '[]'), true);
        $maxUploadSizeMB = (int) \App\Models\SystemSetting::get('max_upload_size', '10');
        $maxUploadSizeKB = $maxUploadSizeMB * 1024;
        
        // Default extensions if none configured
        if (empty($allowedExtensions)) {
            $allowedExtensions = ['jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'avi', 'mov', 'wmv', 'pdf', 'doc', 'docx', 'txt', 'csv'];
        }
        
        // Build MIME type mapping
        $mimeMapping = [
            'jpeg' => 'image/jpeg', 'jpg' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif',
            'webp' => 'image/webp', 'svg' => 'image/svg+xml', 'mp4' => 'video/mp4', 'avi' => 'video/avi',
            'mov' => 'video/mov', 'wmv' => 'video/wmv', 'pdf' => 'application/pdf',
            'doc' => 'application/msword', 'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt' => 'text/plain', 'csv' => 'text/csv'
        ];
        
        $allowedMimes = array_values(array_intersect_key($mimeMapping, array_flip($allowedExtensions)));
        $extensionsString = implode(',', $allowedExtensions);
        
        $request->validate([
            'files' => 'required|array',
            'files.*' => "file|max:{$maxUploadSizeKB}|mimes:{$extensionsString}",
        ]);
        
        // Check user quota (use system setting * 10 as user limit)
        $userQuotaLimit = $maxUploadSizeMB * 10 * 1024 * 1024; // Convert to bytes
        $userCurrentUsage = Media::where('created_by', auth()->id())->sum('size');
        $uploadSize = collect($request->file('files'))->sum('size');
        
        if (($userCurrentUsage + $uploadSize) > $userQuotaLimit) {
            return response()->json([
                'success' => false,
                'error' => "Upload would exceed your storage quota of {$maxUploadSizeMB}0MB"
            ], 422);
        }

        $uploadedMedia = [];
        $userKey = 'u' . substr(hash('md5', auth()->id() . config('app.key')), 0, 8);

        // Get storage driver from system settings
        $storageDriver = \App\Models\SystemSetting::get('storage_driver', 'local');
        $disk = $storageDriver === 'local' ? 'public' : $storageDriver;

        foreach ($request->file('files') as $file) {
            // Additional security check
            if (!in_array($file->getMimeType(), $allowedMimes)) {
                continue; // Skip disallowed files
            }
            
            $originalFileName = $file->getClientOriginalName();
            
            // Generate unique filename with original name
            $pathInfo = pathinfo($originalFileName);
            $baseName = $pathInfo['filename'];
            $extension = $pathInfo['extension'] ?? '';
            $directory = 'media/' . $userKey;
            
            $fileName = $originalFileName;
            $filePath = $directory . '/' . $fileName;
            $counter = 1;
            
            // Check for duplicates and add suffix if needed
            while (Storage::disk($disk)->exists($filePath)) {
                $fileName = $baseName . '_' . $counter . ($extension ? '.' . $extension : '');
                $filePath = $directory . '/' . $fileName;
                $counter++;
            }
            
            // Store file with the unique name and public visibility
            $path = $file->storeAs($directory, $fileName, [
                'disk' => $disk,
                'visibility' => 'public'
            ]);
            
            $media = Media::create([
                'name' => pathinfo($fileName, PATHINFO_FILENAME),
                'file_name' => $fileName,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'disk' => $disk,
                'path' => $path,
                'folder_id' => $request->folder_id,
                'created_by' => auth()->id(),
            ]);

            $uploadedMedia[] = $this->formatMediaResponse($media);
            
            // Audit log
            Log::info('Media uploaded', [
                'user_id' => auth()->id(),
                'media_id' => $media->id,
                'file_name' => $fileName,
                'size' => $file->getSize()
            ]);
        }

        return response()->json([
            'success' => true,
            'media' => $uploadedMedia
        ]);
    }

    public function delete(Media $media)
    {
        if (!auth()->user()->can('delete_media')) {
            abort(403, 'You do not have permission to delete media.');
        }
        
        // Audit log before deletion
        Log::info('Media deleted', [
            'user_id' => auth()->id(),
            'media_id' => $media->id,
            'file_name' => $media->file_name,
            'size' => $media->size
        ]);
        
        if ($media->path && Storage::disk($media->disk)->exists($media->path)) {
            Storage::disk($media->disk)->delete($media->path);
        }
        
        $media->delete();
        return response()->json(['success' => true]);
    }

    public function download(Media $media)
    {
        if (!auth()->user()->can('download_media')) {
            abort(403, 'You do not have permission to download media.');
        }
        
        if (!$media->path || !Storage::disk($media->disk)->exists($media->path)) {
            abort(404, 'File not found');
        }
        
        // Audit log
        Log::info('Media downloaded', [
            'user_id' => auth()->id(),
            'media_id' => $media->id,
            'file_name' => $media->file_name
        ]);
        
        return Storage::disk($media->disk)->download($media->path, $media->file_name);
    }

    public function createFolder(Request $request)
    {
        if (!auth()->user()->can('manage_folders')) {
            abort(403, 'You do not have permission to manage folders.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:media_folders,id',
        ]);

        $folder = MediaFolder::create([
            'name' => $request->name,
            'parent_id' => $request->parent_id,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'folder' => [
                'id' => $folder->id,
                'name' => $folder->name,
                'type' => 'folder',
                'created_at' => $folder->created_at,
                'created_by' => $folder->user->name,
            ]
        ]);
    }

    public function deleteFolder(MediaFolder $folder)
    {
        if (!auth()->user()->can('manage_folders')) {
            abort(403, 'You do not have permission to manage folders.');
        }
        
        // Check if folder has files
        if ($folder->media()->count() > 0) {
            return response()->json([
                'success' => false,
                'error' => 'Cannot delete folder that contains files. Please move or delete files first.'
            ], 422);
        }
        
        // Check if folder has subfolders
        if ($folder->children()->count() > 0) {
            return response()->json([
                'success' => false,
                'error' => 'Cannot delete folder that contains subfolders. Please delete subfolders first.'
            ], 422);
        }
        
        $folder->delete();
        
        return response()->json(['success' => true]);
    }

    public function updateFolder(MediaFolder $folder, Request $request)
    {
        if (!auth()->user()->can('manage_folders')) {
            abort(403, 'You do not have permission to manage folders.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $folder->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'success' => true,
            'folder' => [
                'id' => $folder->id,
                'name' => $folder->name,
                'type' => 'folder',
                'created_at' => $folder->created_at,
                'created_by' => $folder->user->name,
            ]
        ]);
    }



    public function getUrl(Media $media)
    {
        return response()->json([
            'url' => $media->path ? Storage::disk($media->disk)->url($media->path) : null
        ]);
    }
    
    public function getUrls(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:media_library,id'
        ]);
        
        $media = Media::whereIn('id', $request->ids)->get();
        
        $urls = $media->mapWithKeys(function ($item) {
            return [
                $item->id => $item->path ? Storage::disk($item->disk)->url($item->path) : null
            ];
        });
        
        return response()->json($urls);
    }

    private function getMediaConfig()
    {
        $allowedExtensions = json_decode(\App\Models\SystemSetting::get('storage_allowed_extensions', '[]'), true);
        $maxUploadSizeMB = (int) \App\Models\SystemSetting::get('max_upload_size', '10');
        $storageDriver = \App\Models\SystemSetting::get('storage_driver', 'local');
        
        // Default extensions if none configured
        if (empty($allowedExtensions)) {
            $allowedExtensions = ['jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'avi', 'mov', 'wmv', 'pdf', 'doc', 'docx', 'txt', 'csv'];
        }
        
        return [
            'allowed_extensions' => $allowedExtensions,
            'max_upload_size_mb' => $maxUploadSizeMB,
            'user_quota_mb' => $maxUploadSizeMB * 10,
            'storage_driver' => $storageDriver
        ];
    }

    private function formatMediaResponse(Media $media)
    {
        $url = null;
        if ($media->path) {
            try {
                $url = Storage::disk($media->disk)->url($media->path);
            } catch (\Exception $e) {
                // Fallback for cloud storage or missing files
                $url = null;
            }
        }

        return [
            'id' => $media->id,
            'name' => $media->name,
            'file_name' => $media->file_name,
            'mime_type' => $media->mime_type,
            'size' => $media->size,
            'url' => $url,
            'folder_id' => $media->folder_id,
            'folder_name' => $media->folder ? $media->folder->name : null,
            'created_at' => $media->created_at,
            'created_by' => $media->user ? $media->user->name : null,
        ];
    }
}