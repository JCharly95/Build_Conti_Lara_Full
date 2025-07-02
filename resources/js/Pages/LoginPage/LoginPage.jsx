import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Eye, EyeOff } from "react-feather";
import Modal from "../../Components/UI/Modal/Modal";
import Dialog from "../../Components/UI/Modal/Plantillas/Dialog";
import FormAcc from "../Forms/FormLogin";
import FormSoliRecuAcc from "../Forms/FormRecuPass";

/** Funcion para renderizar el componente que contiene la pagina con el formulario de login
 * @returns {JSX.Element} Pagina de login renderizada */
export default function LoginPage({ msgResp, errores }){
    const [formActivo, setFormActivo] = useState('FormLogin'),
    [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false);

    /* Variables de trabajo:
    Variable de estado para establecer tipo de campo en la contraseña en el login
    Variable de estado para establecer el icono a mostrar en el boton de mostrar contraseña
    Variable de estado para establecer el titulo a mostrar del boton cuando se tenga el puntero encima de este
    Variables de estado para el modal: titulo, contenido del modal y visibilidad del mismo
    Hook para el formulario cortesia de inertia para poder controlar el estado de los campos del formulario
    const [tipInputPas, setTipInputPas] = useState("password"),
    [iconBtnPas, setIconBtnPas] = useState(<Eye id="ojo_abierto" color="black" size={30}/>),
    [btnTitulo, setBtnTitulo] = useState("Mostrar Contraseña"),
    [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(""),
    [modalOpen, setModalOpen] = useState(false),
    { data, setData, post, processing, errors } = useForm({
        dirCorr: '',
        valPass: ''
    }); */

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
        return () => {
            window.removeEventListener("popstate", handleBack);
        };
    },[]);

    // useEffect para monitorear los errores obtenidos en la validacion
    useEffect(() => {
        if(msgResp){
            console.log(msgResp);
            setModalTitu("Correo Enviado");
            setModalConte(<Dialog textMsg={msgResp}/>);
            setModalOpen(true);
        }

        if(errores){
            console.log(errores);
            setModalTitu("Error");
            setModalConte(<Dialog textMsg={`${errores}`}/>);
            setModalOpen(true);
        }
    }, [msgResp, errores]);

    /* Mostrar/Ocultar contraseña
    const verPass = () => {
        if(tipInputPas == "password") {
            setTipInputPas("text");
            setBtnTitulo("Ocultar Contraseña");
            setIconBtnPas(<EyeOff id="ojo_cerrado" color="black" size={30}/>);
        } else {
            setTipInputPas("password");
            setBtnTitulo("Mostrar Contraseña");
            setIconBtnPas(<Eye id="ojo_abierto" color="black" size={30}/>);
        }
    };
    
    // Funcion de envio para validacion y envio del formulario (refabricada para la incorporación del hook)
    function submitLogForm(event){
        event.preventDefault();
        post('/valiLog');
    }*/
    
    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    // Ver el formulario de login
    const verFormLogin = (valorSelec) => ( setFormActivo(valorSelec) );

    // Ver el formulario para la solicitud de la recuperación de la información
    const verFormSoliRecu = (valorSelec) => ( setFormActivo(valorSelec) );
    
    return(
        <section>
            {formActivo === 'FormLogin' && <FormAcc chgForm={verFormLogin}/>}
            {formActivo === 'FormSoliRecuAcc' && <FormSoliRecuAcc chgForm={verFormSoliRecu} />}
            {modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/>}
        </section>
    );
}