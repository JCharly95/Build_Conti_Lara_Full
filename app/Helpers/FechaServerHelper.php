<?php

namespace App\Helpers;

class FechaServerHelper
{
    /** Función para generar una fecha con formato de salida: Y-m-d H:i:s en el servidor
     * @param int $valFecha Variable numerica con la fecha a convertir (puede ser omitida)
     * @return string Cadena de texto con la fecha convertida */
    public function genFecha($valFecha = 404){
        // Obtener la zona horaria inicial
        $zonaHorIni = date_default_timezone_get();

        // Establecer la zona horaria como México Central
        date_default_timezone_set('America/Mexico_City');

        // Generar la fecha en base al valor ingresado o al momento actual
        $fecha = ($valFecha !== 404) ? date("Y-m-d H:i:s", $valFecha) : date("Y-m-d H:i:s");

        // Regresar a la zona horaria inicial si fue cambiada durante el proceso, si no, se deja la zona horaria cambiada
        $zonaHorCmp = date_default_timezone_get();
        (strcmp($zonaHorCmp, $zonaHorIni) !== 0) ? date_default_timezone_set($zonaHorIni) : date_default_timezone_set($zonaHorCmp);

        return $fecha;
    }
}
