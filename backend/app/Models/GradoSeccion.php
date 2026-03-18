<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GradoSeccion extends Model
{
    protected $table = 'grados_secciones';
    protected $fillable = [
        'grado',
        'seccion',
        'docente',
    ];

    public function estudiantes(): HasMany
    {
        return $this->hasMany(Estudiante::class, 'grado_id');
    }
}