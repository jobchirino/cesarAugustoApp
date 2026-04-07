<?php

namespace App\Http\Controllers;

use App\Models\Estudiante;
use App\Models\Historial;
use App\Models\GradoSeccion;
use App\Models\NotaAcademica;
use App\Models\Asistencia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CierreEscolarController extends Controller
{
    public function cierre(Request $request)
    {
        $añoEscolar = date('Y') . '-' . (date('Y') + 1);
        $lapsoOptions = ['1', '2', '3', 'Final'];

        $estudiantesActivos = Estudiante::with('grado')->get();

        if ($estudiantesActivos->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No hay estudiantes activos para cerrar el año escolar.',
            ], 400);
        }

        foreach ($estudiantesActivos as $estudiante) {
            $notasCount = NotaAcademica::where('estudiante_id', $estudiante->id)->count();
            if ($notasCount < 4) {
                $faltantes = array_diff($lapsoOptions, 
                    NotaAcademica::where('estudiante_id', $estudiante->id)
                        ->pluck('lapso')->toArray()
                );
                return response()->json([
                    'success' => false,
                    'message' => "El estudiante {$estudiante->nombre_apellido} (Cédula: {$estudiante->cedula_estudiantil}) no tiene todas las notas. Faltan los lapsos: " . implode(', ', $faltantes),
                ], 400);
            }
        }

        try {
            $result = null;
            DB::transaction(function () use ($estudiantesActivos, $añoEscolar, &$result) {
                $totalEstudiantes = $estudiantesActivos->count();
                $totalAsistencias = Asistencia::whereIn('estudiante_id', $estudiantesActivos->pluck('id'))
                    ->where('presente', true)->count();
                $totalInasistencias = Asistencia::whereIn('estudiante_id', $estudiantesActivos->pluck('id'))
                    ->where('presente', false)->count();

                Historial::create([
                    'año_escolar' => $añoEscolar,
                    'total_estudiantes' => $totalEstudiantes,
                    'total_asistencias' => $totalAsistencias,
                    'total_inasistencias' => $totalInasistencias,
                ]);

                $egresados = Estudiante::whereHas('grado', function ($query) {
                    $query->where('grado', '6to');
                })->get();

                $egresadosData = $egresados->map(function ($estudiante) {
                    $asistenciasCount = Asistencia::where('estudiante_id', $estudiante->id)
                        ->where('presente', true)->count();
                    $inasistenciasCount = Asistencia::where('estudiante_id', $estudiante->id)
                        ->where('presente', false)->count();
                    return [
                        'nombre' => $estudiante->nombre_apellido,
                        'total_asistencias' => $asistenciasCount,
                        'total_inasistencias' => $inasistenciasCount,
                    ];
                });

                $pdfPath = null;
                if ($egresadosData->isNotEmpty()) {
                    $pdf = Pdf::loadView('pdf.egresados', [
                        'añoEscolar' => $añoEscolar,
                        'egresados' => $egresadosData,
                    ]);
                    $pdfName = 'egresados_' . date('Y') . '.pdf';
                    $pdfPath = 'egresados/' . $pdfName;
                    Storage::disk('public')->put($pdfPath, $pdf->output());
                }

                $gradoMapping = [
                    '1ero' => '2do',
                    '2do' => '3ero',
                    '3ero' => '4to',
                    '4to' => '5to',
                    '5to' => '6to',
                ];

                foreach ($estudiantesActivos as $estudiante) {
                    $gradoActual = $estudiante->grado->grado;
                    if (isset($gradoMapping[$gradoActual])) {
                        $siguienteGrado = GradoSeccion::where('grado', $gradoMapping[$gradoActual])
                            ->where('seccion', $estudiante->grado->seccion)
                            ->first();
                        if ($siguienteGrado) {
                            $estudiante->update(['grado_id' => $siguienteGrado->id]);
                        }
                    }
                }

                if ($egresados->isNotEmpty()) {
                    $egresados->each(function ($estudiante) {
                        NotaAcademica::where('estudiante_id', $estudiante->id)->delete();
                        Asistencia::where('estudiante_id', $estudiante->id)->delete();
                        $estudiante->delete();
                    });
                }

                // Use delete() instead of truncate() so the operation respects
                // the current DB transaction (TRUNCATE issues an implicit COMMIT).
                NotaAcademica::query()->delete();
                Asistencia::query()->delete();

                $result = response()->json([
                    'success' => true,
                    'message' => 'El año escolar se ha cerrado correctamente.',
                    'pdf_url' => $pdfPath ? asset('storage/' . $pdfPath) : null,
                ], 200);
            });
            return $result;
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar el año escolar: ' . $e->getMessage(),
            ], 500);
        }
    }
}
