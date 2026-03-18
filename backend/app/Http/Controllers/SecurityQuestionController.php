<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class SecurityQuestionController extends Controller
{
    public function status(Request $request)
    {
        $user = $request->user();

        $hasThree = $user->securityQuestions()->count() >= 3;

        return response()->json([
            'configured' => $hasThree,
        ]);
    }

    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'questions' => ['required', 'array', 'size:3'],
            'questions.*.question' => ['required', 'string', 'max:500'],
            'questions.*.answer' => ['required', 'string', 'min:1'],
        ])->validate();

        $user = $request->user();

        $user->securityQuestions()->delete();

        foreach ($validated['questions'] as $item) {
            $user->securityQuestions()->create([
                'question' => $item['question'],
                'answer' => Hash::make($item['answer']),
            ]);
        }

        return response()->json([
            'message' => 'Preguntas de seguridad configuradas correctamente.',
        ]);
    }

    public function getQuestionsForRecovery(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return response()->json([
                'message' => 'Usuario no encontrado.',
            ], 404);
        }

        $questions = $user->securityQuestions()->select('id', 'question')->get();

        if ($questions->count() < 3) {
            return response()->json([
                'message' => 'El usuario no ha configurado preguntas de seguridad.',
            ], 400);
        }

        return response()->json([
            'questions' => $questions,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email'],
            'answers' => ['required', 'array', 'size:3'],
            'answers.*' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ])->validate();

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return response()->json([
                'message' => 'Usuario no encontrado.',
            ], 404);
        }

        $securityQuestions = $user->securityQuestions()->get();

        if ($securityQuestions->count() < 3) {
            return response()->json([
                'message' => 'El usuario no ha configurado preguntas de seguridad.',
            ], 400);
        }

        foreach ($validated['answers'] as $index => $answer) {
            $storedAnswer = $securityQuestions->get($index)->answer ?? '';
            if (! Hash::check($answer, $storedAnswer)) {
                return response()->json([
                    'message' => 'Las respuestas de seguridad son incorrectas.',
                ], 400);
            }
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        $user->tokens()->delete();

        return response()->json([
            'message' => 'Contraseña restablecida correctamente.',
        ]);
    }
}
