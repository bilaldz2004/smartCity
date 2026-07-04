<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AnalyzeController;
use App\Http\Controllers\Api\UserController;

// Legacy routes for non-clerk clients if any (returning empty or 400 since we use clerk)
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

// Endpoint to sync Clerk user to local DB
Route::post('/clerk-sync', [AuthController::class, 'clerkSync']);

Route::middleware('clerk')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Admin-only: staff user management (admins & workers)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
});

// AI Image Analysis (requires auth to prevent API key abuse)
Route::post('/analyze-image', [AnalyzeController::class, 'analyze'])->middleware('clerk');

Route::get('/reports', [ReportController::class, 'index']);
Route::get('/reports/{report}', [ReportController::class, 'show']);
Route::post('/reports', [ReportController::class, 'store'])->middleware('clerk');
Route::put('/reports/{report}', [ReportController::class, 'update'])->middleware('clerk');
Route::delete('/reports/{report}', [ReportController::class, 'destroy'])->middleware('clerk');
