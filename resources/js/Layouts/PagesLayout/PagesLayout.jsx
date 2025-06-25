import { router } from "@inertiajs/react";
import React, { useState, useEffect, useRef } from "react";
import Barra_Navegacion from "../../Components/UI/NavBar/Barra_Nav";
import Pie_Pagina from "../../Components/UI/Pie/Pie_Gen";
import Modal from "../../Components/UI/Modal/Modal";
import Dialog from "../../Components/UI/Modal/Plantillas/Dialog";

/** Funcion para establecer el layout compartido de las paginas
 * @param {React.ReactNode} children - Nodo de react con el contenido a mostrar en la pagina
 * @returns {JSX.Element} - Componente JSX con el contenido de la pagina */
export default function PagesLayout({ children }){
    // Variables de estado para el modal: titulo, contenido del modal y apertura y cierre.
    const [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false);
    // Variables de referencia para monitorear la inactividad
    const finSesRef = useRef(null),
    adverSesRef = useRef(null);

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    // UseEffect para monitorear el uso de teclas F12 para consola y menu contextual, asi como el clic derecho, tambien menu contextual
    /*useEffect(() => {
        const funEscuTecla = (evento) => {
            if(evento.key == "F12"){
                evento.preventDefault();
                // Establecer el titulo del modal, el contenido del mismo y la apertura de este
                setModalTitu("Error");
                setModalConte(<Dialog textMsg="Tecla Invalida."/>);
                setModalOpen(true);
            }
        };
        const funEscuClic = (evento) => {
            evento.preventDefault();
            // Establecer el titulo del modal, el contenido del mismo y la apertura de este
            setModalTitu("Error");
            setModalConte(<Dialog textMsg="Acción Invalida."/>);
            setModalOpen(true);
        };
        // Agregar el listener para evitar las teclas F12 y menu contextual
        window.addEventListener("keydown", funEscuTecla);
        window.addEventListener("contextmenu", funEscuClic);
        // Remover el listener para evitar el ciclado de escucha
        return () => {
            window.removeEventListener("keydown", funEscuTecla);
            window.removeEventListener("contextmenu", funEscuClic);
        };
    }, []);*/

    /*----------------------------Seccion de Inactividad---------------------------------------------*/
    /** Función para establecer los elementos de evaluación para la inactividad en pantalla */
    const setTiempoSes = () => {
        // Borrar los intervalos de tiempo establecidos; para cierre de sesión y aviso de la vigencia
        clearTimeout(finSesRef.current);
        clearTimeout(adverSesRef.current);

        // Mostrar la advertencia de vigencia en la sesion cada 9 minutos
        adverSesRef.current = setTimeout(() => {
            setModalTitu("Recordatorio");
            setModalConte(<Dialog textMsg="Recordandole que la sesión se cierra automaticamente después de 10 minutos de inactividad" />);
            setModalOpen(true);
        }, 540000);

        // Cerrar la sesión habiendo pasado los 10 minutos en caso de inactividad
        finSesRef.current = setTimeout(() => {
            setModalTitu("Cerrar Sesión");
            setModalConte(<Dialog textMsg="El tiempo de su sesión venció, favor de acceder nuevamente." />);
            setModalOpen(true);
            // Redireccionamiento hacia el login despues de 2 segundos
            setTimeout( () => ( router.visit('/', { method: 'get', replace: true }) ), 2000);
        }, 600000);
    };

    // Useffect para establecer el contador de inactividad y renovarlo con cada accion de usuario
    useEffect(() => {
        // Establecer los eventos de acciones en la ventana: clic, mover el mouse, presionar el mouse, presionar tecla, tecla presionada,scrollear pantalla, inicio de movimiento touch y mover el touchpad en un arreglo
        const ventaEvents = ['click', 'mousemove', 'mousedown', 'keypress', 'keydown', 'scroll', 'touchstart', 'touchmove'];

        // Establecer la sesión por primera vez
        setTiempoSes();

        // Recorrer el arreglo de eventos y asignarle un listener a cada uno; donde la acción será reestablecer la sesión
        ventaEvents.forEach((evento) => (window.addEventListener(evento, setTiempoSes)));
        
        // Remover los listener y los temporizadores, por rendimiento, habiendo evaluado la situacion
        return () => {
            ventaEvents.forEach((evento) => (window.removeEventListener(evento, setTiempoSes)));
            clearTimeout(finSesRef.current);
            clearTimeout(adverSesRef.current);
        };
    }, []);
    /*-----------------------------------------------------------------------------------------------*/

    // Regresar el componente renderizado
    return(
        <section className="w-full h-full flex flex-col font-inter">
            <Barra_Navegacion />
            <main>
                { children }
            </main>
            { modalOpen && <Modal titModal={modalTitu} conteModal={modalConte} isOpen={handleModal} /> }
            <Pie_Pagina />
        </section>
    );
}

