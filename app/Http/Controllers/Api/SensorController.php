<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Sensor;
use Illuminate\Support\Facades\Validator;
use App\Models\Tipo_Sensor;
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
            $listaSenRegi = Sensor::select('sensor.ID_Sensor' ,'sensor.Nombre', 'history_type_map.ID_', 'history_type_map.VALUEFACETS')->join('history_type_map', 'sensor.Tipo_ID', '=', 'history_type_map.ID')->get();
    
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
                if($sensor['ID_'] == $consulta->idNiagSensor)
                    return back()->withErrors(['nomSensor' => 'Error: El sensor que desea registrar ya existe en el sistema.']);
            }
        } catch(Throwable $exception) {
            return back()->withErrors(['nomSensor' => 'Error: El sistema no pudo encontrar sensores registrados. Causa: '.$exception->getMessage()]);
        }
        
        // Si no se ha regresado error hasta este punto, continuamos con el proceso, en este caso validar los campos
        $validador = Validator::make($consulta->all(), [
            'nomSensor' => 'required',
            'idNiagSensor' => 'required'
        ], [
            'nomSensor.required' => 'Error: Favor de ingresar el nombre del sensor para ser registrado.',
            'idNiagSensor.required' => 'Error: Favor de seleccionar uno de los sensores disponibles.'
        ]);

        // Retornar error si el validador falla
        if($validador->fails())
            return back()->withErrors($validador);

        // Proteger la consulta para la obtención del ID del tipo de sensor
        try {
            // Obtener el id del tipo de sensor a registrar
            $idTipoSen = Tipo_Sensor::where('ID_', '=', $consulta->idNiagSensor)->value('ID');
    
            // Regresar un error porque no se encontró el id del tipo de sensor
            if(!$idTipoSen)
                return back()->withErrors(['idNiagSensor' => 'Error: No se encontró el sensor con el identificador niagara seleccionado.']);
            
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
            return back()->withErrors(['idNiagSensor' => 'Error: no se encontró algun sensor con la denominación niagara dada. Causa: '.$exception1->getMessage()]);
        }
    }
}
