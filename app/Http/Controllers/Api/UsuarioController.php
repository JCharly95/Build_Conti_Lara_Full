<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
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
            'valPass.regex' => 'La contraseña no cumple con los criterios de contraseña establecidos.',
        ]);

        // Regresar a la pantalla anterior agregando los errores de validación generados
        if($validador->fails())
            return back()->withErrors($validador);

        // Verificar si el usuario existe y autenticar la información ingresada en el formulario
        if(Auth::attempt(['Correo' => $consulta->dirCorr, 'Contra' => $consulta->valPass])){
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
                        'dirCorr' => 'Actualización de la fecha de acceso erronea.',
                        'valPass' => 'No se pudo actualizar la fecha del ultimo acceso.'
                    ]);
                
                // Decodificar la respuesta de la actualización de fecha como arreglo asociativo
                $resActuFechConve = $resActuFech->getData(true);
    
                // Si se obtuvo un error en el proceso se regresará un error de sistema
                if(array_key_exists('msgError', $resActuFechConve))
                    return back()->withErrors([
                        'dirCorr' => $resActuFechConve['msgError']
                    ]);

                // Establecer la dirección de correo para la sesión
                $consulta->session()->put('fechUltiAcc', $fechAcc);
    
                // Si el usuario fue encontrado y autenticado se redirige a la pagina principal, la grafica
                return redirect()->intended('/grafica');
            } catch(Throwable $exception) {
                return back()->withErrors([
                    'dirCorr' => 'El usuario no pudo ser autenticado. Causa: '.$exception->getMessage()
                ]);
            }
        } else {
            // Regresar al formulario de acceso, modificando el mensaje de error a mostrar
            return back()->withErrors([
                'dirCorr' => 'No se encontró el usuario registrado.'
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

                // Regresar el mensaje de consulta realizada
                return response()->json(['results' => 'Fecha de acceso actualizada.'], 200);
            } catch (Throwable $exception2) {
                return response()->json(['msgError' => 'Error: La fecha de acceso no fue actualizada. Causa: '.$exception2->getMessage()], $exception2->getCode());
            }
        } catch(Throwable $exception1) {
            return response()->json(['msgError' => 'Error: El usuario no fue encontrado. Causa: '.$exception1->getMessage()], $exception1->getCode());
        }
    }

    /** Metodo para buscar un usuario para recuperación de acceso 
     * @param \Illuminate\Http\Request $consulta Arreglo de valores con los elementos enviados desde el cliente
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function buscarUsuarioRecu(Request $consulta){
        // Validar los campos enviados desde el cliente
        $validador = Validator::make($consulta->all(), [
            'codUser' => 'required|regex:/^(?!.*\s{2,})([A-Z]{3}[-]?[\d]{4})$/',
            'nomUser' => 'required|regex:/^(?!.*\s{2,})([a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+(?:\s[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)*)$/',
            'apePatUser' => 'required|regex:/^(?!.*\s{2,})([a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)$/',
            'apeMatUser' => 'required|regex:/^(?!.*\s{2,})([a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)$/',
            'dirCorUser' => 'required|email'
        ]);

        // Retornar error si el validador falla
        if($validador->fails()){
            return back()->withErrors([
                'codUser' => 'El codigo de usuario no es valido.',
                'nomUser' => 'El nombre o los nombres no son validos, favor de revisar la información.',
                'apePatUser' => 'El apellido paterno no es valido.',
                'apeMatUser' => 'El apellido materno no es valido.',
                'dirCorUser' => 'La dirección de correo no es valida'
            ]);
        }

        // Buscar y obtener el usuario en la BD
        $infoRes = User::where([
            ['Cod_User', '=', $consulta->codUser],
            ['Nombre', '=', $consulta->nomUser],
            ['Ape_Pat', '=', $consulta->apePatUser],
            ['Ape_Mat', '=', $consulta->apeMatUser],
            ['Correo', '=', $consulta->dirCorUser]
        ])->select(['Cod_User', 'Correo'])->first();

        // Si no se encontró información del usuario se regresará a la interfaz de recuperación
        if(!$infoRes){
            return back()->withErrors([
                'codUser' => 'El usuario solicitado no existe.'
            ]);
        }

        // Regresar la información encontrada en la BD
        //return response()->json(['results' => $infoRes], 200);
    }

    public function obteUltiAcc(){
        // Obtener la información de la sesión
        //$usuario = User::where('Correo', '=', $dirEmaSes)->select(['Cod_User', 'Correo'])->first();

        // Retornar error si el validador falla
        /*if(!$usuario)
            return response()->json(['msgError' => 'Error: El usuario que se referencia no existe.'], 500);
        */

    }

    /** Metodo para actualizar la contraseña 
     * @param \Illuminate\Http\Request $consulta Arreglo de valores con los elementos enviados desde el cliente
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function nueValContra(Request $consulta){
        // Primero se verifica que el usuario en cuestion exista
        $usuario = User::where([
            ['Cod_User', '=', $consulta->codigo],
            ['Nombre', '=', $consulta->nomPerso]
        ])->select(['Cod_User', 'Correo'])->first();

        // Retornar error si el validador falla
        if(!$usuario)
            return response()->json(['msgError' => 'Error: El usuario no existe.'], 404);

        // Validar los campos enviados desde el cliente
        $validador = Validator::make($consulta->all(), [
            'codigo' => 'required|regex:/^(?!.*\s{2,})([A-Z]{3}[-]?[\d]{4})$/',
            'nomPerso' => 'required|regex:/^(?!.*\s{2,})([a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+(?:\s[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)*)$/',
            'nContraVal' => 'required|regex:/^(?!\s+$)(?=\S{6,20}$)(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*[a-záéíóúüñ])(?=.*\d)(?=.*[^\w\s])[^\s]{6,20}$/u'
        ]);

        // Retornar error si el validador falla
        if($validador->fails())
            return response()->json(['msgError' => 'Error: Favor de revisar la información que utilizó para la actualización de datos.'], 500);

        // Establecer el valor del campo contraseña hasheado (por defecto con 12 rondas) si la consulta desde el cliente trae los campos requeridos
        if($consulta->has('codigo') && $consulta->has('nomPerso') && $consulta->has('nContraVal'))
            $usuario->Contra = Hash::make($consulta->nContraVal);
        
        // Actualizar el valor
        $usuario->save();

        // Regresar el mensaje de consulta realizada
        return response()->json(['results' => 'La información de '.$consulta->nomPerso.' fue actualizada exitosamente.'], 200);

        // Pendiente; tengo la duda de ver como crear un "catch" para casos donde no se realice la actualización del registro efectivamente.
    }
}
