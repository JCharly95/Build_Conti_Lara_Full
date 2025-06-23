<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tipo_Sensor;
use App\Models\Sensor;
use Throwable;

class TipoSensorController extends Controller
{
    /** Metodo para regresar los tipos de sensores en el sistema
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function listaTipoSensores(){
        // Proteger la consulta
        try {
            // Obtener todos los tipos de sensores de la BD
            $senTipos = Tipo_Sensor::all();
    
            // Regresar un error si no se encontraron tipos de sensores
            if($senTipos->isEmpty())
                return response()->json(['msgError' => 'Error: No hay tipos de sensores.'], 404);
            
            // Regresar la lista de tipos de sensores encontrados
            return response()->json(['results' => $senTipos], 200);
        } catch(Throwable $exception) {
            return response()->json(['msgError' => 'Error: No se obtuvieron los tipos de sensores. Causa: '.$exception->getMessage()], $exception->getCode());
        }
    }

    /** Metodo para regresar todos los sensores que no esten nombrados 
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function listaSensoresNoRegi(){
        // Proteger la consulta de obtención del identificador foraneo de los sensores nombrados
        try {
            $listTipoID = Sensor::pluck('Tipo_ID');
            // Proteger la consulta unión para obtener los sensores que no esten nombrados (registrados)
            try {
                $listaSensores = Tipo_Sensor::whereNotIn('ID', $listTipoID)->select('ID', 'ID_')->get();
        
                // Regresar un error si no se encontraron sensores sin registrar
                if($listaSensores->isEmpty())
                    return response()->json(['msgError' => 'Error: No hay sensores sin registrar.'], 404);
                
                // Regresar la lista de sensores sin registrar
                return response()->json(['results' => $listaSensores], 200);
            } catch(Throwable $exception2) {
                return response()->json(['msgError' => 'Error: No se encontraron sensores sin registrar. Causa: '.$exception2->getMessage()], $exception2->getCode());
            }
        } catch(Throwable $exception1) {
            return response()->json(['msgError' => 'Error: No se obtuvieron los identificadores relacionales de los sensores nombrados. Causa: '.$exception1->getMessage()], $exception1->getCode());
        }
    }
}
