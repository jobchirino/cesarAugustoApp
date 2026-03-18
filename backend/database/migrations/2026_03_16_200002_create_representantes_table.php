<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('representantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained()->onDelete('cascade');
            $table->string('nombre_apellido');
            $table->string('telefono');
            $table->text('direccion');
            $table->string('cedula');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('representantes');
    }
};