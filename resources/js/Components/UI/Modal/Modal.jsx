/* Importar todos los iconos de encabezado contemplados para usar en los modales */
import { AlertTriangle, AlertCircle, AlertOctagon, CheckCircle, FileText, Upload, Key, FilePlus, LogOut, Clock, Loader, Mail } from "react-feather";

/** Función para establecer el contenedor de los modales.
 * @param {Object} props - Objeto con las propiedades del modal.
 * @param {string} props.titModal - Cadena de texto con el título que se muestra en el modal.
 * @param {React.ReactNode} props.conteModal - Contenido que se renderiza dentro del modal.
 * @param {boolean} props.isOpen - Bandera booleana para mostrar u ocultar el modal.
 * @returns {JSX.Element} El componente modal renderizado. */
export default function Modal({ titModal, conteModal, isOpen }){
    // Establecer el icono a colocar en el encabezado del modal
    let icono = <></>;
    // Variable del contenido para el modal de carga
    let modalCarga = <section className="md:flex md:items-center justify-center">
        <section className="md:w-1/6 flex items-center justify-center">
            <Loader size={25} className="animate-spin"/>
        </section>
        <section className="md:w-5/6">
            { conteModal }
        </section>
    </section>;

    // Establecer el icono a mostrar en la cabecera del modal acorde al titulo del mensaje solicitado
    switch(titModal) {
        case "Aviso":
            icono = (<AlertCircle color="blue" size={25} className="mr-2"/>);
            break;
        case "Error":
            icono = (<AlertTriangle color="red" size={25} className="mr-2"/>);
            break;
        case "Acceso":
        case "Sensor Registrado":
        case "Contraseña Actualizada":
            icono = (<CheckCircle color="green" size={25} className="mr-2"/>);
            break;
        case "Recuperar Contraseña":
            icono = (<FileText color="black" size={25} className="mr-2"/>);
            break;
        case "Actualizar Contraseña":
            icono = (<><Upload color="black" size={25} className="mr-2"/> <Key color="black" size={25} className="mr-2"/></>);
            break;
        case "Cancelar Recuperación de Contraseña":
            icono = (<AlertOctagon color="red" size={25} className="mr-2"/>);
            break;
        case "Aviso de Cancelación":
            icono = (<AlertTriangle color="red" size={25} className="mr-2"/>);
            break;
        case "Agregar Sensor":
            icono = (<FilePlus color="black" size={25} className="mr-2"/>);
            break;
        case "Cerrar Sesión":
            icono = (<LogOut color="black" size={25} className="mr-2"/>);
            break;
        case "Cargando":
        case "Recordatorio":
            icono = (<Clock color="black" size={25} className="mr-2"/>);
            break;
        case "Correo Enviado":
            icono = (<Mail color="black" size={25} className="mr-2"/>);
            break;
    }

    return(
        <section className="fixed inset-0 bg-gray-600/70 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <section className="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                <section className="flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto">
                    <section className="flex justify-between items-center py-2 px-4 border-b-2">
                        <h3 className="font-bold text-gray-800 inline-flex items-center">
                            { icono } { titModal }
                        </h3>
                        <button type="button" className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-red-500 hover:text-white focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer" aria-label="Close" onClick={() => (isOpen(false))}>
                            <span className="sr-only">Cerrar Modal</span>
                            <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                            </svg>
                        </button>
                    </section>
                    <section className="p-4 overflow-y-auto inline-flex">
                        { (titModal == "Cargando") ? modalCarga : conteModal }
                    </section>
                </section>
            </section>
        </section>
    );
}