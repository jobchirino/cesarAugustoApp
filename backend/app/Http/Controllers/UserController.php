<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        if (auth()->user()->id !== 1) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $usuarios = User::where('id', '!=', 1)->get(['id', 'name', 'email', 'created_at']);
        return response()->json($usuarios);
    }

    public function store(Request $request)
    {
        if (auth()->user()->id !== 1) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $usuario = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'id' => $usuario->id,
            'name' => $usuario->name,
            'email' => $usuario->email,
            'created_at' => $usuario->created_at,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if (auth()->user()->id !== 1) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        if ($id == 1) {
            return response()->json(['error' => 'No se puede modificar al Super Admin'], 403);
        }

        $usuario = User::findOrFail($id);

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($usuario->id)],
        ];

        if ($request->has('password') && !empty($request->password)) {
            $rules['password'] = ['string', 'min:8'];
        }

        $validated = $request->validate($rules);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (isset($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $usuario->update($updateData);

        return response()->json([
            'id' => $usuario->id,
            'name' => $usuario->name,
            'email' => $usuario->email,
            'created_at' => $usuario->created_at,
        ]);
    }

    public function destroy($id)
    {
        if (auth()->user()->id !== 1) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        if ($id == 1) {
            return response()->json(['error' => 'No se puede eliminar al Super Admin'], 403);
        }

        $usuario = User::findOrFail($id);
        $usuario->delete();

        return response()->json(null, 204);
    }
}
