<?php

namespace App\Http\Controllers;

use App\Models\Historial;
use Illuminate\Http\Request;

class HistorialController extends Controller
{
    public function index()
    {
        $historiales = Historial::orderBy('created_at', 'desc')->get();
        return response()->json($historiales);
    }
}
