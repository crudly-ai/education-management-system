<?php

namespace App\Providers;

use App\Models\SystemSetting;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;

class MailConfigServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        try {
            // Only apply if database is available and system_settings table exists
            if ($this->databaseExists()) {
                $this->configureMailFromSystemSettings();
            }
        } catch (\Exception $e) {
            // Silently fail during migrations or when database is not ready
        }
    }

    private function databaseExists(): bool
    {
        try {
            \DB::connection()->getPdo();
            return \Schema::hasTable('system_settings');
        } catch (\Exception $e) {
            return false;
        }
    }

    private function configureMailFromSystemSettings(): void
    {
        $mailDriver = SystemSetting::get('mail_driver');
        $mailHost = SystemSetting::get('mail_host');
        $mailUsername = SystemSetting::get('mail_username');
        
        // Only configure if mail settings exist
        if ($mailDriver && $mailHost && $mailUsername) {
            Config::set('mail.default', $mailDriver);
            Config::set('mail.mailers.smtp.host', $mailHost);
            Config::set('mail.mailers.smtp.port', SystemSetting::get('mail_port', 587));
            Config::set('mail.mailers.smtp.username', $mailUsername);
            Config::set('mail.mailers.smtp.password', SystemSetting::get('mail_password'));
            Config::set('mail.mailers.smtp.encryption', SystemSetting::get('mail_encryption', 'tls'));
            Config::set('mail.from.address', SystemSetting::get('mail_from_address', $mailUsername));
            Config::set('mail.from.name', SystemSetting::get('mail_from_name', config('app.name')));
        }
    }
}