<?php

namespace App\Http\Controllers;

use App\Models\Representante;
use Illuminate\Http\Request;

class RepresentanteController extends Controller
{
    public function index()
    {
        $representantes = Representante::with('estudiante')->get();
        return response()->json($representantes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'estudiante_id' => ['required', 'exists:estudiantes,id'],
            'nombre_apellido' => ['required', 'string', 'max:255'],
            'telefono' => ['required', 'string', 'max:20'],
            'direccion' => ['required', 'string'],
            'cedula' => ['required', 'string', 'max:20'],
        ]);

        $representante = Representante::create($validated);
        return response()->json($representante->load('estudiante'), 201);
    }

    public function show(Representante $representante)
    {
        return response()->json($representante->load('estudiante'));
    }

    public function update(Request $request, Representante $representante)
    {
        $validated = $request->validate([
            'estudiante_id' => ['sometimes', 'exists:estudiantes,id'],
            'nombre_apellido' => ['sometimes', 'string', 'max:255'],
            'telefono' => ['sometimes', 'string', 'max:20'],
            'direccion' => ['sometimes', 'string'],
            'cedula' => ['sometimes', 'string', 'max:20'],
        ]);

        $representante->update($validated);
        return response()->json($representante->load('estudiante'));
    }

    public function destroy(Representante $representante)
    {
        $representante->delete();
        return response()->json(null, 204);
    }
}