<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grados_secciones', function (Blueprint $table) {
            $table->id();
            $table->enum('grado', ['1ero', '2do', '3ero', '4to', '5to', '6to']);
            $table->string('seccion');
            $table->string('docente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grados_secciones');
    }
};