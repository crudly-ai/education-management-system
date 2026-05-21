<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Track authentication events
        Event::listen(Registered::class, function ($event) {
            activity()
                ->causedBy($event->user)
                ->withProperties(['ip_address' => request()->ip()])
                ->log('registered');
        });

        Event::listen(Login::class, function ($event) {
            activity()
                ->causedBy($event->user)
                ->withProperties(['ip_address' => request()->ip()])
                ->log('logged_in');
        });

        Event::listen(Logout::class, function ($event) {
            activity()
                ->causedBy($event->user)
                ->withProperties(['ip_address' => request()->ip()])
                ->log('logged_out');
        });

        Event::listen(Verified::class, function ($event) {
            activity()
                ->causedBy($event->user)
                ->withProperties(['ip_address' => request()->ip()])
                ->log('email_verified');
        });
    }
}
