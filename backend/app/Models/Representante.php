<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Representante extends Model
{
    protected $fillable = [
        'estudiante_id',
        'nombre_apellido',
        'telefono',
        'direccion',
        'cedula',
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id');
    }
}