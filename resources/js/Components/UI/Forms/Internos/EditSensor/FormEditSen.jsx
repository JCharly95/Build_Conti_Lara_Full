import React, { useState, useEffect, useRef } from "react";
import { useForm, router } from "@inertiajs/react";
import Modal from "../../../Modal/Modal";
import Dialog from "../../../Modal/Plantillas/Dialog";
import MenuSelGraf from "../../../NavGraf/ListaSenGraf";
import { Edit } from "react-feather";

/** Función para renderizar el formulario para la edición y eliminación de sensores nombrados
 * @returns {JSX.Element} Componente del formulario para edición y eliminación de sensores */
export default function FormEditarSensor(){
    /* Variables de estado para el modal: apertura y cierre, titulo, contenido del modal
    Hook para el formulario cortesia de inertia para poder controlar el estado de los campos del formulario */
    const [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false),
    { data, setData, post, processing, errors, reset } = useForm({
        nomSensor: '',
        idNiagSensor: ''
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

    /** Función para obtener la información del sensor registrado seleccionado o el error en la consulta de obtención de información
     * @param {String} idSenNiag - Cadena de texto con la información del sensor seleccionado o el error obtenido */
    const obteSenRegi = (idSenNiag) => {
        // Lanzar el modal de error en la selección del sensor si el la cadena de texto resultante contiene: parte de la cadena selección por defecto o la palabra "error" que significa falta de selección de valor o un error de procesamiento.
        if(idSenNiag.includes("Seleccione") || idSenNiag.includes("Error")) {
            setModalTitu("Error");
            setModalConte(<Dialog textMsg={idSenNiag}/>);
            setModalOpen(true);
        } else {
            // Establecer el valor del campo "idNiagSensor" del formulario en el hook del form
            setData('idNiagSensor', idSenNiag);
        }
    }

    /** Función para validación y envio del formulario en el back
     * @param {React.FormEventHandler<HTMLFormElement>} event - Evento del formulario con la información de este */
    function submitRegiSensoForm(event){
        event.preventDefault();
        // Enviar a la ruta de procesamiento en el back
        post('/valiRegiSen');
    }
    
    /** Función para cancelar el registro del sensor y redirigir a la pagina de la grafica */
    function cancelRegiSoli(){
        // Reestablecer el formulario y mostrar el modal de cancelación
        reset();

        setModalTitu("Aviso de Cancelación");
        setModalConte(<Dialog textMsg="El registro del sensor fue cancelado."/>);
        setModalOpen(true);

        // Redirigir hacia la grafica después de 2 segundos
        setTimeout(() => (router.get('/grafica', {}, { replace: true })), 2000);
    }

    return(
        <section className="fixed inset-0 overflow-y-auto h-full w-full flex items-center justify-center">
            <section className="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                <section className="flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto">
                    <section className="flex justify-between items-center py-2 px-4 border-b-2">
                        <h3 className="font-bold text-gray-800 inline-flex items-center">
                            <Edit color="black" size={25} className="mr-2"/> Editar Sensor
                        </h3>
                    </section>
                    <section className="lg:p-4 p-2 overflow-y-auto inline-flex">
                        <form onSubmit={submitRegiSensoForm} className="bg-white px-6">
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="nomSens" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                                        Seleccione el sensor que desea editar:
                                    </label>
                                </section>
                                <section className="md:w-2/3">
                                    <input id="nomSens" type="text" value={data.nomSensor} onChange={(ev) => setData('nomSensor', ev.target.value)} placeholder="Nombre del Sensor" autoComplete="on" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                </section>
                            </section>
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="nomSens" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                                        Seleccione el sensor que desea editar:
                                    </label>
                                </section>
                                <section className="md:w-2/3">
                                    <input id="nomSens" type="text" value={data.nomSensor} onChange={(ev) => setData('nomSensor', ev.target.value)} placeholder="Nombre del Sensor" autoComplete="on" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                </section>
                            </section>
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="idSenNiag" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                                        Sensores disponibles:
                                    </label>
                                </section>
                                <section className="md:w-2/3">
                                    <MenuSelRegi id="idSenNiag" resSenNoRegSel={obteSenRegi} />
                                </section>
                            </section>
                            <section className="flex items-center justify-center pt-1">
                                <button type="submit" disabled={processing} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3 cursor-pointer">Registrar Sensor</button>
                                <button type="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3 cursor-pointer" onClick={cancelRegiSoli}>Cancelar Registro</button>
                            </section>
                        </form>
                    </section>
                </section>
            </section>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}