<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Link_Recu;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use App\Helpers\GenLinksHelper;
use App\Mail\RecuperacionEmail;
use Illuminate\Support\Facades\Mail;
use Throwable;

class LinkRecuController extends Controller
{
    /** Metodo para obtener todos los enlaces de recuperación guardados
     * @return \Illuminate\Http\JsonResponse - Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function listaEnlacesRecu(){
        // Proteger la petición para en caso de fallo, se le notifique al cliente
        try {
            // Obtener todos los enlaces de recuperación en el sistema
            $enlacesRecu = Link_Recu::all();
            
            // Regresar un error si no se encontraron enlaces
            if($enlacesRecu->isEmpty())
                return response()->json(['msgError' => 'Error: No hay enlaces de recuperación.'], 404);
    
            // Regresar la lista de sensores encontrados
            return response()->json(['results' => $enlacesRecu], 200);
        } catch(Throwable $exception) {
            return response()->json(['msgError' => 'Error: No se obtuvieron los enlaces de recuperación. Causa: '.$exception->getMessage()], 500);
        }
    }

    /** Metodo para obtener la ruta del sistema en base al enlace enviado en el correo 
     * @param string $linkCorreo - Link dinamico generado desde el sistema
     * @return \Illuminate\Http\RedirectResponse - Redireccionamiento hacia la interfaz correspondiente acorde a la respuesta obtenida */
    public function obteRutaActuSis(string $linkCorreo){
        // Validar el link enviado en la consulta desde el cliente
        $validador = Validator::make(['linkCorreo' => $linkCorreo], [
            'linkCorreo' => 'regex:/^[a-zA-Z\d-]{8}$/'
        ]);

        // Retornar error si el validador de enlaces falla
        if($validador->fails())
            return redirect()->route('main')->with('msgError', 'Error: El enlace de recuperación no es valido.');

        // Proteger la petición para en caso de fallo, se le notifique al cliente
        try {
            // Buscar la ruta de recuperación en la BD
            $rutaSis = Link_Recu::where('Link_Correo', '=', $linkCorreo)->value('Ruta_Sistema');
    
            // Regresar a la pagina anterior con un error si el no se encontro el enlace
            if(!$rutaSis)
                return redirect()->route('main')->with('msgError', 'Error: El enlace solicitado no existe o ya fue utilizado.');
    
            // Regresar a la pagina anterior enviando por sesión la información sobre el formulario a mostrar y el enlace utilizado en la petición
            return redirect()->route('vistaFormActu')->with('form', ['linkSoli' => $linkCorreo, 'datosUser' => $rutaSis]);
        } catch(Throwable $exception) {
            return redirect()->route('main')->with('msgError', 'Error: La obtención del enlace no fue realizada. Causa: '.$exception->getMessage());
        }
    }

    /** Metodo para generar el link de recuperación, guardarlo en la BD y enviar el correo de recuperación 
     * @param \Illuminate\Http\Request $consulta - Arreglo de valores con los elementos enviados desde el cliente
     * @return \Illuminate\Http\RedirectResponse - Redireccionamiento hacia la interfaz correspondiente acorde a la respuesta obtenida */
    public function crearUsuRecu(Request $consulta){
        // Validar los campos enviados en el formulario de solicitud
        $validador = Validator::make($consulta->all(), [
            'codUser' => 'required|regex:/^(?!.*\s{2,})([A-Z]{3}[-]?[\d]{4})$/',
            'nomUser' => 'required|regex:/^(?!.*\s{2,})([a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+(?:\s[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)*)$/',
            'apePatUser' => 'required|regex:/^(?!.*\s{2,})([a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)$/',
            'apeMatUser' => 'required|regex:/^(?!.*\s{2,})([a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)$/',
            'dirCorUser' => 'required|email'
        ], [
            'codUser.required' => 'Error: Se debe ingresar el codigo de usuario para continuar con la solicitud.',
            'codUser.regex' => 'Error: El codigo ingresado no corresponde a un codigo de usuario valido.',
            'nomUser.required' => 'Error: Se debe ingresar su(s) nombre(s) para continuar con la solicitud.',
            'nomUser.regex' => 'Error: La información ingresada en el campo de nombre contiene caracteres no validos.',
            'apePatUser.required' => 'Error: Se debe ingresar el apellido paterno para continuar con la solicitud.',
            'apePatUser.regex' => 'Error: El apellido paterno contiene caracteres no validos.',
            'apeMatUser.required' => 'Error: Se debe ingresar el apellido materno para continuar con la solicitud.',
            'apeMatUser.regex' => 'Error: El apellido materno contiene caracteres no validos.',
            'dirCorUser.required' => 'Error: Se debe ingresar el correo para continuar con la solicitud.',
            'dirCorUser.email' => 'Error: El correo no corresponde a una dirección de correo valida.',
        ]);

        // Regresar a la pagina anterior con los errores de validación generados
        if($validador->fails())
            return back()->withErrors($validador);

        try {
            // Buscar y obtener el usuario en la BD
            $infoUser = User::where([
                ['Cod_User', '=', $consulta->codUser],
                ['Nombre', '=', $consulta->nomUser],
                ['Ape_Pat', '=', $consulta->apePatUser],
                ['Ape_Mat', '=', $consulta->apeMatUser],
                ['Correo', '=', $consulta->dirCorUser]
            ])->select(['Cod_User', 'Correo'])->first();
    
            // Si no se encontró información del usuario se regresará a la interfaz de recuperación
            if(!$infoUser)
                return back()->withErrors(['codUser' => 'Error: El usuario solicitado no existe.']);

            try {
                // Antes de crear un nuevo link de recuperación, se consultará si no se cuenta con otro sin resolver
                $busLinkRecu = Link_Recu::where('Ruta_Sistema', '=', $consulta->codUser."/".$consulta->nomUser)->value('Link_Correo');

                // Regresar un error si se encontró un enlace de recuperación previo
                if($busLinkRecu)
                    return back()->withErrors(['dirCorUser' => 'Error: El usuario cuenta con una solicitud de renovación pendiente.']);

                // Crear el objeto helper y usar el metodo de generación de links aleatorios
                $linkRecuGen = app(GenLinksHelper::class)->generadorLinks();
        
                // Proteger la consulta de la creación del link aleatorio
                try {
                    // Guardar el link aleatorio en la base de datos asi como la ruta del sistema a la que apuntara el enrutamiento dinamico
                    $guardaLink = Link_Recu::create([
                        'Link_Correo' => $linkRecuGen,
                        'Ruta_Sistema' => $consulta->codUser."/".$consulta->nomUser
                    ]);
            
                    // Regresar un error si no se pudo registrar el link de recuperación
                    if(!$guardaLink)
                        return back()->withErrors(['dirCorUser' => 'Error: Proceso de recuperación interrumpido. Favor de intentar nuevamente.']);
        
                    // Proteger la consulta del envio del correo
                    try {
                        // Obtener la url de la aplicacion y el puerto de acceso
                        $urlApp = config("app.url");
                        $urlPort = config("app.port");
                        
                        // Enviar el correo de recuperación.
                        $enviarCorreo = Mail::to($consulta->dirCorUser)->send(new RecuperacionEmail([
                            'nombre' => $consulta->nomUser,
                            'apePat' => $consulta->apePatUser,
                            'apeMat' => $consulta->apeMatUser,
                            'dirEnvio' => $consulta->dirCorUser,
                            'linkRecuCor' => $urlApp.':'.$urlPort.'/actuAcc/'.$linkRecuGen
                        ]));
                        
                        // Revisar que el envio de correo se haya realizado
                        if(is_null($enviarCorreo))
                            return back()->withErrors(['dirCorUser' => 'Error: El correo de recuperación no pudo ser enviado.']);
                        
                        // Regresar la información encontrada en la BD
                        return back()->with('results', 'Correo de recuperación enviado. Favor de revisar su correo electronico para continuar con la renovación.');
                    } catch(Throwable $exception4) {
                        return back()->withErrors(['dirCorUser' => 'Error: El correo de recuperación no fue enviado. Causa: '.$exception4->getMessage()]);
                    }
                } catch(Throwable $exception3) {
                    return back()->withErrors(['dirCorUser' => 'Error: El enlace de recuperación no fue generado. Causa: '.$exception3->getMessage()]);
                }
            } catch(Throwable $exception2) {
                return back()->withErrors(['dirCorUser' => 'Error: Su solicitud tuvo que ser interrumpida. Causa: '.$exception2->getMessage()]);
            }
        } catch(Throwable $exception1) {
            return back()->withErrors(['codUser' => 'Error: El no se encontró información del usuario solicitado. Causa: '.$exception1->getMessage()]);
        }
    }

    /** Metodo para borrar el registro de recuperación para evitar un segundo uso 
     * @param string $linkRecuGen - Enlace dinamico generado por el sistema para la petición de actualización
     * @param int $origenPeti - Variable numerica para determinar de donde viene la petición y saber el tipo de respuesta a dar
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse - Redireccionamiento a la interfaz anterior con la respuesta o error obtenido. O, respuesta obtenida en formato JSON tanto mensaje de error como de mensaje satisfactorio */
    public function borLinkRecu(string $linkRecuGen, int $origenPeti){
        // Validar el link enviado en la consulta desde el cliente
        $validador = Validator::make(['linkSis' => $linkRecuGen], [
            'linkSis' => 'regex:/^[a-zA-Z\d-]{8}$/'
        ]);

        // Retornar error si el validador falla
        if($validador->fails())
            return ($origenPeti === 0) ? back()->withErrors(['linkSis' => 'Error: El enlace utilizado en esta sesión no es valido.'])
            : response()->json(['msgError' => 'Error: El enlace utilizado en esta sesión no es valido.'], 404);

        // Proteger la consulta para obtener el identificador del enlace
        try {
            // Obtener el ID del registro a eliminar
            $idLinkRecu = Link_Recu::where('Link_Correo', '=', $linkRecuGen)->value('ID_Link');
    
            // Regresar un error si el no se encontro el usuario
            if(!$idLinkRecu)
                return ($origenPeti === 0) ? back()->withErrors(['linkSis' => 'Error: El enlace de esta recuperación no existe o ya fue eliminado.'])
                : response()->json(['msgError' => 'Error: El enlace de esta recuperación no existe o ya fue eliminado.'], 500);

            // Proteger la consulta para borrar el enlace de recuperación
            try {
                // Borrar el registro de la recuperación (en este caso se usa destroy, porque previamente se obtuvo el id del registro)
                $resBorRecu = Link_Recu::destroy($idLinkRecu);
        
                // Regresar un error si el registro no fue eliminado
                if(!$resBorRecu)
                    return ($origenPeti === 0) ? back()->withErrors(['linkSis' => 'Error: El enlace de esta sesión no pudo ser eliminado.'])
                    : response()->json(['msgError' => 'Error: El enlace de esta sesión no pudo ser eliminado.'], 500);
                
                // Regresar el mensaje de eliminación exitosa
                return ($origenPeti === 0) ? back()->with('results', 'El enlace de esta solicitud fue eliminado con exito.')
                : response()->json(['results' => 'El enlace de esta solicitud fue eliminado con exito.'], 200);
            } catch(Throwable $exception2) {
                return ($origenPeti === 0) ? back()->withErrors(['linkSis' => 'Error: El enlace de recuperación no fue eliminado. Causa: '.$exception2->getMessage()])
                : response()->json(['msgError' => 'Error: El enlace de recuperación no fue eliminado. Causa: '.$exception2->getMessage()], 500);
            }
        } catch(Throwable $exception1) {
            return ($origenPeti === 0) ? back()->withErrors(['linkSis' => 'Error: El enlace de la recuperación no fue encontrado. Causa: '.$exception1->getMessage()])
            : response()->json(['msgError' => 'Error: El enlace de la recuperación no fue encontrado. Causa: '.$exception1->getMessage()], 500);
        }
    }
}
