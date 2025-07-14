import { useState, useEffect } from "react";
import CalenGrafica from "./CalenSelGraf";
import MenuSelGraf from "./ListSenGraf";
import Modal from "../Modal/Modal";
import Dialog from "../Modal/Plantillas/Dialog";

/** Funcion que regresa como componente la barra de busqueda de la informacion para la grafica y recibe una prop: infoBus(object) el cual sirve para establecer y regresar la informacion de busqueda de datos para la grafica 
 * @param {Object} props - Objeto con las propiedades a recibir desde el componente padre
 * @param {React.Dispatch<React.SetStateAction<null>>} props.infoBus - Funcion para establecer la información de la busqueda
 * @returns {JSX.Element} Componente jsx de la barra de navegación para la grafica */
export default function NavBarGrafica({ infoBus }){
    /* Variable de estado para el nombre del sensor que servirá para filtrar la busqueda de la grafica
    Variable de estado para el arreglo de fechas que devolverá el calendario (es arreglo porque la seleccion en en rango)
    Variable de estado para la visibilidad de la barra de navegación en moviles
    Variable de estado para habilitar el boton de la busqueda de información
    Variables de estado para el modal: titulo, contenido del modal, apertura y cierre */
    const [sensorBusc, setSensoBusc] = useState('404'),
    [arrFechSel, setArrFechSel] = useState([]),
    [verBarra, setVerBarra] = useState(false),
    [btnBusInfo, setBtnBusInfo] = useState(true),
    [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false);

    // UseEffect para monitorear el valor de los parametros de busqueda y habilitar/deshabilitar el boton de busqueda
    useEffect(() => {
        // Habilitar el boton de busqueda solo si se seleccionó un sensor y se obtuvo un arreglo de fechas
        if(sensorBusc !== '404' && arrFechSel.length > 0)
            setBtnBusInfo(false);

        // Deshabilitar el boton de busqueda si se limpio el calendario de selección para las fechas
        if(sensorBusc !== '404' && arrFechSel.length === 0)
            setBtnBusInfo(true);
    }, [sensorBusc, arrFechSel]);

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    // Mostrar/Ocultar la barra en moviles
    const handleBarra = () => ( setVerBarra(!verBarra) );

    /** Funcion para obtener la información del sensor seleccionado o el error en la consulta
     * @param {String} infoSenSel Cadena de texto con la información del sensor concatenada o el error obtenido */
    const obteSensoSel = (infoSenSel) => {
        // Lanzar el modal de error en la selección del sensor si el la cadena de texto resultante contiene: parte de la cadena selección por defecto, la palabra "error" que significa un error de procesamiento o si no contiene ";" que significa el caracter de concatenación para la información del sensor seleccionado.
        if(infoSenSel.includes("Seleccione") || infoSenSel.includes("Error") || !infoSenSel.includes(";")) {
            setModalTitu("Error");

            if(infoSenSel.includes("Seleccione") || infoSenSel.includes("Error"))
                setModalConte(<Dialog textMsg={infoSenSel}/>);

            if(!infoSenSel.includes(";"))
                setModalConte(<Dialog textMsg="Error: La información solicitada no fue debidamente obtenida."/>);

            setModalOpen(true);
        } 
        setSensoBusc(infoSenSel);
    };

    /** Funcion para obtener el arreglo de fechas seleccionadas desde el componente del calendario
     * @param {Array} valFechSel Arreglo con la información de fechas seleccionadas para la busqueda */
    const obteFechasSel = (valFechSel) => {
        // Lanzar el modal de error si se obtuvo un arreglo vacio como respuesta, dando a entender que se limpio la selección (y en la validación previo a la busqueda se tomará el valor por defecto que justo es un arreglo vacio tambien)
        if(valFechSel.length === 0) {
            setModalTitu("Error");
            setModalConte(<Dialog textMsg="Favor de seleccionar un rango de fechas para hacer la busqueda."/>);
            setModalOpen(true);
        } 
        setArrFechSel(valFechSel);
    };

    /** Función para validar la información seleccionada en la barra de navegación para la busqueda de datos en la grafica */
    const valiSelNavBus = () => {
        // Validar si hubo algun caso de error o ausencia de valores en las selecciones
        if(sensorBusc === '404' || sensorBusc.includes("Seleccione") || sensorBusc.includes("Error") || !sensorBusc.includes(";") || arrFechSel.length === 0) {
            // Preparar el encabezado para el modal de error
            setModalTitu("Error");

            // Validar si se omitio la selección de los campos
            if((sensorBusc === '404' || sensorBusc.includes("Seleccione") || sensorBusc.includes("Error") || !sensorBusc.includes(";")) && arrFechSel.length === 0)
                setModalConte(<Dialog textMsg="Error: No se encontró selección de parametros para la busqueda."/>);

            // Validar si solo se omitio la selección del sensor
            if(sensorBusc === '404' || sensorBusc.includes("Seleccione") || sensorBusc.includes("Error") || !sensorBusc.includes(";")) {
                if(sensorBusc === '404')
                    setModalConte(<Dialog textMsg="Error: No se encontró selección del sensor"/>);

                if(infoSenSel.includes("Seleccione") || infoSenSel.includes("Error"))
                    setModalConte(<Dialog textMsg={infoSenSel}/>);

                if(!infoSenSel.includes(";"))
                    setModalConte(<Dialog textMsg="Error: La información solicitada no fue debidamente obtenida."/>);
            }

            // Validar si solo se omitio la selección de las fechas
            if(arrFechSel.length === 0)
                setModalConte(<Dialog textMsg="Favor de seleccionar un rango de fechas para hacer la busqueda."/>);

            // Mostrar el modal con su respectivo error
            setModalOpen(true);
        } else
            // En caso de haber ingresado todos los valores, se establece el objeto con la informacion correspondiente para la busqueda
            infoBus({ infoSensor: sensorBusc, arrFechas: arrFechSel });
    }

    return(
        <section className="w-full h-full bg-gray-800">
            <section className="flex items-center justify-between flex-wrap w-full h-full bg-gray-800 px-4 py-1">
                <section className="flex items-center justify-between shrink-0 text-white mr-2 pb-0.5">
                    <span>Filtro Busqueda:</span>
                </section>
                <section className="block lg:hidden">
                    <button type="button" className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white hover:bg-teal-600 cursor-pointer" onClick={handleBarra}>
                        <svg className="fill-current h-3 w-3" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><title>Filtro</title><path d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"/></svg>
                    </button>
                </section>
                <section className={`w-full grow lg:flex lg:items-center lg:w-auto ${verBarra ? 'block pb-2 lg:pb-0' : 'hidden'}`}>
                    <section className="lg:grow lg:inline-flex lg:gap-1 align-middle">
                        <section className="block mt-4 lg:inline-block lg:mt-1">
                            <MenuSelGraf resSenSel={obteSensoSel}/>
                        </section>
                        <section className="block mt-4 lg:inline-block lg:mt-1">
                            <CalenGrafica setFecha={obteFechasSel}/>
                        </section>
                        <section className="block mt-4 lg:inline-block lg:mt-1">
                            <button type="button" onClick={valiSelNavBus} disabled={btnBusInfo} className={`text-white font-bold py-0.5 px-2 rounded block lg:inline-block lg:mt-0 ${(btnBusInfo) ? "bg-gray-500 hover:bg-gray-700 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700 cursor-pointer"}`}>Buscar</button>
                        </section>
                        <section className="block mt-4 lg:mb-0 lg:ml-6 lg:inline-block lg:mt-1">
                            <button type="button" className="bg-green-500 hover:bg-green-800 text-white font-bold py-0.5 px-2 rounded block lg:inline-block lg:mt-0 cursor-pointer">Agregar Sensor</button>
                            {/* Siguiente paso: Establecer el contenedor de los formularios dentro del sistema */}
                        </section>
                    </section>
                </section>
            </section>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}