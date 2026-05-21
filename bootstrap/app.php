<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('web')
                ->group(base_path('routes/auth.php'));
            Route::middleware('web')
                ->group(base_path('routes/settings.php'));
            Route::middleware('web')
                ->group(base_path('routes/media.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\SetLocale::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        
        $middleware->alias([
            'permission' => \App\Http\Middleware\CheckPermission::class,
        ]);
        
        // Exclude workspace POST route from CSRF protection for landing page
        $middleware->validateCsrfTokens(except: [
            'workspace',
            'api/store-landing-prompt'
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            return \Inertia\Inertia::render('ErrorPage', [
                'type' => 'not-found'
            ])->toResponse($request)->setStatusCode(404);
        });
        
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException $e, $request) {
            return \Inertia\Inertia::render('ErrorPage', [
                'type' => 'unauthorized'
            ])->toResponse($request)->setStatusCode(401);
        });
        
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e, $request) {
            return \Inertia\Inertia::render('ErrorPage', [
                'type' => 'forbidden'
            ])->toResponse($request)->setStatusCode(403);
        });
        
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($e->getStatusCode() === 403) {
                return \Inertia\Inertia::render('ErrorPage', [
                    'type' => 'forbidden'
                ])->toResponse($request)->setStatusCode(403);
            }
            if ($e->getStatusCode() === 500) {
                return \Inertia\Inertia::render('ErrorPage', [
                    'type' => 'server-error'
                ])->toResponse($request)->setStatusCode(500);
            }
            if ($e->getStatusCode() === 503) {
                return \Inertia\Inertia::render('ErrorPage', [
                    'type' => 'maintenance'
                ])->toResponse($request)->setStatusCode(503);
            }
        });
    })->create();
