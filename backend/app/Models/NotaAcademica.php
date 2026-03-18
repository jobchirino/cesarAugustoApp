<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotaAcademica extends Model
{
    protected $table = 'notas_academicas';
    protected $fillable = [
        'estudiante_id',
        'lapso',
        'boletin',
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id');
    }
}