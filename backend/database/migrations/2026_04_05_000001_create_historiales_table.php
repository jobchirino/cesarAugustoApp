<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historiales', function (Blueprint $table) {
            $table->id();
            $table->string('año_escolar');
            $table->integer('total_estudiantes')->default(0);
            $table->integer('total_asistencias')->default(0);
            $table->integer('total_inasistencias')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historiales');
    }
};
