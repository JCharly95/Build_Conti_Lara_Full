import React, { useState, useEffect } from "react";
import Pie_Pagina from "../../Components/UI/Pie/Pie_Gen";
import Modal from "../../Components/UI/Modal/Modal";
import Dialog from "../../Components/UI/Modal/Plantillas/Dialog";

/** Función para establecer el root layout del sistema
 * @param {React.ReactNode} children - Nodo de react con el contenido a mostrar en la pagina
 * @returns {JSX.Element} - Componente JSX con el contenido de la pagina */
export default function MainLayout({ children }){
    // Variables de estado para el modal: titulo, contenido del modal y apertura y cierre.
    const [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false);

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    // UseEffect para monitorear el uso de teclas F12 para consola y menu contextual, asi como el clic derecho, tambien menu contextual
    useEffect(() => {
        const funEscuTecla = (evento) => {
            if(evento.key == "F12") {
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
    }, []);

    return(
        <main className="w-full h-full flex flex-col items-center justify-center font-inter">
            { children }
            <Pie_Pagina />
            {modalOpen && <Modal titModal={modalTitu} conteModal={modalConte} isOpen={handleModal} />}
        </main>
    );
}