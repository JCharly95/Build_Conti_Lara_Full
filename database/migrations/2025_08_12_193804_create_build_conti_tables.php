<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('ID_User');
            $table->string('Cod_User', length: 8);
            $table->string('Ape_Pat', length: 30);
            $table->string('Ape_Mat', length: 30);
            $table->string('Nombre', length: 30);
            $table->string('Correo', length: 50)->unique();
            $table->string('Contra');
            $table->dateTime('UltimoAcceso');
        });

        Schema::create('links_recuperacion', function (Blueprint $table) {
            $table->id('ID_Link');
            $table->string('Link_Correo', length: 10);
            $table->string('Ruta_Sistema', length: 40);
        });

        Schema::create('sensor', function (Blueprint $table) {
            $table->id('ID_Sensor');
            $table->string('Nombre', length: 150);
            $table->unsignedBigInteger('Tipo_ID');
        });

        // Check if the 'history_type_map' table exists before adding the foreign key
        if (Schema::hasTable('history_type_map')) {
            Schema::table('sensor', function (Blueprint $table) {
                $table->foreignId('Tipo_ID')->constrained(
                    table: 'history_type_map', indexName: 'Sensor_Tipo'
                );
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('links_recuperacion');
        // Delete foreign key from sensor table before delete table
        Schema::table('sensor', function (Blueprint $table) {
            $table->dropConstrainedForeignId('Tipo_ID');
        });
        Schema::dropIfExists('sensor');
    }
};
