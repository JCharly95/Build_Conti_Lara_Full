<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tipo_Sensor;
use App\Models\Sensor;
use Throwable;

class TipoSensorController extends Controller
{
    /** Metodo para regresar los tipos de sensores en el sistema
     * @return \Illuminate\Http\JsonResponse - Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
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
            return response()->json(['msgError' => 'Error: No se obtuvieron los tipos de sensores. Causa: '.$exception->getMessage()], 500);
        }
    }

    /** Metodo para regresar todos los sensores que no esten nombrados
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function listaSensoresNoRegi(){
        // Proteger la consulta de obtención del identificador foraneo de los sensores nombrados
        // NOTA: La consulta cruda seria: SELECT ID, ID_ FROM history_type_map WHERE ID NOT IN(SELECT Tipo_ID FROM sensor); Y en el caso de laravel; pluck seria el reemplazo de la consulta dentro del parentesis
        try {
            // Obtener todos los valores correspondientes a una clave, o en este caso, al nombre de una columna
            $listTipoID = Sensor::pluck('Tipo_ID');

            // Proteger la consulta para obtener los sensores que no esten nombrados (registrados)
            try {
                // Obtener los tipos de sensores niagara donde se evaluará si la lista de sensores registrados obtenida previamente no está vacia. Si fue el caso se aplica una exclusión de valores para los registros que se encuentren relacionados con la tabla de sensores. En caso contrario, se obtendrán todos los registros (es decir, cuando no haya sensores registrados). NOTA: use(...) se usa para pasar valores a funciones que se ejecuten de forma anexa al contexto (scope, como las funciones asincronas que tienen su espacio aparte) y requieran de valores para su operación
                $listaSensores = Tipo_Sensor::when(!empty($listTipoID), function ($consulta) use($listTipoID){
                    return $consulta->whereNotIn('ID', $listTipoID);
                })->orderBy('ID')->select('ID', 'ID_')->get();
        
                // Regresar un error si no se encontraron sensores sin registrar
                if($listaSensores->isEmpty())
                    return response()->json(['msgError' => 'Error: El sistema no tiene sensores registrados.'], 404);
                
                // Regresar la lista de sensores sin registrar
                return response()->json(['results' => $listaSensores], 200);
            } catch(Throwable $exception2) {
                return response()->json(['msgError' => 'Error: No se encontraron sensores sin registrar. Causa: '.$exception2->getMessage()], 500);
            }
        } catch(Throwable $exception1) {
            return response()->json(['msgError' => 'Error: No se pudieron descartar los sensores registrados en la busqueda de los sensores sin registrar. Causa: '.$exception1->getMessage()], 500);
        }
    }
}
