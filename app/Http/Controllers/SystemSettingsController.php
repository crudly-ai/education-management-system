<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    public function edit(): Response
    {
        if (!auth()->user()->can('manage_settings')) {
            abort(403, 'You do not have permission to manage settings.');
        }

        $fileTypes = config('files_types', []);
        $fileTypeOptions = collect($fileTypes)->map(function($value, $key) {
            return ['value' => $key, 'label' => strtoupper($key)];
        })->values()->toArray();

        return Inertia::render('system-settings', [
            'fileTypes' => $fileTypeOptions,
            'settings' => [
                'name' => SystemSetting::get('name', config('app.name')),
                'date_format' => SystemSetting::get('date_format', 'Y-m-d'),
                'time_format' => SystemSetting::get('time_format', '12'),
                'currency_symbol' => SystemSetting::get('currency_symbol', '$'),
                'currency_position' => SystemSetting::get('currency_position', 'before'),
                'decimal_separator' => SystemSetting::get('decimal_separator', '.'),
                'thousand_separator' => SystemSetting::get('thousand_separator', ','),
                'mail_driver' => SystemSetting::get('mail_driver', 'smtp'),
                'mail_host' => SystemSetting::get('mail_host', ''),
                'mail_port' => SystemSetting::get('mail_port', '587'),
                'mail_username' => SystemSetting::get('mail_username', ''),
                'mail_password' => SystemSetting::get('mail_password', ''),
                'mail_encryption' => SystemSetting::get('mail_encryption', 'tls'),
                'mail_from_address' => SystemSetting::get('mail_from_address', ''),
                'mail_from_name' => SystemSetting::get('mail_from_name', ''),
                'storage_driver' => SystemSetting::get('storage_driver', 'local'),
                'storage_allowed_extensions' => json_decode(SystemSetting::get('storage_allowed_extensions', '[]'), true),
                'max_upload_size' => SystemSetting::get('max_upload_size', '10'),
                'aws_access_key' => SystemSetting::get('aws_access_key', ''),
                'aws_secret_key' => SystemSetting::get('aws_secret_key', ''),
                'aws_region' => SystemSetting::get('aws_region', ''),
                'aws_bucket' => SystemSetting::get('aws_bucket', ''),
                'aws_url' => SystemSetting::get('aws_url', ''),
                'aws_endpoint' => SystemSetting::get('aws_endpoint', ''),
                'wasabi_access_key' => SystemSetting::get('wasabi_access_key', ''),
                'wasabi_secret_key' => SystemSetting::get('wasabi_secret_key', ''),
                'wasabi_region' => SystemSetting::get('wasabi_region', ''),
                'wasabi_bucket' => SystemSetting::get('wasabi_bucket', ''),
                'wasabi_url' => SystemSetting::get('wasabi_url', ''),
                'wasabi_root' => SystemSetting::get('wasabi_root', ''),
                'theme_color' => SystemSetting::get('theme_color', 'black'),
                'theme_mode' => SystemSetting::get('theme_mode', 'light'),
                'layout_direction' => SystemSetting::get('layout_direction', 'ltr'),
                'sidebar_style' => SystemSetting::get('sidebar_style', 'plain'),
                'sidebar_variant' => SystemSetting::get('sidebar_variant', 'inset'),
                'footer_text' => SystemSetting::get('footer_text', '© 2024 Crudly. All rights reserved.'),
                'dark_logo' => SystemSetting::get('dark_logo', ''),
                'light_logo' => SystemSetting::get('light_logo', ''),
                'favicon' => SystemSetting::get('favicon', ''),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        if (!auth()->user()->can('manage_settings')) {
            abort(403, 'You do not have permission to manage settings.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date_format' => 'required|string|in:Y-m-d,m/d/Y,d/m/Y,d-m-Y',
            'time_format' => 'required|string|in:12,24',
            'currency_symbol' => 'required|string|in:$,€,£,¥,₹,₩',
            'currency_position' => 'required|string|in:before,after',
            'decimal_separator' => 'required|string|in:.,\,',
            'thousand_separator' => 'required|string',
            'mail_driver' => 'nullable|string|max:255',
            'mail_host' => 'nullable|string|max:255',
            'mail_port' => 'nullable|integer|min:1|max:65535',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string|max:255',
            'mail_encryption' => 'nullable|string|in:tls,ssl,none',
            'mail_from_address' => 'nullable|email|max:255',
            'mail_from_name' => 'nullable|string|max:255',
            'storage_driver' => 'required|string|in:local,s3,wasabi',
            'storage_allowed_extensions' => 'nullable|array',
            'max_upload_size' => 'required|numeric|min:1|max:1024',
            'aws_access_key' => 'nullable|string|max:255',
            'aws_secret_key' => 'nullable|string|max:255',
            'aws_region' => 'nullable|string|max:255',
            'aws_bucket' => 'nullable|string|max:255',
            'aws_url' => 'nullable|url|max:255',
            'aws_endpoint' => 'nullable|url|max:255',
            'wasabi_access_key' => 'nullable|string|max:255',
            'wasabi_secret_key' => 'nullable|string|max:255',
            'wasabi_region' => 'nullable|string|max:255',
            'wasabi_bucket' => 'nullable|string|max:255',
            'wasabi_url' => 'nullable|url|max:255',
            'wasabi_root' => 'nullable|string|max:255',
            'theme_color' => 'nullable|string|in:blue,green,purple,orange,red,black,custom',
            'theme_mode' => 'nullable|string|in:light,dark,system',
            'layout_direction' => 'nullable|string|in:ltr,rtl',
            'sidebar_style' => 'nullable|string|in:plain,colored,gradient',
            'sidebar_variant' => 'nullable|string|in:inset,floating,minimal',
            'footer_text' => 'nullable|string|max:255',
            'dark_logo' => 'nullable|string',
            'light_logo' => 'nullable|string',
            'favicon' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            if ($key === 'storage_allowed_extensions') {
                SystemSetting::set($key, json_encode($value ?? []));
            } else {
                SystemSetting::set($key, $value);
            }
        }

        return back();
    }
}
