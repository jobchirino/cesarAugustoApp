<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Estudiante extends Model
{
    protected $fillable = [
        'nombre_apellido',
        'cedula_estudiantil',
        'genero',
        'registro_medico',
        'fecha_nacimiento',
        'asistencias',
        'inasistencias',
        'observaciones_inasistencias',
        'grado_id',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date:Y-m-d',
    ];

    public function grado(): BelongsTo
    {
        return $this->belongsTo(GradoSeccion::class, 'grado_id');
    }

    public function representante(): HasOne
    {
        return $this->hasOne(Representante::class);
    }

    public function representanteRelation(): HasOne
    {
        return $this->hasOne(Representante::class, 'estudiante_id');
    }

    public function representantes(): HasMany
    {
        return $this->hasMany(Representante::class, 'estudiante_id');
    }

    public function asistencias(): HasMany
    {
        return $this->hasMany(Asistencia::class, 'estudiante_id');
    }

    public function notasAcademicas(): HasMany
    {
        return $this->hasMany(NotaAcademica::class, 'estudiante_id');
    }
}