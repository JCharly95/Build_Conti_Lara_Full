<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\RegistroSensorController;
use Inertia\Inertia;

/* Rutas para renderizado general de las interfaces, peticiones get simples (los componentes de las paginas) sin parametros */
Route::get('/', function(){
    return Inertia::render('LoginPage/LoginPage');
});
Route::get('/grafica', function(){
    return Inertia::render('GraficaPage/GraficaPage');
});
Route::get('/perfil', function(){
    return Inertia::render('PerfilPage/PerfilPage');
});
Route::get('/cerSes', function(){
    return Inertia::render('LogoutPage/LogoutPage');
});

// Ruta para validación y autenticacion del formulario en el login
Route::post('/valiLog', [UsuarioController::class, "accesoLogin"]);

// Ruta para mostrar el formulario de renovación de contraseña
Route::get('/recuAcc', function(){
    return Inertia::render('Forms/FormRecuPass');
});

// Ruta para validación del formulario de renovación de acceso
Route::get('/valiSoliRecu', [UsuarioController::class, "buscarUsuarioRecu"]);

// Ruta para obtener los registros de la lista de selección de sensores para la grafica
Route::get('/listSenGraf', [SensorController::class, "listaSenRegi"]);

// Ruta para consultar los registros de la grafica
Route::get('/datosGraf', [RegistroSensorController::class, "listaRegistroEspeci"]);