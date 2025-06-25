import React, { useRef, useState } from "react";
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { Calendar, Trash2, HelpCircle } from 'react-feather';
import Modal from '../Modal/Modal';
import Dialog from '../Modal/Plantillas/Dialog';

/**  Función para crear y configurar el componente del calendario para la selección de la grafica
 * @returns {JSX.Element} El componente flatpick del calendario renderizado */
export default function CalenGrafica({ setFecha }){
    /* Variables de estado para el modal: titulo, contenido del modal, apertura y cierre */
    const [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false);
    // Referencia al componente flatpick para limpiarlo
    const calenRef = useRef(null);

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    // Establecer la opciones de configuracion del objeto Flatpickr
    const optionsCalen = {
        enableTime: true,
        enableSeconds: true,
        mode: "range",
        altFormat: "Y/m/d; H:i:S",
        dateFormat: 'Y-m-d H:i:S',
        locale: Spanish,
        onChange: function(selectedDates, lastDateStr){
            // Evaluar si ya hubo la seleccion de la fecha de inicio
            if((selectedDates.length > 0) && selectedDates[0]){
                // Crear la fecha final a partir de la inicial + 3 meses
                let fechFin = new Date(selectedDates[0]);
                fechFin.setMonth(fechFin.getMonth() + 3);
                // Actualizar el valor de la fecha final de Flatpickr desde la referencia aplicandolo a la instancia de Flatpickr contenida en la referencia
                calenRef.current.flatpickr.set("maxDate", fechFin);
            }
        },
        onClose: function(selectedDates, lastDateStr) {
            let fechaConveEpoch = selectedDates.map((valFechSel) => {
                return valFechSel.getTime() / 1000.0;
            });
            setFecha(fechaConveEpoch);
        },
    };

    return(
        <section className="inline-flex ring-2 ring-inset ring-gray-400 rounded-md border-0 p-0.5 bg-neutral-300">
            <label className="flex items-center justify-between text-black bg-blue-500 font-bold px-0.5 rounded-s border-0 cursor-pointer" htmlFor="CalenSelGraf">
                <Calendar />
            </label>
            <Flatpickr id="CalenSelGraf" placeholder="Fechas y Hora de Busqueda" options={optionsCalen} ref={calenRef} className="px-2"/>
            <button type="button" className="bg-red-600 text-center text-white px-0.5 rounded-e cursor-pointer mr-1" onClick={() => {
                if(!calenRef?.current?.flatpickr) return;
                calenRef.current.flatpickr.clear();
                setFecha(0);
            }}>
                <Trash2 />
            </button>
            <HelpCircle className="cursor-pointer bg-white rounded" onClick={() => {
                setModalTitu("Aviso");
                setModalConte(<Dialog textMsg="NOTA: Los minutos y segundos seleccionados serán establecidos en ambas fechas."/>);
                setModalOpen(true);
            }}/>
            { modalOpen && <Modal titModal={modalTitu} conteModal={modalConte} isOpen={handleModal}/> }
        </section>
    );
}