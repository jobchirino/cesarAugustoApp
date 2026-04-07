<?php

namespace App\Http\Controllers;

use App\Models\Estudiante;
use App\Models\GradoSeccion;
use App\Models\Asistencia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $estudiantes = Estudiante::count();
        $grados = GradoSeccion::count();
        $asistencias = Asistencia::where('presente', true)->count();

        return response()->json([
            'estudiantes' => $estudiantes,
            'grados' => $grados,
            'asistencias' => $asistencias,
        ]);
    }
}
