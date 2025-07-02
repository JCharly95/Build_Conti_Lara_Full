<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\RegistroSensorController;
use App\Http\Controllers\Api\LinkRecuController;
use Inertia\Inertia;

/* Rutas para renderizado general de las interfaces, peticiones get simples (los componentes de las paginas) sin parametros */
Route::get('/', function(Request $consulta){
    $msgRespData = $consulta->session()->get('results');
    $msgErrores = $consulta->session()->get('errors');

    // Saber si se tiene mensaje de sesion
    if($msgRespData || $msgErrores){
        if($msgRespData)
            return Inertia::render('LoginPage/LoginPage', ['msgResp' => $msgRespData]);

        if($msgErrores)
            return Inertia::render('LoginPage/LoginPage', ['errores' => $msgErrores]);
    } else {
        return Inertia::render('LoginPage/LoginPage');
    }
})->name("main");

Route::get('/grafica', function(){
    return Inertia::render('GraficaPage/GraficaPage');
})->name("grafica");

Route::get('/perfil', function(){
    return Inertia::render('PerfilPage/PerfilPage');
})->name("perfil");

Route::get('/cerSes', function(){
    return Inertia::render('LogoutPage/LogoutPage');
})->name("cerrarSesion");

// Ruta para validación y autenticación del formulario en el login
Route::post('/valiLog', [UsuarioController::class, "accesoLogin"])->name("validarLogin");

// Ruta para validación y generación de solicitud para renovación de acceso
Route::post('/valiSoliRecu', [LinkRecuController::class, "crearUsuRecu"])->name("validarSoliRecu");

// Ruta para recibir la petición de renovación de acceso
Route::get('/actuAcc/{linkCorreo}', [LinkRecuController::class, "obteRutaActuSis"])->name("actuAcceso");

/* Ruta para mostrar el formulario de renovación de contraseña
Route::get('/recuAcc', function(){
    return Inertia::render('Forms/FormNuePass');
});*/


// Ruta para obtener los registros de la lista de selección de sensores para la grafica
Route::get('/listSenGraf', [SensorController::class, "listaSenRegi"])->name("listaSensoRegis");

// Ruta para consultar los registros de la grafica
Route::get('/datosGraf', [RegistroSensorController::class, "listaRegistroEspeci"])->name("datosGrafica");