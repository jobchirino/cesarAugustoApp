<?php

namespace App\Http\Controllers;

use App\Models\GradoSeccion;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GradoSeccionController extends Controller
{
    public function index()
    {
        // Obtener los grados sin cargar la relación estudiantes
        $grados = GradoSeccion::all();
        return response()->json($grados);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'grado' => [
                'required',
                'in:1ero,2do,3ero,4to,5to,6to',
                Rule::unique('grados_secciones')->where(function ($query) use ($request) {
                    return $query->where('seccion', $request->seccion);
                }),
            ],
            'seccion' => ['required', 'string', 'max:10'],
            'docente' => ['required', 'string', 'max:255'],
        ]);

        $grado = GradoSeccion::create($validated);
        return response()->json($grado, 201);
    }

    public function show(GradoSeccion $gradoSeccion)
    {
        $grados = $gradoSeccion;
        return response()->json($grados);
    }

    public function update(Request $request, GradoSeccion $gradoSeccion)
    {
        $validated = $request->validate([
            'grado' => [
                'sometimes',
                'in:1ero,2do,3ero,4to,5to,6to',
            ],
            'seccion' => ['sometimes', 'string', 'max:10'],
            'docente' => ['sometimes', 'string', 'max:255'],
        ]);

        $gradoSeccion->update($validated);
        return response()->json($gradoSeccion);
    }

    public function destroy($id)
    {
        try {
            $gradoSeccion = GradoSeccion::findOrFail($id);
            
            if ($gradoSeccion->estudiantes()->count() > 0) {
                return response()->json([
                    'message' => 'No se puede eliminar un grado que tiene estudiantes inscritos.'
                ], 400);
            }
            
            $gradoSeccion->delete();
            return response()->json([
                'message' => 'Grado eliminado correctamente.'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Grado no encontrado.'
            ], 404);
        }
    }

    public function updateDocente(Request $request, $id)
    {
        try {
            $gradoSeccion = GradoSeccion::findOrFail($id);
            
            $validated = $request->validate([
                'docente' => ['required', 'string', 'max:255'],
            ]);

            $gradoSeccion->update($validated);
            return response()->json($gradoSeccion);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Grado no encontrado.'
            ], 404);
        }
    }

    public function descargarReporte($id)
    {
        $grado = GradoSeccion::with(['estudiantes.asistencias', 'estudiantes.notasAcademicas'])->findOrFail($id);

        $estudiantesData = $grado->estudiantes->map(function ($estudiante) {
            
            $totalAsistencias = $estudiante->asistencias()->where('presente', true)->count();
            $totalInasistencias = $estudiante->asistencias()->where('presente', false)->count();
            $lapsosEvaluados = $estudiante->notasAcademicas()->count();

            return [
                'nombre' => $estudiante->nombre_apellido,
                'total_asistencias' => $totalAsistencias,
                'total_inasistencias' => $totalInasistencias,
                'lapsos_evaluados' => $lapsosEvaluados,
            ];
        });

        $pdf = Pdf::loadView('reportes.grado', [
            'grado' => $grado,
            'estudiantes' => $estudiantesData,
        ]);

        return $pdf->download('reporte_' . $grado->grado . '_seccion_' . $grado->seccion . '.pdf');
    }
}