<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use App\Models\Media;
use Illuminate\Database\Seeder;

class SystemSettingsTableSeeder extends Seeder
{
    public function run(): void
    {
        // Get default media files
        $defaultLogo = Media::where('file_name', 'logo.png')->first();
        $defaultIcon = Media::where('file_name', 'logo-icon.png')->first();
        
        $settings = [
            'name' => config('app.name'),
            'date_format' => 'Y-m-d',
            'time_format' => '12',
            'currency_symbol' => '$',
            'currency_position' => 'before',
            'decimal_separator' => '.',
            'thousand_separator' => ',',
            'mail_driver' => 'smtp',
            'mail_host' => '',
            'mail_port' => '587',
            'mail_username' => '',
            'mail_password' => '',
            'mail_encryption' => 'tls',
            'mail_from_address' => '',
            'mail_from_name' => '',
            'storage_driver' => 'local',
            'storage_allowed_extensions' => '[]',
            'max_upload_size' => '10',
            'aws_access_key' => '',
            'aws_secret_key' => '',
            'aws_region' => '',
            'aws_bucket' => '',
            'aws_url' => '',
            'aws_endpoint' => '',
            'wasabi_access_key' => '',
            'wasabi_secret_key' => '',
            'wasabi_region' => '',
            'wasabi_bucket' => '',
            'wasabi_url' => '',
            'wasabi_root' => '',
            'theme_color' => 'black',
            'theme_mode' => 'light',
            'layout_direction' => 'ltr',
            'sidebar_style' => 'plain',
            'sidebar_variant' => 'inset',
            'footer_text' => '© 2024 Crudly. All rights reserved.',
            'dark_logo' => $defaultLogo ? $defaultLogo->path : '',
            'light_logo' => $defaultLogo ? $defaultLogo->path : '',
            'favicon' => $defaultIcon ? $defaultIcon->path : '',
        ];

        foreach ($settings as $key => $value) {
            SystemSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}