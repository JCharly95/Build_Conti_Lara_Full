<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Registro_Sensor;
use Illuminate\Support\Facades\Validator;
use App\Helpers\ProcReduRegiHelper;
use Throwable;

class RegistroSensorController extends Controller
{   
    /* Ejemplo de consulta con filtrado de datos usando Eloquent (ORM de Laravel):
    $flights = Flight::where('active', 1)
        ->orderBy('name')
        ->take(10)
        ->get();
    Nota para la elaboracion de la consultas:
    Se debe usar get() al final si se busca obtener multiples registros y first() en caso de requerir un solo registro. */

    /** Metodo para regresar los primeros 10 registros de sensores en el sistema 
     * @param \Illuminate\Http\Request $consulta Arreglo de valores con los elementos enviados desde el cliente
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function listaRegistroSensores(Request $consulta){
        // Establecer la variable que almacenará el arreglo de registros
        $registros = null;

        // Determinar si se solicito una consulta "completa" de registro o una limitada
        if ($consulta->tipoConsul == 0) {
            // Proteger la consulta en caso de que el servidor no la pudiera procesar
            try {
                // Crear el arreglo de registros
                $results = [];
                // Obtener todos los registros de forma escalonada
                $registros = Registro_Sensor::lazy();
    
                // Regresar un error si no se encontraron registros
                if ($registros->isEmpty())
                    return response()->json(['msgError' => 'Error: No hay registros de sensores.'], 404);
                
                // Recorrer la coleccion de registros consultada e irlos agregando en el arreglo de resultados a regresar
                foreach ($registros as $sensor) {
                    $results[] = $sensor;
                    // OPCIONAL: detener si solo quieres un máximo de N para no agotar memoria; en este caso 10'000 registros
                    if (count($results) >= 10000) break;
                }
                
                // Regresar los registros obtenidos
                return response()->json(['results' => $results], 200);
            } catch(Throwable $exception) {
                return response()->json(['msgError' => 'Error: No se obtuvieron los registros de sensores. Causa: '.$exception->getMessage()], 500);
            }
        } else {
            // Proteger la consulta en caso de que el servidor no la pudiera procesar
            try {
                // Obtener los primeros 10 registros almacenados
                $registros = Registro_Sensor::take(10)->get();
    
                // Regresar un error si no se encontraron registros
                if ($registros->isEmpty())
                    return response()->json(['msgError' => 'Error: No se encontraron los registros de sensores.'], 404);
                
                // Regresar los registros obtenidos
                return response()->json(['results' => $registros], 200);
            } catch(Throwable $exception) {
                return response()->json(['msgError' => 'Error: No se obtuvieron los registros de sensores solicitados. Causa: '.$exception->getMessage()], 500);
            }
        }
    }

    /** Metodo para regresar los registros especificos acorde a una busqueda 
     * @param \Illuminate\Http\Request $consulta Arreglo de valores con los elementos enviados desde el cliente
     * @return \Illuminate\Http\JsonResponse Respuesta obtenida en formato JSON tanto mensaje de error como arreglo de registros */
    public function listaRegistroEspeci(Request $consulta){
        // Validar la información enviada desde el cliente
        $validador = Validator::make($consulta->all(), [
            'senBus' => 'required',
            'fechIni' => 'required',
            'fechFin' => 'required'
        ]);

        // Retornar error si el validador falla
        if($validador->fails())
            return response()->json(['msgError' => 'Error: La información seleccionada no es valida. Favor de intentar nuevamente.'], 500);

        // Proteger la consulta para conteo de registros
        try {
            // Obtener la cantidad de registros que se encontraron en la BD
            $cantRegis = Registro_Sensor::on('mariadb_unbuffered')->where([
                ['TIMESTAMP', '>=', ($consulta->fechIni * 1000)],
                ['TIMESTAMP', '<=', ($consulta->fechFin * 1000)],
                ['HISTORY_ID', '=', $consulta->senBus]
            ])->count();

            // Si la cantidad de registros es menor a 15000 elementos, se regresará el bloque de registros sin reducir
            if($cantRegis <= 15000) {
                // Proteger la consulta para el regreso de registros, en caso que no se necesite reducir
                try {
                    // Ejecutar la consulta de registros sin reduccion mediante la conexion que no guarda info en el buffer
                    $infoRes = Registro_Sensor::on('mariadb_unbuffered')->where([
                        ['TIMESTAMP', '>=', ($consulta->fechIni * 1000)],
                        ['TIMESTAMP', '<=', ($consulta->fechFin * 1000)],
                        ['HISTORY_ID', '=', $consulta->senBus]
                    ])->orderBy('TIMESTAMP')
                    ->select(['TIMESTAMP', 'VALUE', 'STATUS_TAG'])->get();

                    // Regresar un error si no se encontraron registros
                    if ($infoRes->isEmpty())
                        return response()->json(['msgError' => 'Error: No se encontraron los registros.'], 404);
    
                    // Regresar los registros obtenidos
                    return response()->json(['results' => $infoRes], 200);
                } catch(Throwable $exception2) {
                    return response()->json(['msgError' => 'Error: No se regresaron los registros. Causa: '.$exception2->getMessage()], 500);
                }
            }
            
            // Si no, se realizará el proceso de reducción de valores.
            // Proteger la consulta para el regreso de registros en caso de reducción
            try {
                // Crear el objeto helper y llamar el proceso de reducción de valores y almacenarlo en un arreglo
                $resRedu = app(ProcReduRegiHelper::class)->anaReduProc($consulta, $cantRegis);
                
                // Si el arreglo de resultados no tiene valores, se regresará un error
                if (count($resRedu) <= 0)
                    return response()->json(['msgError' => 'Error: El proceso de reducción tuvo problemas y no pudo generar registros.'], 404);
        
                // Regresar los registros obtenidos posterior al proceso de reducción
                return response()->json(['results' => $resRedu], 200);
            } catch(Throwable $exception3) {
                return response()->json(['msgError' => 'Error: El proceso de reducción tuvo problemas y no generó registros. Causa: '.$exception3->getMessage()], 500);
            }
        } catch(Throwable $exception1) {
            return response()->json(['msgError' => 'Error: No se contó la cantidad de registros. Causa: '.$exception1->getMessage()], 500);
        }
    }
}
