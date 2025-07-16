import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

/** Función que regresa como componente la lista desplegable que contiene los sensores nombrados en el sistema para seleccionar el que se usará en la busqueda de datos para la grafica
 * @param {Object} props - Objeto con las propiedades a recibir desde el componente padre
 * @param {function(string): void} props.resSenSel - Función para establecer el sensor de busqueda que tiene un parametro string
 * @returns {JSX.Element} Componente JSX con la lista desplegable de sensores registrados */
export default function MenuSelGraf({ resSenSel }){
    // Variable de estado para guardar el arreglo que contiene los sensores registrados del sistema
    const [arrSenRegi, setArrSenRegi] = useState([]);
    /** Referencia hacia la lista de selección para obtener la información de los elementos que la conforman */
    const listaSenRef = useRef(null);

    // Obtener los sensores registrados del sistema previo a la renderización de la lista
    useEffect(() => {
        obtenerDatos().then((response) => {
            // Si la respuesta obtenida es un arreglo, significa que se encontraron registros, si es una cadena de texto, es un error y se establecerá el retorno del mismo para mostrarlo
            if(Array.isArray(response))
                setArrSenRegi(ordenarDatos(response));
            else if(typeof(response) === "string")
                valRegreso(response);
        }).catch((errorObteDatos) => {
            valRegreso(errorObteDatos);
        });
    },[]);

    /** Función para establecer el valor de retorno por parte del componente de la lista, siendo este un error o el sensor seleccionado
     * @param {string} valor Información del sensor o contenido del error durante el proceso */
    const valRegreso = (valor) => ( resSenSel(valor) );

    /** Función para establecer la información del elemento seleccionado de la lista cuando el valor de la referencia cambie, es decir, cuando se dispare el evento onChange y cuando se pierda el foco de selección en pantalla, es decir, con el evento blur */
    const handleChange = () => ( valRegreso(listaSenRef.current.value) );

    return (
        <select id="menuSelSensor" name="menuSelSensor" className="block w-full h-5/6 bg-neutral-300 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm/6 pl-1 cursor-pointer" onChange={handleChange} onBlur={handleChange} ref={listaSenRef}>
            <option key="SenRegi0" value="Seleccione el sensor a buscar...">Seleccione el sensor a buscar...</option>
            { (arrSenRegi.length > 0 ) ? ( arrSenRegi.map(
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
async function obtenerDatos(){
    try {
        const consulta = await axios.get('/listaSenGraf');
        return consulta.data.results;
    } catch (errGetSensoRegi) {
        // Si ocurrio un error en la petición de busqueda se mostrará aqui
        if (errGetSensoRegi.response) {
            // Primer caso, el servidor tiró un error 500 programado por no encontrar sensores registrados o porque no se pudo hacer la petición para consultar información (Error contemplado)
            return(typeof(errGetSensoRegi.response.data.msgError) == "undefined") ? "Error: Selección no disponible, problemas en la obtención de la información. Favor de intentar nuevamente." : errGetSensoRegi.response.data.msgError;
        } else if (errGetSensoRegi.request) {
            // Segundo caso, el cliente lanzó la petición al servidor y este no respondio (Error controlado)
            return("Error: Servicio no disponible, información inalcanzable. Favor de intentar nuevamente.");
        } else {
            // Tercer caso, ocurrio un error en la petición y por ende en la respuesta del servidor (Error no contemplado y desconocido)
            return("Error: Servicio no disponible, información no disponible. Favor de intentar nuevamente.");
        }
    }
}

/** Función para ordenar el arreglo de información a mostrar en la lista de selección
 * @param {Array} arrInfo Arreglo resultante de la consulta a BD */
function ordenarDatos(arrInfo){
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
                Object.keys(objUniVals).forEach((clave) => (
                    (identiNiag.includes(clave)) ? objRegi.unidad = objUniVals[clave] : null
                ));

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