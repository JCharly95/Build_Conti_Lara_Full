import React, { useState, useEffect } from "react";
import CalenGrafica from "./CalenSelGraf";
import Modal from "../Modal/Modal";
import Dialog from "../Modal/Plantillas/Dialog";

export default function NavBarGrafica(){
    /* Variables de estado para el modal: titulo, contenido del modal, apertura y cierre */
    const [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false);
    // Variable de estado para el arreglo de fechas que devolvera el calendario (es arreglo porque la seleccion en en rango)
    const [arrFechSel, setArrFechSel] = useState([]);

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    /** Funcion para obtener el arreglo de fechas seleccionadas desde el componente del calendario
     * @param {Array} valFechSel Arreglo con las fechas seleccionadas para la busqueda */
    const obteFechasSel = (valFechSel) => {
        if(valFechSel[0] !== 404 && valFechSel[1] !== 404)
            setArrFechSel(valFechSel);
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
                            <ListaSenRegi resSenSel={obteSensoSel}/>
                        </section>
                        <section className="block mt-4 lg:inline-block lg:mt-1">
                            <CalenGrafica setFecha={obteFechasSel}/>
                        </section>
                        <section className="block mt-4 lg:inline-block lg:mt-1">
                            <button type="button" onClick={handleSearch} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-0.5 px-2 rounded block lg:inline-block lg:mt-0">Buscar</button>
                        </section>
                        <section className="block mt-4 lg:mb-0 lg:ml-6 lg:inline-block lg:mt-1">
                            <button type="button" className="bg-green-500 hover:bg-green-800 text-white font-bold py-0.5 px-2 rounded block lg:inline-block lg:mt-0" onClick={() => {
                            setModalTitu("Agregar Sensor");
                            setModalConte(<FormAgreSensor estModal={handleModal} />);
                            setModalOpen(true);
                            }}>Agregar Sensor</button>
                        </section>
                    </section>
                </section>
            </section>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}