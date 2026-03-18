<?php

namespace App\Http\Controllers;

use App\Models\Estudiante;
use App\Models\GradoSeccion;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $estudiantes = Estudiante::count();
        $grados = GradoSeccion::count();

        return response()->json([
            'estudiantes' => $estudiantes,
            'grados' => $grados,
        ]);
    }
}
