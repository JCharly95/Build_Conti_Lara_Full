import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import PagesLayout from "../../Layouts/PagesLayout/PagesLayout";
import Modal from "../../Components/UI/Modal/Modal";
import Dialog from "../../Components/UI/Modal/Plantillas/Dialog";
import FormRegiSensor from "../../Components/UI/Forms/Internos/RegiSensor/FormRegiSen";

/** Función para renderizar la pagina contenedora de los formularios internos del sistema
 * @param {object} props - Objeto con las propiedades ingresadas para la visualización de la pagina
 * @param {string} props.nomFormVer - Cadena de texto con el nombre del formulario a renderizar
 * @param {string} props.msgConclu - Mensaje con el resultado obtenido de un proceso satisfactorio cuando termine el proceso
 * @returns {JSX.Element} Pagina con el formulario a mostrar */
function ContenedorFormulariosPage({ nomFormVer, msgConclu }){
    /* Variables de trabajo:
    Variables de estado para el modal: titulo, contenido del modal y visibilidad del mismo */
    const [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false);

    // useEffect para monitorear el resultado obtenido de procesos con resultados satisfactorios y que redirigiran hacia esta pagina
    useEffect(() => {
        if(msgConclu) {
            // Mostrar el modal de aviso satisfactorio para registro completado
            if(msgConclu.includes("registrado exitosamente")) {
                setModalTitu("Sensor Registrado");
                setModalConte(<Dialog textMsg={msgConclu}/>);
                setModalOpen(true);
                
                // Redireccionamiento hacia la grafica despues de 2.5 segundos
                setTimeout( () => ( router.get('/grafica', {}, { replace: true }) ), 2500);
            }
        }
    }, [msgConclu]);
    
    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    return(
        <section>
            {nomFormVer === 'Registro_Sensor' && <FormRegiSensor />}
            {modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/>}
        </section>
    );
}

// Establecer PagesLayout como el layout que contendrá a esta pagina
ContenedorFormulariosPage.layout = (page) => <PagesLayout children={page} />
export default ContenedorFormulariosPage;