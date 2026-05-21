<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
});

Route::post('/set-locale', function (\Illuminate\Http\Request $request) {
    $locale = $request->validate(['locale' => 'required|string|in:en,es,fr,ar,da,de,he,it,ja,nl,pl,pt,pt-br,ru,tr,zh'])['locale'];
    cookie()->queue('locale', $locale, 60 * 24 * 30); // 30 days
    return back();
})->name('set-locale');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        if (auth()->user()->hasRole('Admin')) {
            return Inertia::render('dashboard');
        }
        return redirect('/workspace');
    })->name('dashboard');

    Route::get('media-library', function () {
        return Inertia::render('media/index');
    })->name('media.index');

    Route::get('form-showcase', function () {
        return Inertia::render('form-showcase');
    })->name('form.showcase');

    Route::get('invoices', [\App\Http\Controllers\InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('invoices/create', [\App\Http\Controllers\InvoiceController::class, 'create'])->name('invoices.create')->middleware('permission:create_invoice');
    Route::post('invoices', [\App\Http\Controllers\InvoiceController::class, 'store'])->name('invoices.store')->middleware('permission:create_invoice');
    Route::get('invoices/export', [\App\Http\Controllers\InvoiceController::class, 'export'])->name('invoices.export')->middleware('permission:export_invoice');
    Route::get('invoices/{id}', [\App\Http\Controllers\InvoiceController::class, 'show'])->name('invoices.show')->middleware('permission:view_invoice');

    Route::get('charts', function () {
        return Inertia::render('charts/index');
    })->name('charts.index')->middleware('permission:view_charts');

    Route::get('orders', [\App\Http\Controllers\OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/export', [\App\Http\Controllers\OrderController::class, 'export'])->name('orders.export')->middleware('permission:export_orders');
    Route::get('orders/{id}', [\App\Http\Controllers\OrderController::class, 'show'])->name('orders.show')->middleware('permission:view_orders');

    Route::get('error-pages/unauthorized', function () {
        return Inertia::render('error-pages/unauthorized');
    })->name('error-pages.unauthorized');
    Route::get('error-pages/forbidden', function () {
        return Inertia::render('error-pages/forbidden');
    })->name('error-pages.forbidden');
    Route::get('error-pages/not-found', function () {
        return Inertia::render('error-pages/not-found');
    })->name('error-pages.not-found');
    Route::get('error-pages/server-error', function () {
        return Inertia::render('error-pages/server-error');
    })->name('error-pages.server-error');
    Route::get('error-pages/maintenance', function () {
        return Inertia::render('error-pages/maintenance');
    })->name('error-pages.maintenance');

    Route::get('email', function () {
        return Inertia::render('email/index');
    })->name('email.index');

    Route::get('chat', function () {
        return Inertia::render('chat/index');
    })->name('chat.index');

    Route::get('blog', function () {
        return Inertia::render('blog/index');
    })->name('blog.index');

    Route::get('project-management', [\App\Http\Controllers\ProjectController::class, 'index'])->name('project-management.index');
    Route::get('project-management/{id}', [\App\Http\Controllers\ProjectController::class, 'show'])->name('project-management.show')->middleware('permission:view_projects');
    Route::post('project-management', [\App\Http\Controllers\ProjectController::class, 'store'])->name('project-management.store')->middleware('permission:create_projects');

    Route::get('task-management', [\App\Http\Controllers\TaskController::class, 'index'])->name('task-management.index');
    Route::get('task-management/kanban', [\App\Http\Controllers\TaskController::class, 'kanban'])->name('task-management.kanban');
    Route::post('task-management', [\App\Http\Controllers\TaskController::class, 'store'])->name('task-management.store')->middleware('permission:create_tasks');

    Route::resource('roles', App\Http\Controllers\RoleController::class);
    Route::resource('users', \App\Http\Controllers\UserController::class);

    // Activity tracking routes
    Route::post('/api/track-activity', [\App\Http\Controllers\ActivityLogController::class, 'track'])->name('activity.track');
    Route::get('/users/{user}/activity-log', [\App\Http\Controllers\UserController::class, 'activityLog'])->name('users.activity-log');
    Route::get('/api/users/{user}/activities', [\App\Http\Controllers\ActivityLogController::class, 'getUserActivities'])->name('users.activities');

    Route::get('/system-settings', [\App\Http\Controllers\SystemSettingsController::class, 'edit'])->name('system-settings.edit')->middleware('permission:manage_settings');
    Route::patch('/system-settings', [\App\Http\Controllers\SystemSettingsController::class, 'update'])->name('system-settings.update')->middleware('permission:manage_settings');

    Route::impersonate();
    Route::resource('classes', \App\Http\Controllers\ClassController::class);
    
    Route::resource('subjects', \App\Http\Controllers\SubjectController::class);
    
    Route::resource('students', \App\Http\Controllers\StudentController::class);
    
    Route::resource('teachers', \App\Http\Controllers\TeacherController::class);
    
    Route::resource('attendances', \App\Http\Controllers\AttendanceController::class);
    
    Route::resource('exams', \App\Http\Controllers\ExamController::class);
    
    Route::resource('results', \App\Http\Controllers\ResultController::class);
    
    Route::resource('fees', \App\Http\Controllers\FeeController::class);
    
});
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/media.php';
