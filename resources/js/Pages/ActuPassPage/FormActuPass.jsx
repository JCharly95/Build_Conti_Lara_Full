import axios from "axios";
import { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import Modal from "../../Components/UI/Modal/Modal";
import Dialog from "../../Components/UI/Modal/Plantillas/Dialog";
import DialogCancelar from "../../Components/UI/Modal/Plantillas/DialogCancel";
import { Upload, Key, Eye, EyeOff } from "react-feather";

/** Función para renderizar el formulario para la solicitud de recuperación de acceso
 * @param {object} props - Objeto con las propiedades ingresadas para la visualización del formulario
 * @param {string} props.linkSoli - Enlace de recuperación generado por el sistema para la transacción de recuperación
 * @param {string} props.infoUser - Codigo y nombre del usuario que solicitó la recuperación
 * @returns {JSX.Element} Componente del formulario de solicitud para recuperación de acceso */
export default function FormActuContra({ infoSes }){
    let pageProps = usePage().props;
    console.log(infoSes);

     /* Variables de trabajo:
    Variable de estado para establecer tipo de campo en de la nueva contraseña
    Variable de estado para establecer tipo de campo en de la confirmación de la nueva contraseña
    Variable de estado para establecer el titulo a mostrar del boton nueva contraseña cuando se tenga el puntero encima de este
    Variable de estado para establecer el titulo a mostrar del boton confirmación nueva contraseña cuando se tenga el puntero encima de este
    Variable de estado para establecer el icono a mostrar del boton nueva contraseña cuando se tenga el puntero encima de este
    Variable de estado para establecer el icono a mostrar del boton confirmación nueva contraseña cuando se tenga el puntero encima de este
    Variables de estado para el modal: apertura y cierre, titulo, contenido del modal
    Hook para el formulario cortesia de inertia para poder controlar el estado de los campos del formulario */
    const [tipInputNuePas, setTipInputNuePas] = useState("password"),
    [tipInputConfNuePas, setTipInputConfNuePas] = useState("password"),
    [btnTipoNuePas, setBtnTipoNuePas] = useState("Mostrar Nueva Contraseña"),
    [btnTipoConfNuePas, setBtnTipoConfNuePas] = useState("Mostrar Confirmación de Contraseña"),
    [iconBtnNuePas, setIconBtnNuePas] = useState(<Eye id="ojo_abierto" color="black" size={30}/>),
    [iconBtnConfNuePas, setIconBtnConfNuePas] = useState(<Eye id="ojo_abierto" color="black" size={30}/>),
    [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false),
    { data, setData, post, delete: destroy, processing, errors, reset } = useForm({
        nueValContra: '',
        confNueValContra: ''
    });

    useEffect(() => {
        console.log(pageProps);
    },[pageProps]);

    // useEffect para monitorear los errores obtenidos en la validacion
    useEffect(() => {
        if (errors.nueValContra || errors.confNueValContra) {
            setModalTitu("Error");
            setModalConte(<Dialog textMsg={`${errors.nueValContra || ""}\n${errors.confNueValContra || ""}`}/>);
            setModalOpen(true);
        }
    }, [errors]);

    // Mostrar/Ocultar contraseña; campo nueva contraseña
    const verNuePass = () => {
        if(tipInputNuePas == "password") {
            setTipInputNuePas("text");
            setBtnTipoNuePas("Ocultar Nueva Contraseña")
            setIconBtnNuePas(<EyeOff id="ojo_cerrado" color="black" size={30}/>);
        } else {
            setTipInputNuePas("password");
            setBtnTipoNuePas("Mostrar Nueva Contraseña")
            setIconBtnNuePas(<Eye id="ojo_abierto" color="black" size={30}/>);
        }
    };

    // Mostrar/Ocultar contraseña; campo confimar contraseña
    const verConfirPass = () => {
        if(tipInputConfNuePas == "password") {
            setTipInputConfNuePas("text");
            setBtnTipoConfNuePas("Ocultar Confirmación de Contraseña")
            setIconBtnConfNuePas(<EyeOff id="ojo_cerrado" color="black" size={30}/>);
        } else {
            setTipInputConfNuePas("password");
            setBtnTipoConfNuePas("Mostrar Confirmación de Contraseña")
            setIconBtnConfNuePas(<Eye id="ojo_abierto" color="black" size={30}/>);
        }
    };

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    // Funcion para la obtención de la respuesta de confirmación para la cancelación y gestión del proceso en base a dicha respuesta
    const handleModalCancel = (valSelOpcCancel) => {
        // Evaluar, que decidio el usuario para saber si continuar con la cancelacion de recuperacion o no
        if(valSelOpcCancel) {
            // Reestablecer los campos del formulario
            reset();

            // Se canceló la recuperacion; se deberá eliminar el enlace utilizado para la petición
            destroy(`/borLinkActuPas/${linkSoli}/0`, {
                onSuccess: (page) => {
                    // Abrir el modal de aviso para la confirmación de cancelación
                    setModalTitu("Aviso de Cancelación");
                    setModalConte(<Dialog textMsg={page.props?.results || "Tu solicitud fue cancelada exitosamente."}/>);
                    setModalOpen(true);

                    // Cerrar el modal de aviso y cambiar por el formulario de acceso
                    setTimeout(() => {
                        setModalOpen(false);
                        chgForm('FormLogin');
                    }, 2500);
                },
                onError: (errors) => {
                    setModalTitu("Error");
                    setModalConte(<Dialog textMsg={errors?.linkSis || "Han ocurrido errores durante la cancelación del proceso"}/>);
                    setModalOpen(true);
                }
            });
        } else {
            // Se continuo con la recuperacion, por lo que solo se cerrará el modal de confirmacion de cancelación
            setModalOpen(false);
        }
    }

    // Funcion para validación y envio del formulario
    function submitActuContra(event){
        event.preventDefault();
        
        // Enviar el formulario a la ruta de procesamiento en el back junto con información no editable requerida en el proceso
        post('/valiActuContra', {
            codigo: infoUser.split("/")[0],
            nomPerso: infoUser.split("/")[1],
            linkSis: linkSoli
        });
    }

    /** Función para lanzar el modal de confirmación de cancelación en caso de que el usuario desee cancelar el proceso */
    function cancelRecu(){
        // Si se opta por cancelar la recuperacion, se lanzará un modal de confirmacion previo a realizar el cambio
        setModalTitu("Cancelar Recuperación de Contraseña");
        setModalConte(<DialogCancelar textMsg="¿Esta seguro de cancelar la recuperación de su contraseña?" opcSel={handleModalCancel} />);
        setModalOpen(true);
    }

    return(
        <section className="fixed inset-0 overflow-y-auto h-full w-full flex items-center justify-center">
            <section className="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                <section className="flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto">
                    <section className="flex justify-between items-center py-2 px-4 border-b-2">
                        <h3 className="font-bold text-gray-800 inline-flex items-center">
                            <Upload color="black" size={25} className="mr-2"/> <Key color="black" size={25} className="mr-2"/> Actualización de Contraseña para {/* infoUser.split("/")[1] */}
                        </h3>
                    </section>
                    <section className="lg:p-4 p-2 overflow-y-auto inline-flex">
                        <form onSubmit={submitActuContra} className="bg-white px-6">
                            <section className="flex flex-col items-center text-justify text-blue-700 text-sm mb-2">
                                <label className="text-sm font-bold text-gray-900">
                                    <p className="mb-2">Favor de ingresar su nueva contraseña tomando en cuenta las siguientes restricciones:</p>
                                    <ul className="list-disc text-red-600 pl-3">
                                        <li>Deberá contener al menos una letra minúscula</li>
                                        <li>Deberá contener al menos una letra mayúscula</li>
                                        <li>Deberá contener al menos un digito numérico</li>
                                        <li>Deberá contener al menos un carácter especial</li>
                                        <li>Deberá tener una longitud de entre 6 a 20 caracteres</li>
                                    </ul>
                                </label>
                            </section>
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="nueValContra" className="block text-sm text-gray-500 md:text-center mb-1 md:mb-0 pr-4">Nueva contraseña:</label>
                                </section>
                                <section className="md:w-2/3 flex justify-normal">
                                    <input id="nueValContra" type={tipInputNuePas} value={data.nueValContra} onChange={(ev) => setData('nueValContra', ev.target.value)} placeholder="******************" autoComplete="new-password"  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                    <button type="button" title={btnTipoNuePas} className="shadow appearance-none border rounded px-1 cursor-pointer" onClick={verNuePass}>{iconBtnNuePas}</button>
                                </section>
                            </section>            
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="confNueValContra" className="block text-sm text-gray-500 md:text-center mb-1 md:mb-0 pr-4">Confirmar Nueva contraseña:</label>
                                </section>
                                <section className="md:w-2/3 flex justify-normal">
                                    <input id="confNueValContra" type={tipInputConfNuePas} value={data.confNueValContra} onChange={(ev) => setData('confNueValContra', ev.target.value)} placeholder="******************" autoComplete="new-password"  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                    <button type="button" title={btnTipoConfNuePas} className="shadow appearance-none border rounded px-1 cursor-pointer" onClick={verConfirPass}>{iconBtnConfNuePas}</button>
                                </section>
                            </section>
                            <section className="flex items-center justify-center pt-1">
                                <button type="submit" disabled={processing} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3 cursor-pointer">Actualizar Contraseña</button>
                                <button type="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3 cursor-pointer" onClick={cancelRecu}>Cancelar Actualización</button>
                            </section>
                        </form>
                    </section>
                </section>
            </section>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}