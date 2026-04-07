<?php

use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CierreEscolarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\GradoSeccionController;
use App\Http\Controllers\HistorialController;
use App\Http\Controllers\NotaAcademicaController;
use App\Http\Controllers\RepresentanteController;
use App\Http\Controllers\SecurityQuestionController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::delete('/users/{user}', [AuthController::class, 'destroy']);
Route::get('/users/any-registered', [AuthController::class, 'isAnyUserRegistered']);
Route::post('/forgot-password/questions', [SecurityQuestionController::class, 'getQuestionsForRecovery']);
Route::post('/reset-password', [SecurityQuestionController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/cierre-escolar', [CierreEscolarController::class, 'cierre']);
    Route::get('/historial', [HistorialController::class, 'index']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/security-questions/status', [SecurityQuestionController::class, 'status']);
    Route::post('/security-questions', [SecurityQuestionController::class, 'store']);

    Route::apiResource('grados-secciones', GradoSeccionController::class);
    Route::put('grado-seccion/{id}', [GradoSeccionController::class, 'updateDocente']);
    Route::get('grados-secciones/{id}/reporte', [GradoSeccionController::class, 'descargarReporte']);
    Route::apiResource('estudiantes', EstudianteController::class);
    Route::apiResource('representantes', RepresentanteController::class);
    Route::apiResource('asistencias', AsistenciaController::class);
    Route::apiResource('notas-academicas', NotaAcademicaController::class);
    Route::get('/usuarios', [UserController::class, 'index']);
    Route::post('/usuarios', [UserController::class, 'store']);
    Route::put('/usuarios/{id}', [UserController::class, 'update']);
    Route::delete('/usuarios/{id}', [UserController::class, 'destroy']);
});

