import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Modal from "../../Modal/Modal";
import Dialog from "../../Modal/Plantillas/Dialog";
import { FileText } from "react-feather";

/** Función para renderizar el formulario para la solicitud de recuperación de acceso
 * @param {object} props - Objeto con las propiedades ingresadas para la visualización del formulario
 * @param {React.SetStateAction<string>} props.chgForm - Función para establecer el nombre del formulario a cambiar, mostrar o regresar
 * @returns {JSX.Element} Componente del formulario de solicitud para recuperación de acceso */
export default function FormSoliRecuAcc({ chgForm }){
    /* Variables de trabajo:
    Variables de estado para el modal: apertura y cierre, titulo, contenido del modal
    Hook para el formulario cortesia de inertia para poder controlar el estado de los campos del formulario */
    const [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false),
    { data, setData, post, processing, errors, reset } = useForm({
        codUser: '',
        nomUser: '',
        apePatUser: '',
        apeMatUser: '',
        dirCorUser: ''
    });

    // useEffect para monitorear los errores obtenidos en la validación
    useEffect(() => {
        if (errors.codUser || errors.nomUser || errors.apePatUser || errors.apeMatUser || errors.dirCorUser) {
            setModalTitu("Error");
            setModalConte(<Dialog textMsg={`${errors.codUser || ""}\n${errors.nomUser || ""}\n${errors.apePatUser || ""}\n${errors.apeMatUser || ""}\n${errors.dirCorUser || ""}`}/>);
            setModalOpen(true);
        }
    }, [errors]);

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    /** Función para validación y envio del formulario
     * @param {React.FormEventHandler<HTMLFormElement>} event - Evento del formulario con la información de este */
    function submitRecuAccForm(event){
        event.preventDefault();
        // Enviar a la ruta de procesamiento en el back
        post('/valiSoliRecu');
    }

    /** Función para interrumpir el proceso de recuperación antes de generar el link de acceso y redireccionamiento al login */
    function cancelSoliRecu(){
        // Reestablecer los campos del formulario y mostrar el modal de cancelación
        reset();

        setModalTitu("Aviso de Cancelación");
        setModalConte(<Dialog textMsg="Su proceso de recuperación fue interrumpido."/>);
        setModalOpen(true);

        setTimeout(() => {
            // Cerrar el modal de aviso y cambiar por el formulario de acceso
            setModalOpen(false);
            chgForm('FormLogin');
        }, 1000);
    }

    return(
        <section className="fixed inset-0 overflow-y-auto h-full w-full flex items-center justify-center">
            <section className="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                <section className="flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto">
                    <section className="flex justify-between items-center py-2 px-4 border-b-2">
                        <h3 className="font-bold text-gray-800 inline-flex items-center">
                            <FileText color="black" size={25} className="mr-2"/> Recuperar Contraseña
                        </h3>
                    </section>
                    <section className="lg:p-4 p-2 overflow-y-auto inline-flex">
                        <form onSubmit={submitRecuAccForm} className="bg-white px-6">
                            <section className="flex flex-col items-center text-justify text-blue-700 text-sm mb-2">
                                <label className="text-xl text-yellow-700">Disclaimer:</label>
                                <label>Con el propósito de asegurar que es realmente el usuario en cuestión quien quiere recuperar su contraseña se solicitarán datos personales <label className="text-red-600">(Se recomienda discreción)</label>.</label>
                            </section>
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="codiUser" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                                        Codigo de Usuario:
                                    </label>
                                </section>
                                <section className="md:w-2/3">
                                    <input id="codiUser" type="text" value={data.codUser} onChange={(ev) => setData('codUser', ev.target.value)} placeholder="MXN-dddd" autoComplete="on" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                </section>
                            </section>            
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="nomUser" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                                        Nombre(s):
                                    </label>
                                </section>
                                <section className="md:w-2/3">
                                    <input id="nomUser" type="text" value={data.nomUser} onChange={(ev) => setData('nomUser', ev.target.value)} placeholder="Ingrese su nombre" autoComplete="name" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                </section>
                            </section>
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="apePatUser" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-3">
                                        Apellido Paterno:
                                    </label>
                                </section>
                                <section className="md:w-2/3">
                                    <input id="apePatUser" type="text" value={data.apePatUser} onChange={(ev) => setData('apePatUser', ev.target.value)} placeholder="Ingrese su primer apellido" autoComplete="additional-name" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                </section>
                            </section>
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="apeMatUser" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-2">
                                        Apellido Materno:
                                    </label>
                                </section>
                                <section className="md:w-2/3">
                                    <input id="apeMatUser" type="text" value={data.apeMatUser} onChange={(ev) => setData('apeMatUser', ev.target.value)} placeholder="Ingrese su segundo apellido" autoComplete="family-name" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                </section>
                            </section>
                            <section className="md:flex md:items-center mb-2">
                                <section className="md:w-1/3">
                                    <label htmlFor="dirCorUser" className="block text-gray-500 md:text-center mb-1 md:mb-0 pr-4">
                                        Correo:
                                    </label>
                                </section>
                                <section className="md:w-2/3">
                                    <input id="dirCorUser" type="email" value={data.dirCorUser} onChange={(ev) => setData('dirCorUser', ev.target.value)} placeholder="alguien@ejemplo.com" autoComplete="email" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                                </section>
                            </section>
                            <section className="flex items-center justify-center pt-1">
                                <button type="submit" disabled={processing} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3 cursor-pointer">Solicitar recuperación</button>
                                <button type="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3 cursor-pointer" onClick={cancelSoliRecu}>Cancelar recuperación</button>
                            </section>
                        </form>
                    </section>
                </section>
            </section>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}