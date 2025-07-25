import React, { useRef, useState } from "react";
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { Calendar, Trash2, HelpCircle } from 'react-feather';
import Modal from '../Modal/Modal';
import Dialog from '../Modal/Plantillas/Dialog';

/** Función que regresa como componente el calendario para la selección del rango de fechas utilizado en la busqueda de datos
 * @param {Object} props - Objeto con las propiedades a recibir desde el componente padre
 * @param {function(Array): void} props.setFecha - Función para establecer el arreglo de valores con la selección de fechas
 * @returns {JSX.Element} Componente JSX con el calendario Flatpickr en modo rango para la selección de fechas */
export default function CalenGrafica({ setFecha }){
    /* Variables de estado para el modal: titulo, contenido del modal, apertura y cierre */
    const [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false);
    /** Refencia al calendario flatpickr que se usará para limpiar la selección de fechas */
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
            // Determinar si ya se seleccionó la fecha de inicio en el cambio del valor de la referencia (disparado desde el metodo onChange)
            if((selectedDates.length > 0) && selectedDates[0]) {
                // Crear y establecer la fecha final; a partir de la inicial, con un agregado de 3 meses (recordar que getMonth parte del 0)
                let fechFin = new Date(selectedDates[0]);
                fechFin.setMonth(fechFin.getMonth() + 2);
                // Actualizar la propiedad de la fecha final en la referencia de Flapickr que terminará aplicandose en la instancia de Flatpickr por el hook de useRef
                calenRef.current.flatpickr.set("maxDate", fechFin);
            }
        },
        onClose: function(selectedDates, lastDateStr) {
            // Convertir las fechas seleccionadas a formato timestamp (unix_time) y establecerlas como valor de retorno cuando la selección del calendario se cierre (disparado desde el metodo onClose)
            let fechaConveEpoch = selectedDates.map((valFechSel) => ( valFechSel.getTime() / 1000.0 ));
            estaReturn(fechaConveEpoch);
        },
    };

    /** Función para establecer el arreglo de regreso por parte del calendario
     * @param {Array} valor - Arreglo con la respuesta de la selección de la información */
    const estaReturn = (valor) => ( setFecha(valor) );

    return(
        <section className="w-full p-0.5 inline-flex ring-2 ring-inset ring-gray-400 rounded-md bg-neutral-300">
            <label htmlFor="CalenSelGraf" className="flex items-center justify-between text-black bg-blue-500 font-bold px-0.5 rounded-s border-0 cursor-pointer">
                <Calendar />
            </label>
            <Flatpickr id="CalenSelGraf" placeholder="Fecha de Busqueda" options={optionsCalen} ref={calenRef} className="w-full px-2 text-center"/>
            <button type="button" className="bg-red-600 mr-1 px-0.5 text-center text-white rounded-e cursor-pointer" onClick={() => {
                if(!calenRef?.current?.flatpickr)
                    return;
                calenRef.current.flatpickr.clear();
                estaReturn([]);
            }}><Trash2 /></button>
            <button type="button" className="bg-white px-0.5 rounded cursor-pointer" onClick={() => {
                setModalTitu("Aviso");
                setModalConte(<Dialog textMsg="NOTA: Los minutos y segundos seleccionados serán establecidos en ambas fechas."/>);
                setModalOpen(true);
            }}><HelpCircle /></button>
            { modalOpen && <Modal titModal={modalTitu} conteModal={modalConte} isOpen={handleModal}/> }
        </section>
    );
}