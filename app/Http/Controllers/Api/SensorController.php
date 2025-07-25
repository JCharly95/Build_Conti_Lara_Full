<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Sensor;
use Illuminate\Support\Facades\Validator;
use App\Models\Tipo_Sensor;
use Illuminate\Database\Query\JoinClause;
use Throwable;

class SensorController extends Controller
{
    /** Metodo para regresar todos los sensores nombrados
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function listaSensores(){
        // Proteger la consulta
        try {
            // Obtener todos los sensores de la BD usando el modelo para buscarlos
            $sensores = Sensor::all();
    
            // Regresar un error si no se encontraron sensores
            if($sensores->isEmpty())
                return response()->json(['msgError' => 'Error: No hay sensores nombrados.'], 404);
    
            // Regresar la lista de sensores encontrados
            return response()->json(['results' => $sensores], 200);
        } catch(Throwable $exception) {
            return response()->json(['msgError' => 'Error: No se obtuvieron los sensores nombrados. Causa: '.$exception->getMessage()], 500);
        }
    }

    /** Metodo para regresar todos los sensores que estan registrados con la relación de los tipos de sensores
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function listaSenRegi(){
        // Proteger la consulta
        try {
            $listaSenRegi = Sensor::select('sensor.ID_Sensor' ,'sensor.Nombre', 'history_type_map.ID_', 'history_type_map.VALUEFACETS')->join('history_type_map', 'sensor.Tipo_ID', '=', 'history_type_map.ID')->orderBy('sensor.ID_Sensor')->get();
    
            // Regresar un error si no se encontraron los sensores
            if($listaSenRegi->isEmpty())
                return response()->json(['msgError' => 'Error: No hay sensores registrados.'], 404);
            
            // Regresar la lista de sensores encontrados
            return response()->json(['results' => $listaSenRegi], 200);
        } catch(Throwable $exception) {
            return response()->json(['msgError' => 'Error: No se encontraron sensores registrados. Causa: '.$exception->getMessage()], 500);
        }
    }

    /** Metodo para registrar/nombrar un sensor 
     * @param \Illuminate\Http\Request $consulta Arreglo de valores con los elementos enviados desde el cliente
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function regiSensor(Request $consulta){
        // Agregar a la sesión el formulario que se mostrará en el contenedor de formularios internos en caso de regresar con errores o al finalizar el registro
        $consulta->session()->put('formuSoli', "Registro_Sensor");

        // Validar la información enviada desde el formulario
        $validador = Validator::make($consulta->all(), [
            'nomSensor' => 'required|regex:/[^a-zA-Z\d\-\_ ]+/g',
            'idNiagSensor' => 'required'
        ], [
            'nomSensor.required' => 'Error: Favor de ingresar el nombre del sensor para ser registrado.',
            'nomSensor.regex' => 'Error: El nombre ingresado contiene caracteres no permitidos, favor de ingresar un nombre valido.',
            'idNiagSensor.required' => 'Error: Favor de seleccionar uno de los sensores disponibles.'
        ]);

        // Retornar error si el validador falla
        if($validador->fails())
            return back()->withErrors($validador);
        
        // Si la validación no regreso errores, el siguiente paso es buscar si el sensor a registrar ya existe en el sistema
        try {
            // Obtener la lista de sensores registrados
            $sensoRegi = $this->listaSenRegi();

            // Regresar un error si la respuesta de los sensores no trae información
            if(!$sensoRegi->getContent())
                return back()->withErrors(['idNiagSensor' => 'Error: El sistema no encontró parte de la información vitalicia para el proceso. Favor de intentar nuevamente.']);

            // Decodificar la respuesta de la lista de sensores registrados como arreglo asociativo
            $senDatos = $sensoRegi->getData(true);

            // Si se obtuvo un error de busqueda se regresará un error de procesamiento del sistema
            if(array_key_exists('msgError', $senDatos))
                return back()->withErrors(['idNiagSensor' => $senDatos['msgError']]);

            // Si no, se recorrera el resultado en busqueda de algún registro previo
            foreach($senDatos['results'] as $sensor) {
                if($sensor['ID_'] == $consulta->idNiagSensor || $sensor['Nombre'] == $consulta->nomSensor) {
                    if($sensor['ID_'] == $consulta->idNiagSensor)
                        return back()->withErrors(['idNiagSensor' => 'Error: El sensor que desea registrar ya existe en el sistema.']);
                    
                    if($sensor['Nombre'] == $consulta->nomSensor)
                        return back()->withErrors(['nomSensor' => 'Error: El nombre que desea utilizar ya esta existe en el sistema y esta relacionado a otro sensor.']);
                }
            }
        } catch(Throwable $exception) {
            return back()->withErrors(['nomSensor' => 'Error: El sistema no pudo encontrar sensores registrados. Causa: '.$exception->getMessage()]);
        }

        // Proteger la consulta para la obtención del ID del tipo de sensor
        try {
            // Obtener el id del tipo de sensor a registrar
            $idTipoSen = Tipo_Sensor::where('ID_', '=', $consulta->idNiagSensor)->value('ID');
    
            // Regresar un error porque no se encontró el id del tipo de sensor
            if(!$idTipoSen)
                return back()->withErrors(['idNiagSensor' => 'Error: No hay sensores con el identificador seleccionado.']);
            
            // Proteger la consulta para el registro del sensor
            try {
                // Registrar/nombrar el sensor en el sistema para identificarlo con un nombre propio
                $sensor = Sensor::create([
                    'Nombre' => $consulta->nomSensor,
                    'Tipo_ID' => $idTipoSen
                ]);

                // Regresar un error si no se pudo registrar el sensor
                if(!$sensor)
                    return back()->withErrors(['nomSensor' => 'Error: El sensor '.$consulta->nomSensor.' no pudo ser registrado.']);
                
                // Regresar al usuario al formulario de registro con el mensaje de proceso concluido satisfactoriamente
                return back()->with('results', 'El sensor '.$consulta->nomSensor.' fue registrado exitosamente.');
                // Redireccionar al usuario al formulario de registro con mensaje de proceso concluido satisfactoriamente
                //return redirect()->route('vistaFormInterno')->with('results', 'El sensor '.$consulta->nomSensor.' fue registrado exitosamente.');
            } catch(Throwable $exception2) {
                return back()->withErrors(['nomSensor' => 'Error: El sensor '.$consulta->nomSensor.' no fue registrado. Causa: '.$exception2->getMessage()]);
            }
        } catch(Throwable $exception1) {
            return back()->withErrors(['idNiagSensor' => 'Error: No se encontró algun sensor con la denominación dada. Causa: '.$exception1->getMessage()]);
        }
    }

    /** Metodo para actualizar la información de un sensor ya registrado
     * @param \Illuminate\Http\Request $consulta Arreglo de valores con los elementos enviados desde el cliente
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function editarSensor(Request $consulta){
        // Agregar a la sesión el formulario que se mostrará en el contenedor de formularios internos en caso de regresar con errores o al finalizar el registro
        $consulta->session()->put('formuSoli', "Edicion_Sensor");

        // Validar la información proveniente del formulario
        $validador = Validator::make($consulta->all(), [
            'nomSensor' => 'required|regex:/[^a-zA-Z\d\-\_ ]+/g',
            'idNiagSensor' => 'required'
        ], [
            'nomSensor.required' => 'Error: Favor de ingresar el nuevo nombre del sensor para actualizar.',
            'nomSensor.regex' => 'Error: El nuevo nombre contiene caracteres no permitidos, favor de ingresar un nombre valido.',
            'idNiagSensor.required' => 'Error: Favor de seleccionar uno de los sensores disponibles para actualizar.'
        ]);

        // Retornar error si el validador falla
        if($validador->fails())
            return back()->withErrors($validador);

        // Una vez validados los campos del formulario, evaluar los valores por defecto para regresarlos como error
        if(strcmp($consulta->nomSensor, 'Esperando selección') || strcmp($consulta->idNiagSensor, 'Esperando selección') || str_contains($consulta->idNiagSensor, 'Seleccione') || str_contains($consulta->idNiagSensor, 'Error')) {
            if(strcmp($consulta->nomSensor, 'Esperando selección'))
                return back()->withErrors(['nomSensor' => 'Error: No se ingresó un nuevo nombre. Favor de hacerlo.']);

            if(strcmp($consulta->idNiagSensor, 'Esperando selección') || str_contains($consulta->idNiagSensor, 'Seleccione'))
                return back()->withErrors(['idNiagSensor' => 'Error: No hubo una selección de sensor. Favor de hacerlo.']);
            
            return back()->withErrors(['idNiagSensor' => 'Error: No se obtuvo la información del sensor. Favor de intentar nuevamente.']);
        }

        // Buscar el primer sensor basados en la información provista por los campos del formulario (nombre e identificador niagara). NOTA: Recordar que la función de consulta avanzada del join trabaja en otro contexto (scope) por lo que es necesario enviarle la variable de consulta
        try {
            $senEval = Sensor::select('sensor.ID_Sensor' ,'sensor.Nombre', 'sensor.Tipo_ID', 'history_type_map.ID_')->join('history_type_map', function(JoinClause $join) use($consulta) {
                $join->on('sensor.Tipo_ID', '=', 'history_type_map.ID')
                ->where('sensor.Nombre', '=', $consulta->nomSensor)
                ->orWhere('history_type_map.ID_', '=', $consulta->idNiagSensor);
            })->orderBy('sensor.ID_Sensor')->first();

            // Caso 3 de cambio de valores; se actualizarón ambos campos, lo que procede a un "registro"
            if($senEval->isEmpty()) {
                // Pendiente, revisar si se invocará el metodo de registro, si se integrará el codigo a este metodo o se creará uno nuevo para respuestas json
            }

            try {
                // Buscar el registro del sensor usando su key o lanzar un error si no se encontró
                $sensor = Sensor::findOrFail($senEval->ID_Sensor);
                
                // Primer caso; evaluar si el nombre del sensor cambió, actualizarlo y regresarlo al formulario de edición con su respectivo mensaje exitoso
                if($sensor->Nombre != $consulta->nomSensor) {
                    try {
                        $sensor->Nombre = $consulta->nomSensor;
                        $resActuNom = $sensor->save();

                        if(!$resActuNom)
                            return back()->withErrors(['nomSensor' => 'Error: No se actualizó el nombre del sensor, favor de intentar nuevamente.']);

                        return back()->with(['results', 'El sensor '.$senEval->Nombre.' paso a llamarse: '.$sensor->Nombre.' exitosamente.']);
                    } catch (Throwable $exception3) {
                        return back()->withErrors(['nomSensor' => 'Error: No se pudo actualizar el nombre del sensor. Causa: '.$exception3->getMessage()]);
                    }
                }

                // Segundo caso; evaluar si se cambio el identificador niagara relacionado, actualizarlo y regresarlo al formulario de edición con su respectivo mensaje exitoso
                if($senEval->ID_ != $consulta->idNiagSensor) {
                    try {
                        // Obtener el id del tipo de sensor que se actualizará la clave foranea del sensor
                        $idTipoSen = Tipo_Sensor::where('ID_', '=', $consulta->idNiagSensor)->value('ID');
                
                        // Regresar un error porque no se encontró el id del tipo de sensor
                        if(!$idTipoSen)
                            return back()->withErrors(['idNiagSensor' => 'Error: No hay sensores que contengan el identificador dado.']);

                        try {
                            $sensor->Tipo_ID = $idTipoSen;
                            $resActuTipID = $sensor->save();

                            if(!$resActuTipID)
                                return back()->withErrors(['idNiagSensor' => 'Error: No se actualizó el identificador del sensor, favor de intentar nuevamente.']);

                            return back()->with(['results', 'El sensor '.$sensor->Nombre.' cambió su referencia de: '.$senEval->ID_.' a: '.$consulta->idNiagSensor.' exitosamente.']);
                        } catch (Throwable $exception5) {
                            return back()->withErrors(['idNiagSensor' => 'Error: No se pudo actualizar el identificador del sensor. Causa: '.$exception5->getMessage()]);
                        }
                    } catch(Throwable $exception4) {
                        return back()->withErrors(['idNiagSensor' => 'Error: No se encontraron sensores con el identificador seleccionado. Causa: '.$exception4->getMessage()]);
                    }
                }
            } catch(Throwable $exception2) {
                return back()->withErrors(['nomSensor' => 'Error: No se pudo encontrar el sensor solicitado. Causa: '.$exception2->getMessage()]);
            }
        } catch(Throwable $exception1) {
            return back()->withErrors(['idNiagSensor' => 'Error: No se pudieron encontrar sensores registrados con la información dada. Causa: '.$exception1->getMessage()]);
        }
    }
}
