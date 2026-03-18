<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asistencia extends Model
{
    protected $table = 'asistencias';
    protected $fillable = [
        'estudiante_id',
        'fecha',
        'presente',
        'observacion',
    ];

    protected function casts(): array
    {
        return [
            'presente' => 'boolean',
            'fecha' => 'date',
        ];
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id');
    }
}