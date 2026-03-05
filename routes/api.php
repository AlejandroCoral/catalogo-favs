<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;

use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\CommentController;

use App\Http\Controllers\Api\ExternalController;
use App\Http\Controllers\Api\UserController;


/*
|--------------------------------------------------------------------------
| Auth
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Comments
Route::post('/comments', [CommentController::class, 'store'])->middleware('auth:sanctum');
Route::get('/comments/{product_id}', [CommentController::class, 'byProduct']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/profile', function (Request $request) {
        return $request->user();
    });

});

/*
|--------------------------------------------------------------------------
| Products
|--------------------------------------------------------------------------
*/

// Públicos (cualquiera puede ver)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Solo admin puede crear / editar / eliminar
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::post('/products/{id}/image', [ProductController::class, 'uploadImage']);
});

// Favoritos (cualquier usuario logueado)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{product_id}', [FavoriteController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::patch('/users/{id}/make-admin', [UserController::class, 'makeAdmin']);
    Route::patch('/users/{id}/remove-admin', [UserController::class, 'removeAdmin']);

});

Route::middleware('auth:sanctum')->get('/profile', function (\Illuminate\Http\Request $request) {
    return $request->user();
});


Route::get('/external', [ExternalController::class, 'quote']);