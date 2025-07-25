<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Link_Recu;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Throwable;
use App\Helpers\FechaServerHelper;

class UsuarioController extends Controller
{
    /** Metodo para regresar el nombre del campo username o email que será usado en la autenticación junto con la contraseña */
    public function username(){
        return 'Correo';
    }

    /** Metodo para regresar todos los usuarios registrados 
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function listaUsuarios(){
        // Proteger la consulta
        try {
            // Obtener todos los usuarios de la BD usando el modelo para buscarlos
            $usuarios = User::all();
    
            // Regresar un error si no se encontraron usuarios
            if($usuarios->isEmpty())
                return response()->json(['msgError' => 'Error: No hay usuarios.'], 404);
            
            // Regresar la lista de usuarios encontrados
            return response()->json(['results' => $usuarios], 200);
        } catch(Throwable $exception) {
            return response()->json(['msgError' => 'Error: No se encontraron usuarios. Causa: '.$exception->getMessage()], 500);
        }
    }

    /** Metodo para autenticar el acceso del usuario en el login
     * @param \Illuminate\Http\Request $consulta Arreglo de valores con los elementos enviados desde el cliente
     * @return \Illuminate\Http\RedirectResponse Redireccionamiento a la interfaz correspondiente, segun la respuesta obtenida */
    public function accesoLogin(Request $consulta){
        // Validar los campos del formulario login y deteminar los mensajes de error en caso de que no se cumplan las reglas establecidas
        $validador = Validator::make($consulta->all(), [
            'dirCorr' => 'required|email',
            'valPass' => 'required|regex:/^(?!\s+$)(?=\S{6,20}$)(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*[a-záéíóúüñ])(?=.*\d)(?=.*[^\w\s])[^\s]{6,20}$/u'
        ], [
            'dirCorr.required' => 'Error: Se debe ingresar el correo para poder acceder.',
            'dirCorr.email' => 'Error: El correo no corresponde a una dirección de correo valida.',
            'valPass.required' => 'Error: Se debe ingresar la contraseña para poder acceder.',
            'valPass.regex' => 'Error: La contraseña no cumple con los criterios de contraseña establecidos.',
        ]);

        // Regresar a la pantalla anterior agregando los errores de validación generados
        if($validador->fails())
            return back()->withErrors($validador);

        try {
            // Buscar al primer usuario que coincida con el correo ingresado en el login
            $usuario = User::where('Correo', '=', $consulta->dirCorr)->select(['Correo'])->first();

            // Regresar un error en caso de no encontrar al usuario
            if(!$usuario)
                return back()->withErrors(['dirCorr' => 'Error: El usuario ingresado no esta registrado.']);

            try {
                // Autenticar al usuario con la información ingresada en el formulario
                if(Auth::attempt(['Correo' => $consulta->dirCorr, 'password' => $consulta->valPass])) {
                    try {
                        // Actualizar la ultima fecha de acceso en la BD
                        $resActuFech = $this->nueValUltiAcc($consulta->dirCorr);

                        // Regresar un error si la respuesta de la actualización no trae información
                        if(!$resActuFech->getContent())
                            return back()->withErrors(['dirCorr' => 'Error: No se pudo completar el proceso de acceso.']);
                        
                        // Decodificar la respuesta de la actualización de fecha como arreglo asociativo
                        $resActuFechConve = $resActuFech->getData(true);
            
                        // Si se obtuvo un error en el proceso se regresará un error de sistema
                        if(array_key_exists('msgError', $resActuFechConve))
                            return back()->withErrors(['dirCorr' => $resActuFechConve['msgError']]);
            
                        // Si el usuario fue autenticado se regresa al formulario con mensaje satisfactorio
                        return back()->with(['results' => 'Acceso concedido. Bienvenido a Building Continuity']);
                    } catch(Throwable $exception) {
                        return back()->withErrors([ 'dirCorr' => 'Error: El usuario no pudo acceder. Causa: '.$exception->getMessage()]);
                    }
                } else {
                    return back()->withErrors(['dirCorr' => 'Error: Favor de revisar la información ingresada. El usuario no pudo acceder.']);
                }
            } catch (Throwable $exception2) {
                return back()->withErrors(['dirCorr' => 'Error: El usuario no fue autorizado para acceder. Causa: '.$exception2->getMessage()]);
            }
        } catch(Throwable $exception1) {
            return back()->withErrors(['dirCorr' => 'Error: No se obtuvo la información con respecto al usuario. Causa: '.$exception1->getMessage()]);
        }
    }

    /** Metodo para actualizar la fecha del ultimo acceso 
     * @param String $valDirCor Correo ingresado en el login
     * @return \Illuminate\Http\JsonResponse Respuesta JSON del resultado para la actualización de la fecha de acceso */
    public function nueValUltiAcc(String $valDirCor){
        try {
            // Buscar al primer usuario que coincida con el correo ingresado en el login
            // NOTA Futura: Si se obtendrá algun modelo de la BD y posteriormente se modificará alguno de sus campos, se deberá omitir el select si no se requiere extraer valores especificos. Pero si es el caso, se deberá incluir el campo de id de la tabla para que Eloquent identifique el registro donde actualizará el valor en cuestión por medio de su id.
            $usuario = User::where('Correo', '=', $valDirCor)->select(['ID_User', 'Nombre', 'UltimoAcceso'])->first();

            // Regresar un error en caso de no encontrar al usuario
            if(!$usuario)
                return response()->json(['msgError' => 'Error: El usuario en cuestión no existe.'], 404);

            try {
                // Crear el objeto helper para la fecha de acceso y generar una fecha
                $fechaAcceso = app(FechaServerHelper::class)->genFecha();
                
                // Establecer el valor del ultimo acceso
                $usuario->UltimoAcceso = $fechaAcceso;
                
                // Actualizar el valor
                $resActuUltiAcc = $usuario->save();

                // Regresar un error si el metodo de actualización regreso un "error", puesto que regresa un bool como resultado
                if(!$resActuUltiAcc)
                    return response()->json(['msgError' => 'Error: La fecha de acceso no fue actualizada.'], 500);

                // Establecer los valores de la sesion con la información del usuario para mostrar en el perfil
                session(['nomUserSes' => $usuario->Nombre]);
                session(['fechUltiAcc' => $fechaAcceso]);
                session(['dirCorSes' => $valDirCor]);

                // Regresar el mensaje de consulta realizada
                return response()->json(['results' => 'Fecha de acceso actualizada.'], 200);
            } catch (Throwable $exception2) {
                return response()->json(['msgError' => 'Error: Procedimiento de acceso corrompido. Causa: '.$exception2->getMessage()], 500);
            }
        } catch(Throwable $exception1) {
            return response()->json(['msgError' => 'Error: El usuario no fue encontrado. Causa: '.$exception1->getMessage()], 500);
        }
    }

    /** Metodo para actualizar la contraseña en el sistema
     * @param \Illuminate\Http\Request $consulta Arreglo de valores con los elementos enviados desde el cliente
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function actuContra(Request $consulta){
        // Agregar a la session la información de respuesta para el formulario en el front
        $consulta->session()->put('form', ['linkSoli' => $consulta->linkSis, 'datosUser' => $consulta->codigo.'/'.$consulta->nomPerso]);

        // Validar los campos enviados desde el cliente
        $validador = Validator::make($consulta->all(), [
            'nueValContra' => 'required|regex:/^(?!\s+$)(?=\S{6,20}$)(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*[a-záéíóúüñ])(?=.*\d)(?=.*[^\w\s])[^\s]{6,20}$/u',
            'confNueValContra' => 'required|regex:/^(?!\s+$)(?=\S{6,20}$)(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*[a-záéíóúüñ])(?=.*\d)(?=.*[^\w\s])[^\s]{6,20}$/u'
        ], [
            'nueValContra.required' => 'Error: El valor de la nueva contraseña no fue ingresado.',
            'nueValContra.regex' => 'Error: El valor de la nueva contraseña no cumple con los criterios establecidos.',
            'confNueValContra.required' => 'Error: El valor de la confirmación para la contraseña no fue ingresado.',
            'confNueValContra.regex' => 'Error: El valor de la confirmación para la contraseña no cumple con los criterios establecidos.',
        ]);

        // Regresar a la pagina anterior (usando redireccion) enviando por sesión los errores y los datos que necesitará el formulario para el envio
        if($validador->fails())
            return back()->withErrors($validador);
        
        // Evaluar si las contraseñas coinciden
        if(strcmp($consulta->nueValContra, $consulta->confNueValContra) !== 0)
            return back()->withErrors(['nueValContra' => 'Error: Las contraseñas no coinciden.']);

        try {
            // Verificar la existencia del usuario
            $usuario = User::where([
                ['Cod_User', '=', $consulta->codigo],
                ['Nombre', '=', $consulta->nomPerso]
            ])->select(['ID_User', 'Cod_User', 'Nombre', 'Contra'])->first();
    
            // Retornar error si no se encuentra al usuario solicitado
            if(!$usuario)
                return back()->withErrors(['nueValContra' => 'Error: El usuario que desea recuperar no se encuentra registrado.']);

            // Comparar el valor de la nueva contraseña con el actual para revisar si la nueva contraseña es diferente a la anterior
            if(Hash::check($consulta->nueValContra, $usuario->Contra))
                return back()->withErrors(['nueValContra' => 'Error: Favor de actualizar la contraseña apropiadamente.']);

            // Hashear la nueva contraseña y actualizarla en la BD
            try {
                /* Establecer el nuevo valor de la contraseña como un string hasheado si se cumplen todas condiciones a continuación:
                 * La consulta HTTP que llama la función tiene el parametro de entrada llamado "codigo" y si la información de este parametro es exactamente igual al parametro "Cod_User" obtenido del usuario en la BD
                 * La consulta HTTP que llama la función tiene el parametro de entrada llamado "nomPerso" y si la información de este parametro es exactamente igual al parametro "Nombre" obtenido del usuario en la BD */
                if(($consulta->has('codigo') && ($consulta->codigo === $usuario->Cod_User)) && ($consulta->has('nomPerso') && ($consulta->nomPerso === $usuario->Nombre)) && $consulta->has('nueValContra'))
                    $usuario->Contra = Hash::make($consulta->nueValContra);

                // Actualizar el valor de la contraseña en la BD
                $resActuPass = $usuario->save();

                // Regresar un error si no se pudo actualizar la contraseña
                if(!$resActuPass)
                    return back()->withErrors(['nueValContra' => 'Error: El sistema no pudo actualizar su contraseña. Favor de intentar nuevamente desde su correo.']);

                // Una vez actualizado el valor de la contraseña satisfactoriamente, se procederá con el borrado del link para caducarlo
                try {
                    $soliBorLink = app(LinkRecuController::class)->borLinkRecu($consulta->linkSis, 1);

                    // Regresar un error si la respuesta de la eliminación no trae información
                    if(!$soliBorLink->getContent())
                        return back()->withErrors(['nueValContra' => 'Error: El proceso de recuperación se vio interrumpido por causa del enlace de recuperación. Favor de intentar nuevamente desde su correo.']);

                    // Decodificar la respuesta de la eliminación del link de recuperación como arreglo asociativo
                    $soliBorLinkConve = $soliBorLink->getData(true);

                    // Si se obtuvo un error en el proceso se regresará un error de sistema
                    if(array_key_exists('msgError', $soliBorLinkConve))
                        return back()->withErrors(['nueValContra' => $soliBorLinkConve['msgError']]);

                    // Borrar la información sensible de la sesión y regresar al formulario de actualización para mostrar el mensaje de proceso concluido satisfactoriamente
                    $consulta->session()->forget('form');
                    return back()->with('results', 'La contraseña de '.$consulta->nomPerso.' fue actualizada exitosamente.');
                } catch(Throwable $exception3) {
                    return back()->withErrors(['nueValContra' => 'Error: El sistema no pudo procesar el enlace de recuperación apropiadamente. Causa: '.$exception3->getMessage()]);
                }
            } catch(Throwable $exception2) {
                return back()->withErrors(['nueValContra' => 'Error: El sistema no pudo actualizar su contraseña. Causa: '.$exception2->getMessage()]);
            }
        } catch(Throwable $exception1) {
            return back()->withErrors(['nueValContra' => 'Error: El sistema no pudo encontrar al usuario que desea actualizar. Causa: '.$exception1->getMessage()]);
        }
    }
}
