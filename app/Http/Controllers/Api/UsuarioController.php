<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Throwable;

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

    /** Metodo para autenticar el acceso de los usuarios
     * @param \Illuminate\Http\Request $consulta Arreglo de valores con los elementos enviados desde el cliente
     * @return \Illuminate\Http\RedirectResponse Redireccionamiento a la interfaz correspondiente, segun la respuesta obtenida */
    public function buscarUsuario(Request $consulta){
        // Validar los campos del login enviados desde el cliente
        $validador = Validator::make($consulta->all(), [
            'dirCorr' => 'required|email',
            'valPass' => 'required|regex:/^(?!\s+$)(?=\S{6,20}$)(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*[a-záéíóúüñ])(?=.*\d)(?=.*[^\w\s])[^\s]{6,20}$/u'
        ]);

        // Regresar a la pantalla anterior agregando los errores de validación, si no se cumplen
        if($validador->fails()){
            return back()->withErrors([
                'dirCorr' => 'El correo no fue ingresado o no corresponde a una dirección de correo valida.',
                'valPass' => 'La contraseña no fue ingresada o no cumple con los criterios de contraseña establecidos.'
            ]);
        }

        // Verificar si el usuario existe y autenticar la información ingresada en el formulario
        /*if(Auth::attempt(['Correo' => $consulta->dirCorr, 'Contra' => $consulta->valPass])){
            // Si el usuario fue encontrado y autenticado se redirige a la pagina principal, la grafica
            return redirect()->intended('/grafica');
        } else {
            return back()->withErrors([
                'dirCorr' => 'No se encontró usuario registrado.'
            ]);
        }*/
        return redirect()->intended('/grafica');
    }

    /** Metodo para buscar un usuario para recuperación de acceso 
     * @param \Illuminate\Http\Request $consulta Arreglo de valores con los elementos enviados desde el cliente
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    /** */
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

    /** Metodo para actualizar la fecha del ultimo acceso 
     * @param \Illuminate\Http\Request $consulta Arreglo de valores con los elementos enviados desde el cliente
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function nueValUltiAcc(Request $consulta){
        // Primero se verifica que el usuario en cuestion exista
        $usuario = User::where('Correo', '=', $consulta->correo)->select(['Cod_User', 'Correo'])->first();

        // Retornar error si el validador falla
        if(!$usuario)
            return response()->json(['msgError' => 'Error: El usuario que se referencia no existe.'], 500);

        // Validar los campos enviados desde el cliente
        $validador = Validator::make($consulta->all(), [
            'correo' => 'required|email',
            'fechLAcc' => 'required',
        ]);

        // Retornar error si el validador falla
        if($validador->fails())
            return response()->json(['msgError' => 'Error: Actualización de ultimo acceso corrompida.'], 500);

        // Establecer el valor del campo ultimo acceso si la consulta desde el cliente trae los campos requeridos
        if($consulta->has('correo') && $consulta->has('fechLAcc'))
            $usuario->UltimoAcceso = $consulta->fechLAcc;
        
        // Actualizar el valor
        $usuario->save();

        // Regresar el mensaje de consulta realizada
        return response()->json(['results' => 'La fecha de acceso fue actualizada.'], 200);
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
