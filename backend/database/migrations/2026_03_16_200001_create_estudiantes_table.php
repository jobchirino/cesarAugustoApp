<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estudiantes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_apellido');
            $table->string('cedula_estudiantil')->unique();
            $table->enum('genero', ['Masculino', 'Femenino']);
            $table->text('registro_medico')->nullable();
            $table->integer('asistencias')->default(0);
            $table->integer('inasistencias')->default(0);
            $table->text('observaciones_inasistencias')->nullable();
            $table->foreignId('grado_id')->constrained('grados_secciones')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estudiantes');
    }
};