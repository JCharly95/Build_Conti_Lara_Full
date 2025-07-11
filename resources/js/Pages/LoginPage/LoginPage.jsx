import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import Modal from "../../Components/UI/Modal/Modal";
import Dialog from "../../Components/UI/Modal/Plantillas/Dialog";
import FormAcceso from "../Forms/FormLogin";
import FormSoliRecuAcc from "../Forms/FormSoliRecuPass";

/** Funcion para renderizar el componente que contiene los formularios fuera de la sesión del sistema
 * @param {object} props - Objeto con las propiedades ingresadas para la visualización de la pagina
 * @param {string} props.msgResp - Mensaje con el resultado obtenido de un proceso satisfactorio cuando este redireccione hacia el login
 * @param {string} props.errores - Mensaje con los errores obtenidos durante un proceso y este redireccione hacia el login
 * @returns {JSX.Element} Componente de la pagina de login o formularios exteriores a la sesión del sistema. */
export default function LoginPage({ msgResp, errores }){
    /* Variables de trabajo:
    Variable de estado para determinar el formulario a mostrar
    Variables de estado para el modal: titulo, contenido del modal y visibilidad del mismo */
    const [formActivo, setFormActivo] = useState('FormLogin'),
    [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false);

    // Crear un hook para evitar un retroceso de pagina cuando se encuentre en el login, porque aqui se regresara de la recuperacion y el cierre de sesion
    useEffect(() => {
        // Agregar un "registro nuevo vacio" al historial de navegacion en la ubicacion actual. PD: Seria el equivalente a window.location en el mismo documento
        window.history.pushState(null, "", window.location.pathname);
        // Funcion para gestionar la solicitud de regreso
        const handleBack = () => {
            // Crear y abrir un modal de error de solicitud
            setModalTitu("Error");
            setModalConte(<Dialog textMsg="El sitio a donde deseas regresar ya no esta disponible."/>);
            setModalOpen(true);
        };
        // Agregar un listener al evento de retroceso de navegacion
        window.addEventListener("popstate", handleBack);
        // Remover el listener del evento en el return de la funcion con el fin de mantener el rendimiento del sitio
        return () => ( window.removeEventListener("popstate", handleBack) );
    },[]);

    // useEffect para monitorear el resultado obtenido de procesos con resultados satisfactorios y que redirigiran hacia esta pagina, asi como, los errores obtenidos en procesos que tambien redirijan hacia esta pagina 
    useEffect(() => {
        if(msgResp){
            // Mostrar el modal de aviso satisfactorio para solicitud de recuperación realizada
            if(msgResp.includes("Correo de recuperación enviado")) {
                setModalTitu("Correo Enviado");
                setModalConte(<Dialog textMsg={msgResp}/>);
                setModalOpen(true);

                setTimeout(() => {
                    setModalOpen(false);
                    verFormSoliRecu('FormLogin');
                }, 4000);
            }

            // Mostrar el modal de aviso satisfactorio para acceso concedido
            if(msgResp.includes("Acceso concedido")) {
                setModalTitu("Acceso");
                setModalConte(<Dialog textMsg="Bienvenido a Building Continuity"/>);
                setModalOpen(true);
                
                // Redireccionamiento hacia la grafica despues de 2.5 segundos
                setTimeout( () => ( router.get('/grafica', {}, { replace: true }) ), 2500);
            }
        }

        // Mostrar el modal de errores con los errores generados durante los procesos correspondientes
        if(errores) {
            setModalTitu("Error");
            setModalConte(<Dialog textMsg={`${errores}`}/>);
            setModalOpen(true);
        }
    }, [msgResp, errores]);
    
    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    // Ver el formulario de login
    const verFormLogin = (valorSelec) => ( setFormActivo(valorSelec) );

    // Ver el formulario para la solicitud de la recuperación de acceso
    const verFormSoliRecu = (valorSelec) => ( setFormActivo(valorSelec) );
    
    return(
        <section>
            {formActivo === 'FormLogin' && <FormAcceso chgForm={verFormLogin}/>}
            {formActivo === 'FormSoliRecuAcc' && <FormSoliRecuAcc chgForm={verFormSoliRecu} />}
            {modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/>}
        </section>
    );
}