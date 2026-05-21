<?php

namespace Database\Seeders;

use App\Models\Media;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class DefaultMediaSeeder extends Seeder
{
    public function run(): void
    {
        // Get first admin user for created_by
        $adminUser = User::first();
        if (!$adminUser) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        $logoFiles = [
            [
                'source' => public_path('logo.png'),
                'name' => 'Default Logo',
                'filename' => 'logo.png',
                'storage_path' => 'media/logos/logo.png'
            ],
            [
                'source' => public_path('logo-icon.png'),
                'name' => 'Default Logo Icon',
                'filename' => 'logo-icon.png',
                'storage_path' => 'media/logos/logo-icon.png'
            ]
        ];

        foreach ($logoFiles as $logoFile) {
            // Check if source file exists
            if (!File::exists($logoFile['source'])) {
                $this->command->warn("Source file not found: {$logoFile['source']}");
                continue;
            }

            // Check if media record already exists
            $existingMedia = Media::where('file_name', $logoFile['filename'])->first();
            if ($existingMedia) {
                $this->command->info("Media already exists: {$logoFile['name']}");
                continue;
            }

            // Copy file to storage
            $fileContents = File::get($logoFile['source']);
            Storage::disk('public')->put($logoFile['storage_path'], $fileContents);

            // Get file info
            $fileSize = File::size($logoFile['source']);
            $mimeType = File::mimeType($logoFile['source']);

            // Create media record
            Media::create([
                'name' => $logoFile['name'],
                'file_name' => $logoFile['filename'],
                'mime_type' => $mimeType,
                'size' => $fileSize,
                'disk' => 'public',
                'path' => $logoFile['storage_path'],
                'folder_id' => null,
                'created_by' => $adminUser->id,
            ]);

            $this->command->info("Created media: {$logoFile['name']}");
        }
    }
}