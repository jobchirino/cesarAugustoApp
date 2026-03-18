<?php

namespace App\Http\Controllers;

use App\Models\NotaAcademica;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NotaAcademicaController extends Controller
{
    public function index()
    {
        $notas = NotaAcademica::with('estudiante')->get();
        return response()->json($notas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'estudiante_id' => ['required', 'exists:estudiantes,id'],
            'lapso' => [
                'required',
                'in:1,2,3,Final',
                Rule::unique('notas_academicas')->where(function ($query) use ($request) {
                    return $query->where('estudiante_id', $request->estudiante_id);
                })
            ],
            'boletin' => ['nullable', 'string'],
        ], [
            'lapso.unique' => 'Este lapsos ya tiene una nota registrada para este estudiante.',
        ]);

        $nota = NotaAcademica::create([
            'estudiante_id' => $validated['estudiante_id'],
            'lapso' => $validated['lapso'],
            'boletin' => $validated['boletin'] ?? null,
        ]);

        return response()->json($nota->load('estudiante'), 201);
    }

    public function show(NotaAcademica $notaAcademica)
    {
        return response()->json($notaAcademica->load('estudiante'));
    }

    public function update(Request $request, NotaAcademica $notaAcademica)
    {
        $validated = $request->validate([
            'estudiante_id' => ['sometimes', 'exists:estudiantes,id'],
            'lapso' => ['sometimes', 'in:1,2,3,Final'],
            'boletin' => ['nullable', 'string'],
        ]);

        $notaAcademica->update($validated);
        return response()->json($notaAcademica->load('estudiante'));
    }

    public function destroy(NotaAcademica $notaAcademica)
    {
        $notaAcademica->delete();
        return response()->json(null, 204);
    }
}