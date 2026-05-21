<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $locale = app()->getLocale();
        $jsonFile = lang_path("{$locale}.json");
        
        $translations = [];
        if (file_exists($jsonFile)) {
            $translations = json_decode(file_get_contents($jsonFile), true);
        }

        return array_merge(parent::share($request), [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name') : [],
            ],
            'systemSettings' => [
                'name' => \App\Models\SystemSetting::get('name', config('app.name')),
                'date_format' => \App\Models\SystemSetting::get('date_format', 'Y-m-d'),
                'time_format' => \App\Models\SystemSetting::get('time_format', '12'),
                'currency_symbol' => \App\Models\SystemSetting::get('currency_symbol', '$'),
                'currency_position' => \App\Models\SystemSetting::get('currency_position', 'before'),
                'decimal_separator' => \App\Models\SystemSetting::get('decimal_separator', '.'),
                'thousand_separator' => \App\Models\SystemSetting::get('thousand_separator', ','),
                'theme_color' => \App\Models\SystemSetting::get('theme_color', 'black'),
                'custom_theme_color' => \App\Models\SystemSetting::get('custom_theme_color', '#3b82f6'),
                'theme_mode' => \App\Models\SystemSetting::get('theme_mode', 'light'),
                'layout_direction' => \App\Models\SystemSetting::get('layout_direction', 'ltr'),
                'sidebar_style' => \App\Models\SystemSetting::get('sidebar_style', 'plain'),
                'sidebar_variant' => \App\Models\SystemSetting::get('sidebar_variant', 'inset'),
                'footer_text' => \App\Models\SystemSetting::get('footer_text', '© 2024 Crudly. All rights reserved.'),
                'dark_logo' => \App\Models\SystemSetting::get('dark_logo', ''),
                'light_logo' => \App\Models\SystemSetting::get('light_logo', ''),
                'favicon' => \App\Models\SystemSetting::get('favicon', ''),
            ],
            'locale' => $locale,
            'translations' => $translations,
            'storageUrl' => \Storage::url(''),
            'impersonating' => session()->has('impersonate') || session()->has('laravel_impersonate') || auth()->user()?->isImpersonated() ?? false,
        ]);
    }
}
