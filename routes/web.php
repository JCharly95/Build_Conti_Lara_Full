<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\RegistroSensorController;
use App\Http\Controllers\Api\LinkRecuController;
use App\Http\Controllers\Api\TipoSensorController;
use App\Models\Sensor;
use Inertia\Inertia;

// Ruta para el renderizado de la pagina raiz con nombre "main" para el enrutamiento de laravel; que contiene el formulario de login y el formulario para la solicitud de recuperación
Route::get('/', function(Request $consulta){
    // Obtener los mensajes de errores o peticiónes cumplidas cuando se redireccione a esta pagina
    $msgRespData = $consulta->session()->get('results');
    $msgErrores = $consulta->session()->get('msgError');

    // Si se tienen mensajes de errores o resultados en la sesión, se renderiza la pagina inyectandole la información
    if($msgRespData || $msgErrores) {
        if($msgRespData)
            return Inertia::render('LoginPage/LoginPage', ['msgResp' => $msgRespData]);

        if($msgErrores)
            return Inertia::render('LoginPage/LoginPage', ['errores' => $msgErrores]);
    }
    
    return Inertia::render('LoginPage/LoginPage');
})->name("main");

// Ruta para el renderizado de la pagina con nombre "grafica" para el enrutamiento de laravel; que contiene la grafica
Route::get('/grafica', function(){
    return Inertia::render('GraficaPage/GraficaPage');
})->name("grafica");

// Ruta para el renderizado de la pagina con nombre "perfil" para el enrutamiento de laravel; que contiene el perfil del usuario
Route::get('/perfil', function(Request $consulta){
    // Obtener solo la información requerida del usuario desde la sesión. NOTA: Esta información es provista desde el login.
    $sesDatos = ['nomUserSes' => $consulta->session()->get('nomUserSes'), 'fechUltiAcc' => $consulta->session()->get('fechUltiAcc'), 'dirCorSes' => $consulta->session()->get('dirCorSes')];
    
    return Inertia::render('PerfilPage/PerfilPage', ['infoUser' => $sesDatos]);
})->name("perfil");

// Ruta para el renderizado de la pagina para el cierre de sesión con nombre "cerrarSesion" para el enrutamiento de laravel; que contiene un modal de cierre de sesión
Route::get('/cerSes', function(Request $consulta){
    // Borrar toda la información del sistema implementada en la sesión
    $consulta->session()->flush();

    return Inertia::render('LogoutPage/LogoutPage');
})->name("cerrarSesion");

// Ruta para enviar a validar la información del formulario de login con nombre "validarLogin" para el enrutamiento de laravel; y conceder el acceso si el usuario es autenticado correctamente
Route::post('/valiLog', [UsuarioController::class, "accesoLogin"])->name("validarLogin");

// Ruta para enviar a validar la información del formulario para la solicitud de renovación de acceso con nombre "validarSoliRecu" para el enrutamiento de laravel; y generar dicha solicitud si se cumplen con los criterios establecidos en el formulario
Route::post('/valiSoliRecu', [LinkRecuController::class, "crearUsuRecu"])->name("validarSoliRecu");

// Ruta para recibir la petición web de renovación de acceso con nombre "actuAcceso" para el enrutamiento de laravel; invocada desde el enlace de recuperación enviado en el correo
Route::get('/actuAcc/{linkCorreo}', [LinkRecuController::class, "obteRutaActuSis"])->name("actuAcceso");

// Ruta para renderizar la pagina que contiene el formulario para la actualización de la contraseña con nombre "vistaFormActu" para el enrutamiento de laravel
Route::get('/actualizarAcceso', function(Request $consulta) {
    // Obtener la información de respuesta satifactoria desde la sesión
    $msgRespData = $consulta->session()->get('results');
    // Obtener la información de sesión necesaria para completar el proceso de actualización enviada desde el controlador
    $sesDatos = $consulta->session()->get('form');

    // Agregando partial reload (inertia) en caso de que el usuario refresque la pagina, para que no se pierda la información de sesión en el componente
    if($msgRespData)
        return Inertia::render('ActuPassPage/FormActuPass', ['infoSes' => Inertia::always($sesDatos), 'procResp' => Inertia::always($msgRespData)]);

    return Inertia::render('ActuPassPage/FormActuPass', ['infoSes' => Inertia::always($sesDatos)]);
})->name("vistaFormActu");

// Ruta para enviar a validar la información del formulario de actualización de contraseña con nombre "validarCambioCon" para el enrutamiento de laravel; y actualizar dicho valor si se cumplen con los criterios establecidos en el formulario
Route::post('/valiActuContra', [UsuarioController::class, "actuContra"])->name("validarCambioCon");

// Ruta para eliminar el enlace de recuperación aleatorio generado por el sistema con nombre "borrarLinkGenSis" para el enrutamiento de laravel; y "caducar" la solicitud de actualización, tanto si se actualizó el valor como si se canceló la petición
Route::delete('/borLinkActuPas/{linkSis}/{oriPeti}', [LinkRecuController::class, "borLinkRecu"])->name("borrarLinkGenSis");

// Ruta para obtener los sensores registrados (nombrados) del sistema para la selección en la grafica con nombre "listaSensoRegis" para el enrutamiento de laravel;
Route::get('/listaSenGraf', [SensorController::class, "listaSenRegi"])->name("listaSensoRegis");

// Ruta para obtener la información de los registros (especificos) de los sensores para la grafica con nombre "datosGrafica" para el enrutamiento de laravel;
Route::get('/datosGraf', [RegistroSensorController::class, "listaRegistroEspeci"])->name("datosGrafica");

// Ruta para obtener los sensores sin registrar del sistema para la selección en el formulario de registro con nombre "listaSensoNoRegis" para el enrutamiento de laravel;
Route::get('/listaSenRegi', [TipoSensorController::class, "listaSensoresNoRegi"])->name("listaSensoNoRegis");

// Ruta para renderizar la pagina que contiene los formularios internos del sistema con nombre "vistaFormInterno" para el enrutamiento de laravel
Route::get('/formInter', function(Request $consulta) {
    // Determinar si la petición contiene el nombre del formulario o viene de sesión (redireccionamiento)
    $nomForm = ($consulta->has("formuSoli")) ? $consulta->formuSoli : $consulta->session()->get('formuSoli');

    // Obtener la información de respuesta satifactoria desde la sesión
    $msgRespData = $consulta->session()->get('results');
    
    // Si el usuario trae información de sesión (respuesta satisfactoria), ingresar la información en el renderizado de la pagina con partial reload (inertia)
    if($msgRespData)
        return Inertia::render('ConteFormsPage/InteFormsPage', ['nomFormVer' => Inertia::always($nomForm), 'msgConclu' => Inertia::always($msgRespData)]);

    return Inertia::render('ConteFormsPage/InteFormsPage', ['nomFormVer' => $nomForm]);
})->name("vistaFormInterno");

// Ruta para enviar a validar la información del formulario para el registro de un sensor con nombre "validarRegiSen" para el enrutamiento de laravel; y registrar el sensor si se cumplen con los criterios establecidos en el formulario
Route::post('/valiRegiSen', [SensorController::class, "regiSensor"])->name("validarRegiSen");

// Ruta para enviar a validar la información del formulario para la edición de un sensor "validarEditSen" para el enrutamiento de laravel; y actualizar la información del sensor si se cumplen con los criterios establecidos en el formulario
Route::post('/valiEditSen', [SensorController::class, "editarSensor"])->name("validarEditSen");

// Ruta para eliminar el sensor seleccionado en el formulario de edición y eliminación de sensores
Route::delete('/borSenSel/{nombreSensor}', [SensorController::class, "borrarSensor"])->name("eliminarSensor");