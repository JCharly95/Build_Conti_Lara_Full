import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

/** Función que regresa como componente la lista desplegable que contiene los sensores identificados por niagara, sin nombrar en el sistema y que se usará como selección para registrarlos
 * @param {Object} props - Objeto con las propiedades a recibir desde el componente padre
 * @param {function(string): void} props.resSenNoRegSel - Función para establecer el sensor a registrar que tiene un parametro string
 * @returns {JSX.Element} Componente JSX con la lista desplegable de sensores no registrados */
export default function MenuSelRegi({ resSenNoRegSel }){
    // Variable de estado para guardar el arreglo que contiene los sensores registrados del sistema
    const [arrSenNoRegi, setArrSenNoRegi] = useState([]);
    /** Referencia hacia la lista de selección para obtener la información de los elementos que la conforman */
    const listaSenNRegiRef = useRef(null);

    // Obtener los sensores no registrados en el sistema previo a la renderizacion de la lista
    useEffect(() => {
        obtenerDatos().then((response) => {
            // Si la respuesta obtenida es un arreglo, significa que se encontraron registros, si es una cadena de texto, es un error y se establecerá el retorno del mismo para mostrarlo
            if(Array.isArray(response)) {
                setArrSenNoRegi(
                    response.map((sensor) => ({
                        ID: `${sensor.ID}`,
                        ID_Niag: `${sensor.ID_}`
                    }))
                );
            } else if(typeof(response) === "string") {
                valRegreso(response);
            }
        }).catch((errorObteDatos) => {
            valRegreso(errorObteDatos);
        });
    },[]);

    /** Función para establecer el valor de retorno por parte del componente de la lista, siendo este un error o el sensor seleccionado
     * @param {string} valor Información del sensor o contenido del error durante el proceso */
    const valRegreso = (valor) => ( resSenNoRegSel(valor) );

    /** Función para establecer la información del elemento seleccionado de la lista cuando el valor de la referencia cambie, es decir, cuando se dispare el evento onChange */
    const handleChange = () => ( valRegreso(listaSenNRegiRef.current.value) );

    return(
        <select id="menuSelSenNoRegi" name="menuSelSenNoRegi" className="block w-full h-full bg-neutral-300 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm/6 lg:text-base pl-1 py-2 cursor-pointer" onChange={handleChange} onBlur={handleChange} ref={listaSenNRegiRef}>
            <option key="SenNoRegi0" value="Seleccione el sensor a registrar...">Seleccione el sensor a registrar...</option>
            { (arrSenNoRegi.length > 0 ) ? (arrSenNoRegi.map( (sensor) => (
                    <option key={`SenNoRegi${sensor.ID}`} value={sensor.ID_Niag}>
                        {`${sensor.ID_Niag}`}
                    </option>
                )
            )) : null }
        </select>
    );
}

/** Función para obtener los sensores no registrados (nombrados) del sistema
 * @returns {Promise<Array|String>} Promesa con el resultado de la consulta en el servidor */
async function obtenerDatos(){
    try {
        const consulta = await axios.get('/listaSenRegi');
        return consulta.data.results;
    } catch (errGetSensoNoRegi) {
        // Si ocurrio un error en la petición de busqueda se mostrará aqui
        if (errGetSensoNoRegi.response) {
            // Primer caso, el servidor tiró un error 500 programado por no encontrar los sensores no registrados o porque no se pudo hacer la petición para consultar información (Error contemplado)
            return (typeof(errGetSensoNoRegi.response.data.msgError) == "undefined") ? "Error: Selección no disponible, información solicitada no disponible. Favor de intentar nuevamente." : errGetSensoNoRegi.response.data.msgError;
        } else if (errGetSensoNoRegi.request) {
            // Segundo caso, el cliente lanzó la petición al servidor y este no respondio (Error controlado)
            return("Error: Servicio no disponible, información no localizada. Favor de intentar nuevamente.");
        } else {
            // Tercer caso, ocurrio un error en la petición y por ende en la respuesta del servidor (Error no contemplado y desconocido)
            return("Error: Proceso interrumpido durante el proceso de visualización de valores. Favor de intentar nuevamente.");
        }
    }
}