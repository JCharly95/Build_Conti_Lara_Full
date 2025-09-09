<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Helpers\FechaServerHelper;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear el usuario por defecto usando el query builder
        DB::table('usuarios')->insert([
            'Cod_User' => 'MXN-0001',
            'Ape_Pat' => 'Empresa',
            'Ape_Mat' => 'General',
            'Nombre' => 'Usuario Inicial',
            'Correo' => 'usuario@ejemplo.com',
            'Contra' => Hash::make('PruebaInicial93?!'),
            'UltimoAcceso' => app(FechaServerHelper::class)->genFecha()
        ]);
    }
}
