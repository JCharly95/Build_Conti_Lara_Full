import { useState } from "react";
import CalenGrafica from "./CalenSelGraf";
import MenuSelGraf from "./ListSenGraf";
import Modal from "../Modal/Modal";
import Dialog from "../Modal/Plantillas/Dialog";

/** Funcion que regresa como componente la barra de busqueda de la informacion para la grafica y recibe una prop: infoBus(object) el cual sirve para establecer y regresar la informacion de busqueda de datos para la grafica 
 * @param {Object} props - Objeto con las propiedades a recibir desde el componente padre
 * @param {React.Dispatch<React.SetStateAction<null>>} props.infoBus - Funcion para establecer la información de la busqueda
 * @returns {JSX.Element} Componente jsx de la barra de navegación para la grafica */
export default function NavBarGrafica({ infoBus }){
    // Variable de estado para el nombre del sensor para filtrar la busqueda de la grafica
    const [sensorBusc, setSensoBusc] = useState('404');
    // Variable de estado para el arreglo de fechas que devolverá el calendario (es arreglo porque la seleccion en en rango)
    const [arrFechSel, setArrFechSel] = useState([]);
    // Variable de estado para la visibilidad de la barra de navegación en moviles
    const [verBarra, setVerBarra] = useState(false);
    /* Variables de estado para el modal: titulo, contenido del modal, apertura y cierre */
    const [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false);

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    // Mostrar/Ocultar la barra en moviles
    const handleBarra = () => ( setVerBarra(!verBarra) );

    /** Funcion para obtener la información del sensor seleccionado o el error en la consulta
     * @param {String} infoSenSel Cadena de texto con la información del sensor concatenada o el error obtenido */
    const obteSensoSel = (infoSenSel) => {
        if(infoSenSel.includes("Seleccione") || infoSenSel.includes("Error") || !infoSenSel.includes(";")){
            setModalTitu("Error");
            setModalConte(<Dialog textMsg={infoSenSel}/>);
            setModalOpen(true);
        }
        setSensoBusc(infoSenSel);
    };

    /** Funcion para obtener el arreglo de fechas seleccionadas desde el componente del calendario
     * @param {Array} valFechSel Arreglo con las fechas seleccionadas para la busqueda */
    const obteFechasSel = (valFechSel) => {
        // Solo al seleccionar fechas con flatpickr (en este caso, por la selección rango) se regresa un arreglo
        if(!Array.isArray(valFechSel)){
            setModalTitu("Error");
            setModalConte(<Dialog textMsg="Favor de seleccionar un rango de fechas para hacer la busqueda."/>);
            setModalOpen(true);
        }
        setArrFechSel(valFechSel)
    };

    /** Función para determinar la selección del sensor y la selección del calendario con el rango de fechas */
    const veriBus = () => {
        // Previo a hacer la busqueda de valores, se deberá corroborar que se hayan seleccionado valores en los campos del formulario (sensor y calendarios). En caso que no, desplegar el mensaje de error correspondiente al campo faltante
        // Caso 1: Se busca valor por defecto en todos los campos y en cualquier coincidencia evaluar cual es el campo faltante
        if(sensorBusc == "404" || sensorBusc.includes("Seleccione") || sensorBusc.includes("Error") || !sensorBusc.includes(";") || arrFechSel.length == 0 || !Array.isArray(arrFechSel)){
            // Preparar el encabezado para el modal de error
            setModalTitu("Error");
            // Caso 2: Establecer si no hubo selección de sensor ni de fechas
            if((sensorBusc == "404" || sensorBusc.includes("Seleccione") || sensorBusc.includes("Error") || !sensorBusc.includes(";")) && (arrFechSel.length == 0 || !Array.isArray(arrFechSel) || arrFechSel == 0)){
                setModalConte(<Dialog textMsg="Favor de seleccionar un rango de fechas para hacer la busqueda."/>);
            } else {
                // Caso 3: Determinar el error de la obtención del sensor
                if(sensorBusc == "404" || sensorBusc.includes("Seleccione") || sensorBusc.includes("Error") || !sensorBusc.includes(";")){
                    if(sensorBusc.includes("Error"))
                        setModalConte(<Dialog textMsg={`${sensorBusc}`}/>);
                    else
                        setModalConte(<Dialog textMsg="Favor de seleccionar un sensor de la lista para hacer la busqueda."/>);
                }
                // Caso 4: Determinar el error de la obtención del rango de fechas
                if(arrFechSel.length == 0 || !Array.isArray(arrFechSel) || arrFechSel == 0){
                    setModalConte(<Dialog textMsg="Favor de seleccionar un rango de fechas para hacer la busqueda."/>);
                }
            }
            // Preparar el estado del modal
            setModalOpen(true);
        } else {
            // En caso de haber ingresado todos los valores, se establece el objeto con la informacion correspondiente para la busqueda
            infoBus({ infoSensor: sensorBusc, arrFechas: arrFechSel });
        }
    }

    return(
        <section className="w-full h-full bg-gray-800">
            <section className="flex items-center justify-between flex-wrap w-full h-full bg-gray-800 px-4 py-1 lg:py-0.5">
                <section className="flex items-center justify-between flex-shrink-0 text-white mr-2">
                    <span>Filtro Busqueda:</span>
                </section>
                <section className="block lg:hidden">
                    <button type="button" className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white hover:bg-teal-600" onClick={handleBarra}>
                        <svg className="fill-current h-3 w-3" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><title>Filtro</title><path d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"/></svg>
                    </button>
                </section>
                <section className={`w-full flex-grow lg:flex lg:items-center lg:w-auto ${verBarra ? 'block pb-2 lg:pb-0' : 'hidden'}`}>
                    <section className="lg:flex-grow lg:inline-flex lg:gap-1 align-middle">
                        <section className="block mt-4 lg:inline-block lg:mt-1">
                            <MenuSelGraf resSenSel={obteSensoSel}/>
                        </section>
                        <section className="block mt-4 lg:inline-block lg:mt-1">
                            <CalenGrafica setFecha={obteFechasSel}/>
                        </section>
                        <section className="block mt-4 lg:inline-block lg:mt-1">
                            <button type="button" onClick={veriBus} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-0.5 px-2 rounded block lg:inline-block lg:mt-0">Buscar</button>
                        </section>
                        <section className="block mt-4 lg:mb-0 lg:ml-6 lg:inline-block lg:mt-1">
                            <button type="button" className="bg-green-500 hover:bg-green-800 text-white font-bold py-0.5 px-2 rounded block lg:inline-block lg:mt-0">Agregar Sensor</button>
                        </section>
                    </section>
                </section>
            </section>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}