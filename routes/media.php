<?php

use App\Http\Controllers\MediaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/media', [MediaController::class, 'index'])->name('media.index');
    Route::get('/csrf-token', function() {
        return response()->json(['csrf_token' => csrf_token()]);
    });
    Route::get('/media/{media}/url', [MediaController::class, 'getUrl'])->name('media.url');
    Route::post('/media/urls', [MediaController::class, 'getUrls'])->name('media.urls');
    Route::post('/media/upload', [MediaController::class, 'upload'])->name('media.upload');
    Route::delete('/media/{media}', [MediaController::class, 'delete'])->name('media.delete');
    Route::get('/media/{media}/download', [MediaController::class, 'download'])->name('media.download');
    
    Route::post('/media/folders', [MediaController::class, 'createFolder'])->name('media.folders.create');
    Route::put('/media/folders/{folder}', [MediaController::class, 'updateFolder'])->name('media.folders.update');
    Route::delete('/media/folders/{folder}', [MediaController::class, 'deleteFolder'])->name('media.folders.delete');
    
});