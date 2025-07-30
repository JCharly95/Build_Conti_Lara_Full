import React, { useState, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import Modal from "../../../Modal/Modal";
import Dialog from "../../../Modal/Plantillas/Dialog";
import DialogCancelar from "../../../Modal/Plantillas/DialogCancel";
import MenuSelGraf from "../../../NavGraf/ListaSenGraf";
import MenuSelRegi from "../RegiSensor/ListaSenRegi";
import { Edit } from "react-feather";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser } from "@fortawesome/free-solid-svg-icons";

/** Función para renderizar el formulario para la edición y eliminación de sensores nombrados
 * @returns {JSX.Element} Componente del formulario para edición y eliminación de sensores */
export default function FormEditarSensor(){
    /* Variables de estado para el modal: apertura y cierre, titulo, contenido del modal
    Variable de estado para establecer el campo de solo lectura para la unidad de medición
    Variable de estado para habilitar/deshabilitar la edición en el formulario
    Hook para el formulario cortesia de inertia para poder controlar el estado de los campos del formulario */
    const [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false),
    [uniMediSenSel, setUniMediSenSel] = useState("Esperando selección"),
    [habiEdici, setHabiEdici] = useState(false),
    { data, setData, post, delete: destroy, processing, errors, reset } = useForm({
        nomSensor: 'Esperando selección',
        idNiagSensor: 'Esperando selección'
    });

    // useEffect para monitorear los sensores de la validación
    useEffect(() => {
        if(errors.nomSensor || errors.idNiagSensor) {
            setModalTitu("Error");
            setModalConte(<Dialog textMsg={`${errors.nomSensor || ""}\n${errors.idNiagSensor || ""}`}/>);
            setModalOpen(true);
        }
    },[errors]);

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    // Función para la obtención de la respuesta de confirmación para la eliminación del sensor y gestión del proceso en base a dicha respuesta
    const handleModalElimina = (valSelOpcElimi) => {
        // Evaluar, que decidio el usuario para saber si continuar con el proceso
        if(!valSelOpcElimi) {
            // Codificar el nombre para enviarlo por la URL
            let nomEncode = encodeURI(data.nomSensor);
            // Lanzar la petición de eliminación del sensor
            destroy(`/borSenSel/${nomEncode}`);
        } else {
            // Se continuo con la recuperacion, por lo que solo se cerrará el modal de confirmacion de eliminación
            setModalOpen(false);
        }
    }

    // Habilitar/Deshabilitar la edición de campos
    const handleEdit = () => ( setHabiEdici(!habiEdici) );

    /** Función para obtener la información del sensor registrado seleccionado o el error en la consulta de obtención de información
     * @param {String} infoSenSel - Cadena de texto con la información del sensor seleccionado o el error obtenido */
    const obteSenRegi = (infoSenSel) => {
        // Lanzar el modal de error en la selección del sensor si el la cadena de texto resultante contiene: parte de la cadena selección por defecto, la palabra "error" que significa un error de procesamiento o si no contiene ";" que significa el caracter de concatenación para la información del sensor seleccionado.
        if(infoSenSel.includes("Seleccione") || infoSenSel.includes("Error") || !infoSenSel.includes(";")) {
            setModalTitu("Error");

            if(infoSenSel.includes("Seleccione") || !infoSenSel.includes(";"))
                setModalConte(<Dialog textMsg="Error: El sensor seleccionado no es valido, favor de intentar nuevamente."/>);

            if(infoSenSel.includes("Error"))
                setModalConte(<Dialog textMsg={infoSenSel}/>);

            setModalOpen(true);
        }

        // Establecer la información en los campos de texto, si la edición no esta habilitada y si la cadena de texto contiene el separador ; para desglozar la información
        if(!habiEdici) {
            setData('nomSensor', (infoSenSel.includes(";")) ? infoSenSel.split(";")[1] : 'Esperando selección');
            setData('idNiagSensor', (infoSenSel.includes(";")) ? infoSenSel.split(";")[0] : 'Esperando selección');
            setUniMediSenSel((infoSenSel.includes(";")) ? infoSenSel.split(";")[2] : 'Esperando selección');
        }
    }

    /** Función para obtener la información del sensor no registrado seleccionado o el error en la consulta de obtención de información
     * @param {String} idSenNiag - Cadena de texto con el identificador niagara del sensor seleccionado o el error obtenido */
    const obteSenNRegi = (idSenNiag) => {
        // Lanzar el modal de error en la selección del sensor si el la cadena de texto resultante contiene: parte de la cadena selección por defecto o la palabra "error" que significa falta de selección de valor o un error de procesamiento.
        if(idSenNiag.includes("Seleccione") || idSenNiag.includes("Error")) {
            setModalTitu("Error");
            setModalConte(<Dialog textMsg={(idSenNiag.includes("Seleccione")) ? "Error: Favor de seleccionar un sensor." : idSenNiag}/>);
            setModalOpen(true);
        } else {
            // Establecer el valor del campo "idNiagSensor" del formulario en el hook del form
            setData('idNiagSensor', idSenNiag);
        }
    }

    /** Función para validación y envio del formulario en el back
     * @param {React.FormEventHandler<HTMLFormElement>} event - Evento del formulario con la información de este */
    function submitEdiEliSensoForm(event){
        event.preventDefault();
        // Obtener el apuntador hacia el boton que desencadeno el evento de envio y luego el nombre de este
        let btnPresi = event.nativeEvent.submitter,
        nomBtn = btnPresi.name;

        // Determinar la acción a hacer dependiendo del nombre del boton que causo el envio
        if(nomBtn === "EditarSensor")
            // Enviar a la ruta de procesamiento en el back
            post('/valiEditSen');
        else {
            // Verificar que el nombre del sensor tenga un valor diferente al que está por defecto
            if(data.nomSensor !== 'Esperando selección')
                // Mostrar el modal de confirmación de eliminación para cuando el usuario quiera borrar uno de los sensores
                eliSensor();
            else {
                setModalTitu("Error");
                setModalConte(<Dialog textMsg="Error: No se seleccionó un sensor. Favor de hacerlo."/>);
                setModalOpen(true);
            }
        }
    }
    
    /** Función para cancelar el registro del sensor y redirigir a la pagina de la grafica */
    function cancelEdiEliSoli(){
        // Reestablecer el formulario y mostrar el modal de cancelación
        reset();

        setModalTitu("Aviso de Cancelación");
        setModalConte(<Dialog textMsg="El proceso de edición o eliminación del sensor fue cancelado."/>);
        setModalOpen(true);

        // Redirigir hacia la grafica después de 2 segundos
        setTimeout(() => (router.get('/grafica', {}, { replace: true })), 2000);
    }

    /** Función para desplegar el modal de confirmación de eliminación en caso de que el usuario desee eliminar uno de los sensores del sistema */
    function eliSensor(){
        // Si se opta por eliminar el sensor, se lanzará un modal de confirmacion previo a realizar el cambio
        setModalTitu("Eliminar Sensor");
        setModalConte(<DialogCancelar textMsg={`¿Esta seguro que desea eliminar el sensor ${data.nomSensor}?`} textSoli="eliminación" opcSel={handleModalElimina} />);
        setModalOpen(true);
    }

    return(
        <section className="fixed inset-0 overflow-y-auto h-full w-full flex items-center justify-center">
            <section className="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                <section className="flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto">
                    <section className="flex justify-between items-center py-2 px-4 border-b-2">
                        <h3 className="font-bold text-gray-800 inline-flex items-center">
                            <Edit color="black" size={25} className="mr-2"/> Editar o Eliminar Sensor
                        </h3>
                        <button type="button" className="bg-[#375164] inline-flex items-center text-center text-white p-1 rounded cursor-pointer" title="Limpiar Campos" onClick={() => {
                            reset();
                            setUniMediSenSel('Esperando selección');
                            setHabiEdici(false);
                        }}><FontAwesomeIcon icon={faEraser} size="lg" /></button>
                    </section>
                    <section className="lg:p-4 p-2 overflow-y-auto inline-flex">
                        <form onSubmit={submitEdiEliSensoForm} className="bg-white px-6">
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="sensorRegis" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                                        Sensores del sistema:
                                    </label>
                                </section>
                                <section className="md:w-2/3">
                                    <MenuSelGraf id="sensorRegis" resSenSel={obteSenRegi} oriRender="formEdit"/>
                                </section>
                            </section>
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="nomSens" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                                        Nombre:
                                    </label>
                                </section>
                                <section className="md:w-2/3">
                                    <input id="nomSens" type="text" value={data.nomSensor} onChange={(ev) => setData('nomSensor', ev.target.value)} placeholder="Nombre del Sensor" disabled={!habiEdici} autoComplete="on" className={(!habiEdici) ? "shadow shadow-red-600 appearance-none border rounded w-full py-2 px-3 text-neutral-300 bg-gray-600 leading-tight focus:outline-none focus:shadow-outline" : "shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}/>
                                </section>
                            </section>
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="idSenNiag" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                                        Identificador niagara:
                                    </label>
                                </section>
                                <section className="md:w-2/3">
                                    <input id="idSenNiag" type="text" value={data.idNiagSensor} onChange={(ev) => setData('idNiagSensor', ev.target.value)} disabled={true} placeholder="Identificador Niagara del Sensor" autoComplete="on" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                </section>
                            </section>
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="uniMediSen" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                                        Unidad de medición:
                                    </label>
                                </section>
                                <section className="md:w-2/3">
                                    <span id="uniMediSen" className="block appearance-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline cursor-default">
                                        {uniMediSenSel}
                                    </span>
                                </section>
                            </section>
                            <section className="flex items-center justify-center mb-2">
                                <input id="chkHabiEdit" type="checkbox" checked={habiEdici} onChange={handleEdit} className="shadow shadow-emerald-300 border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                <label htmlFor="chkHabiEdit" className="ml-3 text-center">
                                    { (habiEdici) ? "Deshabilitar edición" : "Habilitar edición" }
                                </label>
                            </section>
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="senEditChg" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                                        Sensores disponibles:
                                    </label>
                                </section>
                                <section className="md:w-2/3">
                                    <MenuSelRegi id="idSenNiag" resSenNoRegSel={obteSenNRegi} />
                                </section>
                            </section>
                            <section className="flex items-center justify-center pt-1">
                                <button type="submit" name="EditarSensor" disabled={processing || !habiEdici} className={`text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3 ${(!habiEdici) ? "bg-gray-500 hover:bg-gray-700 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700 cursor-pointer"}`}>Confirmar</button>
                                <button type="submit" name="EliminarSensor" disabled={processing} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3 cursor-pointer">Eliminar</button>
                                <button type="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3 cursor-pointer" onClick={cancelEdiEliSoli}>Cancelar</button>
                            </section>
                        </form>
                    </section>
                </section>
            </section>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}