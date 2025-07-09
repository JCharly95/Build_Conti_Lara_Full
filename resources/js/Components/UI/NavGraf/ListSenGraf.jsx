import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function MenuSelGraf({ resSenSel }){
    // Establecer el arreglo de estado para almacenar los sensores registrados
    const [arrSenRegi, setArrSenRegi] = useState([]);
    // Crear la referencia hacia la lista para obtener la información de los elementos que la conforman
    const listaSenRef = useRef(null);

    // Obtener los registros al previo a renderizar el componente
    useEffect(() => {
        obteDatos().then((response) => {
            // Si la respuesta obtenida es un arreglo, significa que se encontraron registros, si es una cadena de texto, es un error y se establecerá el retorno del mismo para mostrarlo
            if(Array.isArray(response))
                setArrSenRegi(ordeDatos(response));
            else if(typeof(response) === "string")
                valRegreso(response);
        }).catch((errorObteDatos) => {
            valRegreso(errorObteDatos);
        });
    },[]);

    /** Funcion para establecer el valor que el componente de la lista va a regresar como seleccionado
     * @param {string} valor Información del sensor o contenido del error durante el proceso */
    const valRegreso = (valor) => ( resSenSel(valor) );

    /** Funcion para obtener la seleccion de la lista y establecer como dato a regresar, invocada mediante el evento onChange de la lista */
    const handleChange = () => ( valRegreso(listaSenRef.current.value) );

    return (
        <select id="menuSelSensor" name="listaSenRegis" className="block w-full h-5/6 bg-neutral-300 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm/6 pl-1 cursor-pointer" onChange={handleChange} ref={listaSenRef}>
            <option key="SenRegi0" value="Seleccione el sensor a buscar...">Seleccione el sensor a buscar...</option>
            { (arrSenRegi.length > 0 ) ? (arrSenRegi.map(
                    (sensor) => (
                        <option key={`SenRegi${sensor.id}`} value={`${sensor.valor};${sensor.nombre};${sensor.unidad}`}>
                            {`${sensor.nombre} (${sensor.unidad})`}
                        </option>
                    )
                )) : null }
        </select>
    );
}

/** Función para obtener los sensores registrados (nombrados) del sistema
 * @returns {Promise<Array|String>} Promesa con el resultado de la consulta en el servidor */
async function obteDatos(){
    try {
        const consulta = await axios.get('/listSenGraf');
        return consulta.data.results;
    } catch (errGetSensoRegi) {
        // Si ocurrio un error en la peticion de busqueda se mostrará aqui
        if (errGetSensoRegi.response) {
            // Primer caso, el servidor tiró un error 500 programado por no encontrar sensores registrados o porque no se pudo hacer la peticion para consultar información (Error contemplado)
            return(typeof(errGetSensoRegi.response.data.msgError) == "undefined") ? "Error: Selección bloqueada, información no procesada. Favor de intentar nuevamente." : errGetSensoRegi.response.data.msgError;
        } else if (errGetSensoRegi.request) {
            // Segundo caso, el cliente lanzó la petición al servidor y este no respondio (Error controlado)
            return("Error: Servicio no disponible, información inalcanzable. Favor de intentar nuevamente.");
        } else {
            // Tercer caso, ocurrio un error en la petición y por ende en la respuesta del servidor (Error no contemplado y desconocido)
            return("Error: Servicio no disponible, información no disponible. Favor de intentar nuevamente.");
        }
    }
}

/** Funcion para ordenar el arreglo de informacion a mostrar en la lista de seleccion
 * @param {Array} arrInfo Arreglo resultante de la consulta a BD */
function ordeDatos(arrInfo){
    let arrOrdeInfo = arrInfo.map((sensor) => {
        // Obtener la cadena de texto con la unidad del registro y establecer el objeto del registro a regresar
        let uniRegi = `${sensor.VALUEFACETS}`.split(";")[1],
        objRegi = { id: sensor.ID_Sensor, nombre: `${sensor.Nombre}`, valor: `${sensor.ID_}`, unidad: "" };

        // Determinar la unidad del registro
        switch(uniRegi) {
            case 'V':
            case 'v':
                objRegi.unidad = 'Volts';
                break;
            case '%':
                objRegi.unidad = '% de Combustible';
                break;
            case 'pf':
                objRegi.unidad = '% de Factor';
                break;
            case 'A':
                objRegi.unidad = 'Amperes';
                break;
            case 'Hz':
                objRegi.unidad = 'Hertz';
                break;
            case '':
                // Determinar la unidad cuando el contenido del registro no lo muestra analizando el identificador Niagara de este
                let identiNiag = `${sensor.ID_}`,
                objUniVals= { 'Incendio': 'Detecciones de Humo', 'Potable': 'Litros', 'Pluvial': 'Cantidad de Lluvia', 'Starts': 'Cantidad de Inicios', 'CFE': 'Volts' };

                // Recorrer el objeto de unidades y asignar la unidad al objeto resultante si la clave del objeto se "incluye" en el identificador niagara
                Object.keys(objUniVals).forEach((clave) => {
                    (identiNiag.includes(clave)) ? objRegi.unidad = objUniVals[clave] : null;
                });

                // Si después del recorrido no se asignó una unidad, se determina que la unidad no fue reconocida
                (identiNiag == '') ? objRegi.unidad = 'Unidad no Detectada' : null;
                break;
            default:
                objRegi.unidad = uniRegi;
                break;
        }
        return objRegi;
    });
    return arrOrdeInfo;
}