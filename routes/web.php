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
    $msgErrores = $consulta->session()->get('msgError');

    // Saber si se tiene mensaje de sesion o errores
    if($msgRespData || $msgErrores) {
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
//Route::inertia('/grafica', 'GraficaPage/GraficaPage')->name("grafica");

Route::get('/perfil', function(Request $consulta){
    // Obtener la información del usuario desde la sesión
    $sesDatos = $consulta->session()->all();

    return Inertia::render('PerfilPage/PerfilPage', ['infoUser' => $sesDatos]);
})->name("perfil");
//Route::inertia('/perfil', 'PerfilPage/PerfilPage')->name("perfil");

Route::get('/cerSes', function(Request $consulta){
    // Borrar de la sesión la información del usuario implementada
    $consulta->session()->flush();

    return Inertia::render('LogoutPage/LogoutPage');
})->name("cerrarSesion");
//Route::inertia('/cerSes', 'LogoutPage/LogoutPage')->name("cerrarSesion");

// Ruta para validación y autenticación del formulario en el login
Route::post('/valiLog', [UsuarioController::class, "accesoLogin"])->name("validarLogin");

// Ruta para validación y generación de solicitud para renovación de acceso
Route::post('/valiSoliRecu', [LinkRecuController::class, "crearUsuRecu"])->name("validarSoliRecu");

// Ruta para recibir la petición de renovación de acceso (enlace enviado en el correo)
Route::get('/actuAcc/{linkCorreo}', [LinkRecuController::class, "obteRutaActuSis"])->name("actuAcceso");

// Ruta para renderizar el formulario de actualización de contraseña
Route::get('/actualizarAcceso', function(Request $consulta) {
    // Obtener la información de respuesta satifactoria desde la consulta
    $msgRespData = $consulta->session()->get('results');
    // Obtener la información de sesión enviada desde el controlador
    $sesDatos = $consulta->session()->get('form');

    // Agregando partial reload (inertia) en caso de que el usuario refresque la pagina, para que no se pierda la información de sesión en el componente
    if($msgRespData)
        return Inertia::render('ActuPassPage/FormActuPass', ['infoSes' => Inertia::always($sesDatos), 'procResp' =>  Inertia::always($msgRespData)]);

    return Inertia::render('ActuPassPage/FormActuPass', ['infoSes' => Inertia::always($sesDatos)]);
})->name("vistaFormActu");

// Ruta para validación y actualización de la contraseña para el acceso al sistema
Route::post('/valiActuContra', [UsuarioController::class, "actuContra"])->name("validarCambioCon");

// Ruta para eliminación del enlace de recuperación en el sistema
Route::delete('/borLinkActuPas/{linkSis}/{oriPeti}', [LinkRecuController::class, "borLinkRecu"])->name("borrarLinkGenSis");

/* Ruta para mostrar el formulario de renovación de contraseña
Route::get('/recuAcc', function(){
    return Inertia::render('Forms/FormNuePass');
});*/

// Ruta para obtener los registros de la lista de selección de sensores para la grafica
Route::get('/listSenGraf', [SensorController::class, "listaSenRegi"])->name("listaSensoRegis");

// Ruta para consultar los registros de la grafica
Route::get('/datosGraf', [RegistroSensorController::class, "listaRegistroEspeci"])->name("datosGrafica");