<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\RiskPredictionController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ChatbotController;

Route::post('register', [RegistrationController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::post('/predict', [RiskPredictionController::class, 'predict']);
Route::post('/patients', [PatientController::class, 'store']);
Route::get('/patients', [PatientController::class, 'index']);
Route::get('/patients/{id}', [PatientController::class, 'show']);
Route::post('/chatbot/message', [ChatbotController::class, 'handleMessage']);

Route::options('{any}', function () {
    return response()->json([], 200);
})->where('any', '.*');
