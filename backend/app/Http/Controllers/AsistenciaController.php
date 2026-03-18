<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use Illuminate\Http\Request;

class AsistenciaController extends Controller
{
    public function index()
    {
        $asistencias = Asistencia::with('estudiante')->get();
        return response()->json($asistencias);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'estudiante_id' => ['required', 'exists:estudiantes,id'],
            'fecha' => ['required', 'date'],
            'estado' => ['required', 'in:Asistio,Falto,Justificado'],
            'observacion' => ['nullable', 'string'],
        ]);

        $presente = $validated['estado'] === 'Asistio' ? true : ($validated['estado'] === 'Falto' ? false : null);

        $asistencia = Asistencia::create([
            'estudiante_id' => $validated['estudiante_id'],
            'fecha' => $validated['fecha'],
            'presente' => $presente,
            'observacion' => $validated['observacion'] ?? null,
        ]);

        return response()->json($asistencia->load('estudiante'), 201);
    }

    public function show(Asistencia $asistencia)
    {
        return response()->json($asistencia->load('estudiante'));
    }

    public function update(Request $request, Asistencia $asistencia)
    {
        $validated = $request->validate([
            'estudiante_id' => ['sometimes', 'exists:estudiantes,id'],
            'fecha' => ['sometimes', 'date'],
            'presente' => ['nullable', 'boolean'],
            'observacion' => ['nullable', 'string'],
        ]);

        $asistencia->update($validated);
        return response()->json($asistencia->load('estudiante'));
    }

    public function destroy(Asistencia $asistencia)
    {
        $asistencia->delete();
        return response()->json(null, 204);
    }
}