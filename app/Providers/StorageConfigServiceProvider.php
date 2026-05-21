<?php

namespace App\Providers;

use App\Models\SystemSetting;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Storage;

class StorageConfigServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            return;
        }

        try {
            $this->configureStorageDrivers();
        } catch (\Exception $e) {
            // Fail silently if database is not available (during migrations)
        }
    }

    private function configureStorageDrivers(): void
    {
        $storageDriver = SystemSetting::get('storage_driver', 'local');

        if ($storageDriver === 's3') {
            config([
                'filesystems.disks.s3.key' => SystemSetting::get('aws_access_key'),
                'filesystems.disks.s3.secret' => SystemSetting::get('aws_secret_key'),
                'filesystems.disks.s3.region' => SystemSetting::get('aws_region'),
                'filesystems.disks.s3.bucket' => SystemSetting::get('aws_bucket'),
                'filesystems.disks.s3.url' => SystemSetting::get('aws_url'),
                'filesystems.disks.s3.endpoint' => SystemSetting::get('aws_endpoint'),
            ]);
        } elseif ($storageDriver === 'wasabi') {
            $wasabiRegion = SystemSetting::get('wasabi_region');
            $wasabiBucket = SystemSetting::get('wasabi_bucket');
            
            config([
                'filesystems.disks.wasabi' => [
                    'driver' => 's3',
                    'key' => SystemSetting::get('wasabi_access_key'),
                    'secret' => SystemSetting::get('wasabi_secret_key'),
                    'region' => $wasabiRegion,
                    'bucket' => $wasabiBucket,
                    'url' => "https://{$wasabiBucket}.s3.{$wasabiRegion}.wasabisys.com",
                    'endpoint' => "https://s3.{$wasabiRegion}.wasabisys.com",
                    'use_path_style_endpoint' => false,
                    'visibility' => 'public',
                    'throw' => false,
                ]
            ]);
        }
    }
}