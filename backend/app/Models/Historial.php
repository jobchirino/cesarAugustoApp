<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Historial extends Model
{
    protected $table = 'historiales';
    protected $fillable = [
        'año_escolar',
        'total_estudiantes',
        'total_asistencias',
        'total_inasistencias',
    ];
}
