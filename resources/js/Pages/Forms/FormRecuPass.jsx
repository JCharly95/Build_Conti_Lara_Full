import { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import Modal from "../../Components/UI/Modal/Modal";
import Dialog from "../../Components/UI/Modal/Plantillas/Dialog";

export default function FormSoliRecuAcc(){
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

    // useEffect para monitorear los errores obtenidos en la validacion
    useEffect(() => {
        if (errors.codUser || errors.nomUser || errors.apePatUser || errors.apeMatUser || errors.dirCorUser) {
            let msgError = `${errors.codUser || ""}\n ${errors.nomUser || ""}\n ${errors.apePatUser || ""}\n ${errors.apeMatUser || ""}\n ${errors.dirCorUser || ""}\n`;

            setModalTitu("Error");
            setModalConte(<Dialog textMsg={msgError}/>);
            setModalOpen(true);
        }
    }, [errors]);

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    // Funcion de envio para validación y envio del formulario
    function submitRecuAccForm(event){
        event.preventDefault();
        // Enviar a la ruta de procesamiento en el back
        post('/valiSoliRecu');
    }

    /** Función para enviar interrumpir el proceso de recuperación antes de generar el link de acceso y redireccionamiento al login */
    function cancelRecu(){
        // Reestablecer los campos del formulario y mostrar el modal de cancelación
        reset();

        setModalTitu("Aviso de Cancelación");
        setModalConte(<Dialog textMsg="Su proceso de recuperación fue interrumpido."/>);
        setModalOpen(true);

        // Redireccionamiento hacia el login despues de 2.5 segundos
        setTimeout( () => ( router.visit('/', { method: 'get', replace: true }) ), 2500);
    }

    return(
        <section>
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
                        <input id="codiUser" type="text" value={data.codUser} onChange={(ev) => setData('codUser', ev.target.value)} placeholder="MXN-dddd"  autoComplete="on" className="shadow shadow-emerald-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
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
                    <button type="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3 cursor-pointer" onClick={cancelRecu}>Cancelar recuperación</button>
                </section>
            </form>
            { modalOpen && <Modal titModal={modalTitu} conteModal={modalConte} isOpen={handleModal}/> }
        </section>
    );
}