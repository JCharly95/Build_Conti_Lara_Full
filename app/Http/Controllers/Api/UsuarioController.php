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
            return response()->json(['msgError' => 'Error: No se encontraron usuarios. Causa: '.$exception->getMessage()], $exception->getCode());
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

        // Verificar si el usuario existe y autenticar la información ingresada en el formulario
        if(Auth::attempt(['Correo' => $consulta->dirCorr, 'Contra' => $consulta->valPass])) {
            // Crear el objeto helper para generar la fecha de acceso
            $fechAcc = app(FechaServerHelper::class)->genFecha();

            // Obtener el correo ingresado
            $correo = $consulta->dirCorr;

            try {
                // Actualizar la fecha de acceso en la BD
                $resActuFech = $this->nueValUltiAcc($correo, $fechAcc);

                // Regresar un error si la respuesta de la actualización no trae información
                if(!$resActuFech->getContent())
                    return back()->withErrors([
                        'dirCorr' => 'Error: Actualización de la fecha de acceso erronea.',
                        'valPass' => 'Error: No se pudo actualizar la fecha del ultimo acceso.'
                    ]);
                
                // Decodificar la respuesta de la actualización de fecha como arreglo asociativo
                $resActuFechConve = $resActuFech->getData(true);
    
                // Si se obtuvo un error en el proceso se regresará un error de sistema
                if(array_key_exists('msgError', $resActuFechConve))
                    return back()->withErrors(['dirCorr' => $resActuFechConve['msgError']]);
    
                // Si el usuario fue encontrado y autenticado se redirige a la pagina principal, la grafica
                return redirect()->intended('grafica');
            } catch(Throwable $exception) {
                return back()->withErrors([
                    'dirCorr' => 'Error: El usuario no pudo ser autenticado. Causa: '.$exception->getMessage()
                ]);
            }
        } else {
            // Regresar al formulario de acceso, modificando el mensaje de error a mostrar
            return back()->withErrors([
                'dirCorr' => 'Error: No se encontró el usuario registrado.'
            ]);
        }
    }

    /** Metodo para actualizar la fecha del ultimo acceso 
     * @param String $valDirCor Correo ingresado en el login
     * @param String $fechaAcceso Fecha de acceso obtenida al autenticar
     * @return \Illuminate\Http\JsonResponse Respuesta JSON del resultado para la actualización de la fecha de acceso */
    public function nueValUltiAcc(String $valDirCor, String $fechaAcceso){
        try {
            // Buscar al primer usuario que coincida con el correo ingresado en el login
            $usuario = User::where('Correo', '=', $valDirCor)->select(['Nombre', 'UltimoAcceso'])->first();

            // Regresar un error en caso de no encontrar al usuario
            if(!$usuario)
                return response()->json(['msgError' => 'Error: El usuario en cuestión no existe.'], 404);

            try {
                // Establecer el valor del ultimo acceso
                $usuario->UltimoAcceso = $fechaAcceso;

                // Actualizar el valor
                $usuario->save();

                // Establecer los valores de la sesion con la información del usuario para mostrar en el perfil
                session(['nomUserSes' => $usuario->Nombre]);
                session(['fechUltiAcc' => $fechaAcceso]);
                session(['dirCorSes' => $valDirCor]);

                // Regresar el mensaje de consulta realizada
                return response()->json(['results' => 'Fecha de acceso actualizada.'], 200);
            } catch (Throwable $exception2) {
                return response()->json(['msgError' => 'Error: La fecha de acceso no fue actualizada. Causa: '.$exception2->getMessage()], $exception2->getCode());
            }
        } catch(Throwable $exception1) {
            return response()->json(['msgError' => 'Error: El usuario no fue encontrado. Causa: '.$exception1->getMessage()], $exception1->getCode());
        }
    }

    /** Metodo para actualizar la contraseña en el sistema
     * @param \Illuminate\Http\Request $consulta Arreglo de valores con los elementos enviados desde el cliente
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function actuContra(Request $consulta){
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

        // Retornar error si el validador falla
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
            ])->select(['Cod_User', 'Correo'])->first();
    
            // Retornar error si el validador falla
            if(!$usuario)
                return back()->withErrors(['nueValContra' => 'Error: El usuario que desea recuperar no se encuentra registrado.']);

            // Autenticar para revisar si la nueva contraseña es diferente a la anterior
            if(Auth::attempt(['Contra' => $consulta->nueValContra]))
                return back()->withErrors(['nueValContra' => 'Error: Favor de actualizar la contraseña apropiadamente.']);

            // Hashear la nueva contraseña y actualizarla en la BD
            try {
                // Establecer el nuevo valor de la contraseña como una cadena de caracteres debidamente hasheada
                if($consulta->has('codigo') && $consulta->has('nomPerso') && $consulta->has('nueValContra'))
                    $usuario->Contra = Hash::make($consulta->nueValContra);

                // Actualizar el valor de la contraseña en la BD
                $usuario->save();

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

                    // Para este punto todo salio bien y se regresa el aviso de actualización completada
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
