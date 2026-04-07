<?php

namespace App\Http\Controllers;

use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EstudianteController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $gradoId = $request->input('grado_id');

        $estudiantes = Estudiante::with(['grado'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nombre_apellido', 'like', "%{$search}%")
                      ->orWhere('cedula_estudiantil', 'like', "%{$search}%");
                });
            })
            ->when($gradoId, function ($query) use ($gradoId) {
                $query->where('grado_id', $gradoId);
            })
            ->orderBy('nombre_apellido')
            ->paginate(10);

        return response()->json($estudiantes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_apellido' => ['required', 'string', 'max:255'],
            'cedula_estudiantil' => ['required', 'string', 'unique:estudiantes,cedula_estudiantil', 'max:50'],
            'genero' => ['required', 'in:Masculino,Femenino'],
            'registro_medico' => ['nullable', 'string'],
            'fecha_nacimiento' => ['nullable', 'date'],
            'asistencias' => ['nullable', 'integer', 'min:0'],
            'inasistencias' => ['nullable', 'integer', 'min:0'],
            'observaciones_inasistencias' => ['nullable', 'string'],
            'grado_id' => ['required', 'exists:grados_secciones,id'],
        ]);

        $estudiante = Estudiante::create($validated);
        return response()->json($estudiante->load('grado'), 201);
    }

    public function show($id)
    {
        try {
            $estudiante = Estudiante::with([
                'grado',
                'representante', 
                'notasAcademicas', 
                'asistencias'
            ])->findOrFail($id);

            $estudianteArray = $estudiante->toArray();
            
            if (isset($estudianteArray['asistencias'])) {
                $estudianteArray['asistencias'] = array_map(function ($a) {
                    $estado = $a['presente'] === true ? 'Asistio' : ($a['presente'] === false ? 'Falto' : 'Justificado');
                    return [
                        'id' => $a['id'],
                        'fecha' => $a['fecha'],
                        'estado' => $estado,
                        'observacion' => $a['observacion'],
                    ];
                }, $estudianteArray['asistencias']);
            }

            return response()->json($estudianteArray);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error interno del servidor',
                'mensaje_real' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $estudiante = Estudiante::findOrFail($id);

        $validated = $request->validate([
            'nombre_apellido' => ['required', 'string', 'max:255'],
            'cedula_estudiantil' => ['required', 'string', Rule::unique('estudiantes')->ignore($estudiante->id), 'max:50'],
            'genero' => ['required', 'in:Masculino,Femenino'],
            'registro_medico' => ['nullable', 'string'],
            'fecha_nacimiento' => ['nullable', 'date'],
            'grado_id' => ['required', 'exists:grados_secciones,id'],
            'representante' => ['sometimes', 'array'],
            'representante.nombre_apellido' => ['required_with:representante', 'string', 'max:255'],
            'representante.cedula' => ['required_with:representante', 'string', 'max:50'],
            'representante.telefono' => ['required_with:representante', 'string', 'max:50'],
            'representante.direccion' => ['required_with:representante', 'string'],
        ]);

        $estudiante->update([
            'nombre_apellido' => $validated['nombre_apellido'],
            'cedula_estudiantil' => $validated['cedula_estudiantil'],
            'genero' => $validated['genero'],
            'registro_medico' => $validated['registro_medico'] ?? null,
            'fecha_nacimiento' => $validated['fecha_nacimiento'] ?? null,
            'grado_id' => $validated['grado_id'],
        ]);

        if (isset($validated['representante'])) {
            $estudiante->representante()->update([
                'nombre_apellido' => $validated['representante']['nombre_apellido'],
                'cedula' => $validated['representante']['cedula'],
                'telefono' => $validated['representante']['telefono'],
                'direccion' => $validated['representante']['direccion'],
            ]);
        }

        return response()->json([
            'message' => 'Estudiante actualizado correctamente',
            'estudiante' => $estudiante->load(['grado', 'representante']),
        ]);
    }

    public function destroy(Estudiante $estudiante)
    {
        $estudiante->delete();
        return response()->json(null, 204);
    }
}